from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, Field

from . import database

ROOT_DIR = Path(__file__).resolve().parents[2]
SCENARIOS_PATH = ROOT_DIR / "backend" / "data" / "scenarios.json"


class StartUserRequest(BaseModel):
    name: str | None = None
    student_code: str | None = None


class StartUserResponse(BaseModel):
    user_id: str
    group_assigned: str


class ResponseLogRequest(BaseModel):
    user_id: str
    scenario_id: int = Field(ge=1)
    user_decision: str = Field(pattern="^(agree|reject)$")
    time_spent_seconds: float = Field(ge=0)
    is_correct_on_error_case: bool | None = None


class SurveyRequest(BaseModel):
    user_id: str
    nasa_tlx: dict[str, int]


app = FastAPI(title="XAI KLTN Experiment API", version="0.1.0")


def load_scenarios() -> list[dict]:
    with SCENARIOS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


@app.on_event("startup")
def on_startup() -> None:
    database.init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/scenarios")
def get_scenarios() -> dict[str, list[dict]]:
    return {"scenarios": load_scenarios()}


@app.post("/api/users/start", response_model=StartUserResponse)
def start_user(payload: StartUserRequest) -> StartUserResponse:
    user = database.create_user(name=payload.name, student_code=payload.student_code)
    return StartUserResponse(**user)


@app.post("/api/users/{user_id}/finish")
def finish_user(user_id: str) -> dict[str, str]:
    updated = database.finish_user(user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="user not found")
    return {"status": "finished"}


@app.post("/api/responses")
def create_response_log(payload: ResponseLogRequest) -> dict[str, str]:
    try:
        database.save_response(
            user_id=payload.user_id,
            scenario_id=payload.scenario_id,
            user_decision=payload.user_decision,
            time_spent_seconds=payload.time_spent_seconds,
            is_correct_on_error_case=payload.is_correct_on_error_case,
        )
    except Exception as exc:  # sqlite integrity error
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "saved"}


@app.post("/api/survey")
def create_survey_log(payload: SurveyRequest) -> dict[str, str]:
    try:
        database.save_survey(user_id=payload.user_id, answers=payload.nasa_tlx)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "saved"}


@app.get("/admin/export")
def admin_export() -> Response:
    csv_content = database.export_csv()
    return Response(content=csv_content, media_type="text/csv")
