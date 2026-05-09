import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import psycopg
from psycopg import AsyncConnection


class Database:
    def __init__(self):
        self._connection_string = os.getenv("NEON_DATABASE_CONNECTION_STRING")
        if not self._connection_string:
            raise ValueError("NEON_DATABASE_CONNECTION STRING is not set")

    @asynccontextmanager
    async def connect(self) -> AsyncGenerator[AsyncConnection, None]:
        async with await AsyncConnection.connect(self._connection_string) as conn:
            yield conn

    # queries with > 1 rows 
    async def execute(self, query: str, params: tuple = None) -> list[dict]:
        async with self.connect() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                columns = [desc[0] for desc in cur.description] if cur.description else []
                rows = await cur.fetchall()
                return [dict(zip(columns, row)) for row in rows]

    # queries with 1 row
    async def execute_one(self, query: str, params: tuple = None) -> dict | None:
        async with self.connect() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                columns = [desc[0] for desc in cur.description] if cur.description else []
                row = await cur.fetchone()
                return dict(zip(columns, row)) if row else None


db = Database()


async def get_db() -> Database:
    return db