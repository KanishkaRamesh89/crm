from __future__ import annotations

from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect

from ..services.notifications import build_notification_payload


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.websocket("/ws")
async def notifications_ws(websocket: WebSocket, request: Request):
    notifier = request.app.state.notifier
    await notifier.connect(websocket)
    await websocket.send_json(
        build_notification_payload(
            event_type="system.connected",
            title="Live notifications connected",
            message="You are now connected to real-time CRM updates.",
            metadata={"source": "websocket"},
        )
    )

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        notifier.disconnect(websocket)
