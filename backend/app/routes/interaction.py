from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from .. import crud
from ..dependencies import get_db
from ..schemas import InteractionCreate, InteractionRead, InteractionUpdate
from ..services.notifications import build_notification_payload


router = APIRouter(prefix="/interactions", tags=["interactions"])


async def _broadcast_event(request: Request, event_type: str, interaction) -> None:
    notifier = getattr(request.app.state, "notifier", None)
    if notifier is not None:
        interaction_payload = jsonable_encoder(interaction)
        doctor_name = interaction_payload.get("doctor_name", "Unknown doctor")
        hospital = interaction_payload.get("hospital", "Unknown hospital")

        title_map = {
            "interaction.created": "New interaction logged",
            "interaction.updated": "Interaction updated",
            "interaction.deleted": "Interaction deleted",
        }
        message_map = {
            "interaction.created": f"{doctor_name} at {hospital} was added successfully.",
            "interaction.updated": f"{doctor_name} at {hospital} was updated successfully.",
            "interaction.deleted": f"{doctor_name} at {hospital} was removed from the CRM.",
        }

        await notifier.broadcast(
            build_notification_payload(
                event_type=event_type,
                title=title_map.get(event_type, "CRM update"),
                message=message_map.get(event_type, "A CRM record changed."),
                interaction=interaction_payload,
                metadata={
                    "event": event_type,
                    "source": "interaction_api",
                },
            )
        )


@router.get("", response_model=list[InteractionRead])
def list_interactions(
    db: Session = Depends(get_db),
    status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int | None = None,
):
    return crud.get_interactions(
        db,
        status=status,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/{interaction_id}", response_model=InteractionRead)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    return crud.get_interaction(db, interaction_id)


@router.post("", response_model=InteractionRead, status_code=201)
async def create_interaction(
    payload: InteractionCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    interaction = crud.create_interaction(db, payload)
    await _broadcast_event(request, "interaction.created", interaction)
    return interaction


@router.put("/{interaction_id}", response_model=InteractionRead)
async def update_interaction(
    interaction_id: int,
    payload: InteractionUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    if not payload.model_dump(exclude_unset=True):
        raise HTTPException(status_code=400, detail="At least one field is required.")

    interaction = crud.update_interaction(db, interaction_id, payload)
    await _broadcast_event(request, "interaction.updated", interaction)
    return interaction


@router.delete("/{interaction_id}", status_code=204)
async def delete_interaction(
    interaction_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    interaction = crud.delete_interaction(db, interaction_id)
    await _broadcast_event(request, "interaction.deleted", interaction)
    return Response(status_code=204)
