from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect


class NotificationManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, payload: dict[str, Any]) -> None:
        stale_connections: list[WebSocket] = []

        for connection in list(self._connections):
            try:
                await connection.send_json(payload)
            except (WebSocketDisconnect, RuntimeError):
                stale_connections.append(connection)

        for connection in stale_connections:
            self.disconnect(connection)


def build_notification_payload(
    *,
    event_type: str,
    title: str,
    message: str,
    interaction: dict[str, Any] | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "type": event_type,
        "title": title,
        "message": message,
        "interaction": interaction,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
