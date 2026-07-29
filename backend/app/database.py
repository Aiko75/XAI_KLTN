from __future__ import annotations

import csv
import io
import random
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[2]
DB_PATH = ROOT_DIR / "backend" / "experiment.db"


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    student_code TEXT,
    group_assigned TEXT NOT NULL CHECK(group_assigned IN ('A', 'B', 'C')),
    start_time TEXT NOT NULL,
    end_time TEXT
);

CREATE TABLE IF NOT EXISTS response_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    scenario_id INTEGER NOT NULL,
    user_decision TEXT NOT NULL CHECK(user_decision IN ('agree', 'reject')),
    time_spent_seconds REAL NOT NULL CHECK(time_spent_seconds >= 0),
    is_correct_on_error_case INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS survey_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    question_key TEXT NOT NULL,
    score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 7),
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);
"""


NASA_TLX_KEYS = {
    "mental_demand",
    "temporal_demand",
    "performance",
    "effort",
    "frustration",
    "overall_load",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA_SQL)


def choose_group(conn: sqlite3.Connection) -> str:
    rows = conn.execute(
        "SELECT group_assigned, COUNT(*) AS count FROM users GROUP BY group_assigned"
    ).fetchall()
    counts = {"A": 0, "B": 0, "C": 0}
    for row in rows:
        counts[row["group_assigned"]] = int(row["count"])

    min_count = min(counts.values())
    least_filled_groups = [group for group, count in counts.items() if count == min_count]
    return random.choice(least_filled_groups)


def create_user(name: str | None, student_code: str | None) -> dict[str, Any]:
    user_id = f"u_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
    with get_connection() as conn:
        group_assigned = choose_group(conn)
        conn.execute(
            """
            INSERT INTO users(user_id, name, student_code, group_assigned, start_time)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, name, student_code, group_assigned, utc_now()),
        )
    return {"user_id": user_id, "group_assigned": group_assigned}


def finish_user(user_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.execute(
            "UPDATE users SET end_time = ? WHERE user_id = ?",
            (utc_now(), user_id),
        )
    return cursor.rowcount > 0


def save_response(
    user_id: str,
    scenario_id: int,
    user_decision: str,
    time_spent_seconds: float,
    is_correct_on_error_case: bool | None,
) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO response_logs(
                user_id, scenario_id, user_decision, time_spent_seconds, is_correct_on_error_case, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                scenario_id,
                user_decision,
                time_spent_seconds,
                None if is_correct_on_error_case is None else int(is_correct_on_error_case),
                utc_now(),
            ),
        )


def save_survey(user_id: str, answers: dict[str, int]) -> None:
    unknown = set(answers) - NASA_TLX_KEYS
    if unknown:
        raise ValueError(f"Unsupported NASA-TLX keys: {', '.join(sorted(unknown))}")

    for score in answers.values():
        if score < 1 or score > 7:
            raise ValueError("NASA-TLX score must be in range 1..7")

    with get_connection() as conn:
        conn.executemany(
            """
            INSERT INTO survey_logs(user_id, question_key, score, created_at)
            VALUES (?, ?, ?, ?)
            """,
            [(user_id, key, score, utc_now()) for key, score in answers.items()],
        )


def export_csv() -> str:
    with get_connection() as conn:
        users = conn.execute("SELECT * FROM users ORDER BY start_time").fetchall()
        responses = conn.execute(
            "SELECT * FROM response_logs ORDER BY user_id, scenario_id"
        ).fetchall()
        surveys = conn.execute(
            "SELECT * FROM survey_logs ORDER BY user_id, question_key"
        ).fetchall()

    users_header = ["user_id", "name", "student_code", "group_assigned", "start_time", "end_time"]
    responses_header = [
        "id",
        "user_id",
        "scenario_id",
        "user_decision",
        "time_spent_seconds",
        "is_correct_on_error_case",
        "created_at",
    ]
    survey_header = ["id", "user_id", "question_key", "score", "created_at"]

    def safe_cell(value: Any) -> str:
        text = "" if value is None else str(value)
        if text.startswith(("=", "+", "-", "@")):
            return f"'{text}"
        return text

    output = io.StringIO()
    writer = csv.writer(output)

    def block(title: str, header: list[str], rows: list[sqlite3.Row]) -> None:
        writer.writerow([title])
        writer.writerow(header)
        for row in rows:
            writer.writerow([safe_cell(row[h]) for h in header])
        writer.writerow([])

    block("[users]", users_header, users)
    block("[response_logs]", responses_header, responses)
    block("[survey_logs]", survey_header, surveys)

    return output.getvalue()
