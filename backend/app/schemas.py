from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


InteractionStatus = Literal["Pending", "Completed"]


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class InteractionCreate(BaseModel):
    doctor_name: str = Field(min_length=1, max_length=255)
    hospital: str = Field(min_length=1, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    visit_date: date
    purpose: str = Field(min_length=1, max_length=255)
    discussion: str = Field(min_length=1)
    summary: str | None = None
    follow_up_date: date | None = None
    status: InteractionStatus = "Pending"

    @field_validator("doctor_name", "hospital", "purpose", "discussion", "specialization", "summary")
    @classmethod
    def strip_text_fields(cls, value: str | None) -> str | None:
        return _clean_text(value)


class InteractionUpdate(BaseModel):
    doctor_name: str | None = Field(default=None, max_length=255)
    hospital: str | None = Field(default=None, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)
    visit_date: date | None = None
    purpose: str | None = Field(default=None, max_length=255)
    discussion: str | None = None
    summary: str | None = None
    follow_up_date: date | None = None
    status: InteractionStatus | None = None

    @field_validator("doctor_name", "hospital", "purpose", "discussion", "specialization", "summary")
    @classmethod
    def strip_text_fields(cls, value: str | None) -> str | None:
        return _clean_text(value)


class InteractionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    doctor_name: str
    hospital: str
    specialization: str | None
    visit_date: date
    purpose: str
    discussion: str
    summary: str | None
    follow_up_date: date | None
    status: InteractionStatus
    created_at: datetime
    updated_at: datetime


class DashboardBucket(BaseModel):
    count: int
    items: list[InteractionRead]


class DashboardSummary(BaseModel):
    total_interactions: int
    todays_interactions: DashboardBucket
    pending_follow_ups: DashboardBucket
    completed_visits: DashboardBucket
    recent_interactions: list[InteractionRead]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    interaction_id: int | None = None
    context: str | None = None


class ChatResponse(BaseModel):
    reply: str
    intent: str
    tool: str
    entities: dict[str, Any] | None = None
    summary: str | None = None
    interaction: InteractionRead | None = None
