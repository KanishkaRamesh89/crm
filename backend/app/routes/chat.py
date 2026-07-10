from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..schemas import ChatRequest, ChatResponse
from ..services.chat_service import process_chat_message
from ..services.notifications import build_notification_payload


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat_endpoint(
    payload: ChatRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    response = process_chat_message(db, payload)

    if response.interaction is not None:
        notifier = getattr(request.app.state, "notifier", None)
        if notifier is not None:
            interaction_payload = jsonable_encoder(response.interaction)
            await notifier.broadcast(
                build_notification_payload(
                    event_type="chat.saved",
                    title="Interaction logged",
                    message=response.reply,
                    interaction=interaction_payload,
                    metadata={
                        "event": "chat.saved",
                        "source": "chat_api",
                    },
                )
            )

    return response
