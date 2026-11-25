"""Reproducible descriptive analysis for the phase-2 experiment exports."""

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path


THRESHOLD_SECONDS = {"A": 2.0, "B": 3.0, "C": 4.0}
TRAP_SCENARIOS = {1, 8, 11, 16}
WORKLOAD_KEYS = (
    "mental_demand",
    "temporal_demand",
    "performance",
    "effort",
    "frustration",
    "overall_load",
)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def valid_prefix(rows: list[dict[str, str]], threshold: float) -> list[dict[str, str]]:
    """Remove the first and later rows of a three-fast-response sequence."""
    below_run = 0
    for index, row in enumerate(rows):
        if float(row["time_spent_seconds"]) < threshold:
            below_run += 1
        else:
            below_run = 0
        if below_run == 3:
            return rows[: index - 2]
    return rows


def mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def build_analysis(csv_dir: Path) -> dict:
    users = read_csv(csv_dir / "users_rows.csv")
    responses = read_csv(csv_dir / "response_logs_rows.csv")
    surveys = read_csv(csv_dir / "survey_logs_rows.csv")
    scenario_file = csv_dir.parents[2] / "src" / "data" / "scenarios.json"
    scenarios = {
        str(item["scenario_id"]): item
        for item in json.loads(scenario_file.read_text(encoding="utf-8"))["scenarios"]
    }

    user_by_id = {row["user_id"]: row for row in users}
    registered_by_group = Counter(row["group_assigned"] for row in users)
    completed = [row for row in users if row["end_time"].strip()]
    completed_by_group = Counter(row["group_assigned"] for row in completed)

    response_by_user: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in responses:
        if row["user_id"] in user_by_id:
            response_by_user[row["user_id"]].append(row)

    retained_rows: dict[str, list[dict[str, str]]] = {}
    retained_by_group = Counter()
    for user in completed:
        group = user["group_assigned"]
        rows = sorted(
            response_by_user[user["user_id"]],
            key=lambda row: (int(row["scenario_id"]), row["created_at"]),
        )
        rows = valid_prefix(rows, THRESHOLD_SECONDS[group])
        if len(rows) >= 10:
            retained_rows[user["user_id"]] = rows
            retained_by_group[group] += 1

    def decision_summary(user_rows: dict[str, list[dict[str, str]]]) -> dict:
        summary = {
            group: {
                "ai_correct": {"correct": 0, "denominator": 0},
                "ai_wrong": {"correct": 0, "denominator": 0},
                "all_scenarios": {"correct": 0, "denominator": 0},
            }
            for group in THRESHOLD_SECONDS
        }
        for user_id, rows in user_rows.items():
            group = user_by_id[user_id]["group_assigned"]
            for row in rows:
                scenario_type = scenarios[row["scenario_id"]]["scenario_type"]
                category = "ai_correct" if scenario_type == "normal" else "ai_wrong"
                expected_action = "agree" if category == "ai_correct" else "reject"
                is_correct = row["user_decision"] == expected_action
                for bucket in (category, "all_scenarios"):
                    summary[group][bucket]["denominator"] += 1
                    summary[group][bucket]["correct"] += int(is_correct)
        for group in summary:
            for values in summary[group].values():
                values["rate_percent"] = round(100 * values["correct"] / values["denominator"], 1) if values["denominator"] else None
        return summary

    completed_rows = {
        user["user_id"]: sorted(
            response_by_user[user["user_id"]], key=lambda row: (int(row["scenario_id"]), row["created_at"])
        )
        for user in completed
    }

    trap_stats = {
        group: {"correct": 0, "denominator": 0}
        for group in THRESHOLD_SECONDS
    }
    scenario_stats: dict[str, dict] = {}
    interaction_values = {
        group: {"time_seconds": [], "hover_count": [], "chat_count": [], "interactive_clicks": []}
        for group in THRESHOLD_SECONDS
    }
    scenario_group_rows: dict[tuple[int, str], list[dict[str, str]]] = defaultdict(list)

    for user_id, rows in retained_rows.items():
        group = user_by_id[user_id]["group_assigned"]
        for row in rows:
            scenario_id = int(row["scenario_id"])
            scenario_group_rows[(scenario_id, group)].append(row)
            interaction_values[group]["time_seconds"].append(float(row["time_spent_seconds"]))
            interaction_values[group]["hover_count"].append(float(row["hover_count"]))
            interaction_values[group]["chat_count"].append(float(row["chat_count"]))
            interaction_values[group]["interactive_clicks"].append(float(row["interactive_clicks"]))
            if scenario_id in TRAP_SCENARIOS and row["is_correct_on_error_case"].strip():
                trap_stats[group]["denominator"] += 1
                trap_stats[group]["correct"] += row["is_correct_on_error_case"].lower() == "true"

    for scenario_id in range(1, 21):
        scenario_stats[str(scenario_id)] = {}
        for group in THRESHOLD_SECONDS:
            rows = scenario_group_rows[(scenario_id, group)]
            decision_counts = Counter(row["user_decision"] for row in rows)
            scenario_stats[str(scenario_id)][group] = {
                "valid_responses": len(rows),
                "agree": decision_counts["agree"],
                "reject": decision_counts["reject"],
                "mean_time_seconds": mean([float(row["time_spent_seconds"]) for row in rows]),
            }

    workload_values = {
        group: {key: [] for key in WORKLOAD_KEYS}
        for group in THRESHOLD_SECONDS
    }
    retained_user_ids = set(retained_rows)
    for row in surveys:
        if row["user_id"] not in retained_user_ids or row["question_key"] not in WORKLOAD_KEYS:
            continue
        group = user_by_id[row["user_id"]]["group_assigned"]
        workload_values[group][row["question_key"]].append(float(row["score"]))

    return {
        "sample_flow": {
            "registered_total": len(users),
            "registered_by_group": dict(sorted(registered_by_group.items())),
            "completed_total": len(completed),
            "completed_by_group": dict(sorted(completed_by_group.items())),
            "retained_total": sum(retained_by_group.values()),
            "retained_by_group": dict(sorted(retained_by_group.items())),
            "excluded_after_cleaning": {
                group: completed_by_group[group] - retained_by_group[group]
                for group in THRESHOLD_SECONDS
            },
        },
        "trap_detection": {
            group: {
                **values,
                "rate_percent": round(100 * values["correct"] / values["denominator"], 1)
                if values["denominator"]
                else None,
            }
            for group, values in trap_stats.items()
        },
        "decision_accuracy": {
            "raw": decision_summary(completed_rows),
            "cleaned": decision_summary(retained_rows),
        },
        "scenario_summary": scenario_stats,
        "interaction_summary": {
            group: {metric: mean(values) for metric, values in metrics.items()}
            for group, metrics in interaction_values.items()
        },
        "workload_summary": {
            group: {metric: mean(values) for metric, values in metrics.items()}
            for group, metrics in workload_values.items()
        },
    }


def main() -> None:
    data_dir = Path(__file__).resolve().parents[2] / "data" / "2nd test" / "csv"
    analysis = build_analysis(data_dir)
    output = Path(__file__).with_name("phase2_analysis.json")
    output.write_text(json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(analysis["sample_flow"], ensure_ascii=False))


if __name__ == "__main__":
    main()
