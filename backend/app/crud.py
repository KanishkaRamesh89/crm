from __future__ import annotations

from datetime import date

from fastapi import HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .models import Interaction
from .schemas import InteractionCreate, InteractionUpdate


def _commit(db: Session) -> None:
    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database operation failed.") from exc


def get_interactions(
    db: Session,
    *,
    status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int | None = None,
) -> list[Interaction]:
    statement = select(Interaction).order_by(Interaction.created_at.desc())

    if status:
        statement = statement.where(Interaction.status == status)

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Interaction.doctor_name.ilike(pattern),
                Interaction.hospital.ilike(pattern),
                Interaction.specialization.ilike(pattern),
                Interaction.purpose.ilike(pattern),
                Interaction.discussion.ilike(pattern),
                Interaction.summary.ilike(pattern),
            )
        )

    if skip:
        statement = statement.offset(skip)

    if limit is not None:
        statement = statement.limit(limit)

    return list(db.scalars(statement).all())


def get_interaction(db: Session, interaction_id: int) -> Interaction:
    interaction = db.get(Interaction, interaction_id)
    if interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found.")
    return interaction


def create_interaction(db: Session, payload: InteractionCreate) -> Interaction:
    interaction = Interaction(**payload.model_dump())
    db.add(interaction)
    _commit(db)
    db.refresh(interaction)
    return interaction


def update_interaction(db: Session, interaction_id: int, payload: InteractionUpdate) -> Interaction:
    interaction = get_interaction(db, interaction_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field_name, field_value in update_data.items():
        setattr(interaction, field_name, field_value)

    _commit(db)
    db.refresh(interaction)
    return interaction


def delete_interaction(db: Session, interaction_id: int) -> Interaction:
    interaction = get_interaction(db, interaction_id)
    db.delete(interaction)
    _commit(db)
    return interaction


def get_total_interactions(db: Session) -> int:
    statement = select(func.count()).select_from(Interaction)
    return db.scalar(statement) or 0


def get_todays_interactions(db: Session, today: date) -> list[Interaction]:
    statement = (
        select(Interaction)
        .where(Interaction.visit_date == today)
        .order_by(Interaction.created_at.desc())
    )
    return list(db.scalars(statement).all())


def get_pending_follow_ups(db: Session, today: date) -> list[Interaction]:
    statement = (
        select(Interaction)
        .where(
            Interaction.status == "Pending",
            Interaction.follow_up_date.is_not(None),
            Interaction.follow_up_date >= today,
        )
        .order_by(Interaction.follow_up_date.asc(), Interaction.created_at.desc())
    )
    return list(db.scalars(statement).all())


def get_completed_visits(db: Session) -> list[Interaction]:
    statement = (
        select(Interaction)
        .where(Interaction.status == "Completed")
        .order_by(Interaction.created_at.desc())
    )
    return list(db.scalars(statement).all())


def get_recent_interactions(db: Session, limit: int = 5) -> list[Interaction]:
    statement = select(Interaction).order_by(Interaction.created_at.desc()).limit(limit)
    return list(db.scalars(statement).all())
