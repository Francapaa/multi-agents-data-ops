import asyncio
from uuid import UUID


class ProjectStreamHub:
    """Fan-out SSE: varios clientes pueden suscribirse al mismo project_id."""

    def __init__(self) -> None:
        self._listeners: dict[UUID, list[asyncio.Queue[tuple[str, dict]]]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, project_id: UUID) -> asyncio.Queue[tuple[str, dict]]:
        q: asyncio.Queue[tuple[str, dict]] = asyncio.Queue()
        async with self._lock:
            self._listeners.setdefault(project_id, []).append(q)
        return q

    async def unsubscribe(self, project_id: UUID, q: asyncio.Queue[tuple[str, dict]]) -> None:
        async with self._lock:
            subs = self._listeners.get(project_id)
            if not subs:
                return
            if q in subs:
                subs.remove(q)
            if not subs:
                del self._listeners[project_id]

    async def publish(self, project_id: UUID, event: str, data: dict) -> None:
        async with self._lock:
            subs = list(self._listeners.get(project_id, []))
        for q in subs:
            await q.put((event, data))


stream_hub = ProjectStreamHub()
