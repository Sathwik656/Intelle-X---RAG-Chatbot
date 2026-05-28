"""
db.py — SQLite persistence layer for PDF sessions and chat messages.
All data is stored in sessions.db inside the RAG_Backend directory.
"""
import sqlite3
import json
import os
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "sessions.db"


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """Create tables if they do not yet exist."""
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id   TEXT PRIMARY KEY,
                filename     TEXT NOT NULL,
                file_path    TEXT NOT NULL,
                status       TEXT NOT NULL DEFAULT 'pending',
                chunks_count INTEGER,
                created_at   TEXT NOT NULL,
                updated_at   TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id   TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
                role         TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content      TEXT NOT NULL,
                sources      TEXT,
                created_at   TEXT NOT NULL
            );
        """)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Sessions ──────────────────────────────────────────────────────────────────

def create_session(session_id: str, filename: str, file_path: str) -> dict:
    now = _now()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO sessions (session_id, filename, file_path, status, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', ?, ?)
            """,
            (session_id, filename, file_path, now, now),
        )
    return get_session(session_id)


def update_session_status(session_id: str, status: str, chunks_count: int | None = None) -> None:
    now = _now()
    with _connect() as conn:
        if chunks_count is not None:
            conn.execute(
                "UPDATE sessions SET status=?, chunks_count=?, updated_at=? WHERE session_id=?",
                (status, chunks_count, now, session_id),
            )
        else:
            conn.execute(
                "UPDATE sessions SET status=?, updated_at=? WHERE session_id=?",
                (status, now, session_id),
            )


def get_all_sessions() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


def get_session(session_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM sessions WHERE session_id=?", (session_id,)
        ).fetchone()
    return dict(row) if row else None


def delete_session(session_id: str) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE session_id=?", (session_id,))
        # cascading delete handles the messages table


# ── Messages ──────────────────────────────────────────────────────────────────

def add_message(
    session_id: str,
    role: str,
    content: str,
    sources: list[str] | None = None,
) -> dict:
    now = _now()
    sources_json = json.dumps(sources or [])
    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO messages (session_id, role, content, sources, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (session_id, role, content, sources_json, now),
        )
        row_id = cur.lastrowid
        row = conn.execute("SELECT * FROM messages WHERE id=?", (row_id,)).fetchone()
    return _parse_message(dict(row))


def get_messages(session_id: str) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM messages WHERE session_id=? ORDER BY created_at ASC",
            (session_id,),
        ).fetchall()
    return [_parse_message(dict(r)) for r in rows]


def _parse_message(row: dict) -> dict:
    try:
        row["sources"] = json.loads(row["sources"] or "[]")
    except (json.JSONDecodeError, TypeError):
        row["sources"] = []
    return row
