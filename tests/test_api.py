from pathlib import Path

from fastapi.testclient import TestClient

from backend.app import database
from backend.app.main import app


def setup_test_db(tmp_path: Path) -> None:
    database.DB_PATH = tmp_path / "test_experiment.db"
    database.init_db()


def test_scenarios_are_precomputed_and_complete(tmp_path: Path) -> None:
    setup_test_db(tmp_path)
    client = TestClient(app)

    response = client.get("/api/scenarios")
    assert response.status_code == 200

    scenarios = response.json()["scenarios"]
    assert len(scenarios) == 20
    assert sum(1 for item in scenarios if item["scenario_type"] == "trap") == 4
    assert sum(1 for item in scenarios if item["scenario_type"] == "attention_check") == 2


def test_user_flow_logging_and_export(tmp_path: Path) -> None:
    setup_test_db(tmp_path)
    client = TestClient(app)

    start = client.post("/api/users/start", json={"name": "Test", "student_code": "SV001"})
    assert start.status_code == 200
    user = start.json()
    assert user["group_assigned"] in {"A", "B", "C"}

    user_id = user["user_id"]
    save_response = client.post(
        "/api/responses",
        json={
            "user_id": user_id,
            "scenario_id": 1,
            "user_decision": "agree",
            "time_spent_seconds": 3.8,
            "is_correct_on_error_case": True,
        },
    )
    assert save_response.status_code == 200

    save_survey = client.post(
        "/api/survey",
        json={
            "user_id": user_id,
            "nasa_tlx": {
                "mental_demand": 5,
                "temporal_demand": 4,
                "performance": 6,
                "effort": 5,
                "frustration": 3,
                "overall_load": 5,
            },
        },
    )
    assert save_survey.status_code == 200

    finish = client.post(f"/api/users/{user_id}/finish")
    assert finish.status_code == 200

    exported = client.get("/admin/export")
    assert exported.status_code == 200
    body = exported.text
    assert "[users]" in body
    assert "[response_logs]" in body
    assert "[survey_logs]" in body
    assert user_id in body


def test_survey_rejects_invalid_range(tmp_path: Path) -> None:
    setup_test_db(tmp_path)
    client = TestClient(app)

    start = client.post("/api/users/start", json={})
    user_id = start.json()["user_id"]

    invalid = client.post(
        "/api/survey",
        json={"user_id": user_id, "nasa_tlx": {"mental_demand": 10}},
    )
    assert invalid.status_code == 400
    assert "1..7" in invalid.json()["detail"]
