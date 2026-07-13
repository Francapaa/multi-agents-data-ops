import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import psycopg
from psycopg import AsyncConnection

logger = logging.getLogger(__name__)


class Database:
    def __init__(self):
        self._connection_string = os.getenv("NEON_DATABASE_CONNECTION_STRING")
        if not self._connection_string:
            raise ValueError("NEON_DATABASE_CONNECTION STRING is not set")

    @asynccontextmanager
    async def connect(self) -> AsyncGenerator[AsyncConnection, None]:
        async with await AsyncConnection.connect(self._connection_string) as conn:
            yield conn

    async def execute(self, query: str, params: tuple = None) -> list[dict]:
        logger.info("[DB] execute — query=%.100s params=%s", query, params)
        async with self.connect() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                if cur.description is None:
                    return []
                columns = [desc[0] for desc in cur.description]
                rows = await cur.fetchall()
                logger.info("[DB] execute returned %s rows", len(rows))
                return [dict(zip(columns, row)) for row in rows]

    async def execute_one(self, query: str, params: tuple = None) -> dict | None:
        logger.info("[DB] execute_one — query=%.80s params=%s", query, params)
        async with self.connect() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                if cur.description is None:
                    return None
                columns = [desc[0] for desc in cur.description]
                row = await cur.fetchone()
                logger.info("[DB] execute_one result: %s", dict(zip(columns, row)) if row else None)
                return dict(zip(columns, row)) if row else None


_db_instance: Database | None = None


def get_database() -> Database:
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


async def get_db() -> Database:
    return get_database()