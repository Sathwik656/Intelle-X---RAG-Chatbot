import logging
import time
import uuid
import os
from pathlib import Path
from contextlib import asynccontextmanager

import requests
import httpx
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import inngest
import inngest.fast_api
from inngest.experimental import ai
from dotenv import load_dotenv

from data_loader import load_and_chunk_pdf, embed_texts
from vector_db import QdrantStorage
from custom_types import RAQQueryResult, RAGSearchResult, RAGUpsertResult, RAGChunkAndSrc
import db

load_dotenv()

# ── Inngest client ─────────────────────────────────────────────────────────────

inngest_client = inngest.Inngest(
    app_id="rag_app",
    logger=logging.getLogger("uvicorn"),
    is_production=False,
    serializer=inngest.PydanticSerializer(),
)

# ── Inngest functions (unchanged) ──────────────────────────────────────────────

@inngest_client.create_function(
    fn_id="RAG: Ingest PDF",
    trigger=inngest.TriggerEvent(event="rag/ingest_pdf"),
)
async def rag_ingest_pdf(ctx: inngest.Context):
    def _load(ctx: inngest.Context) -> RAGChunkAndSrc:
        pdf_path = ctx.event.data["pdf_path"]
        source_id = ctx.event.data.get("source_id", pdf_path)
        chunks = load_and_chunk_pdf(pdf_path)
        return RAGChunkAndSrc(chunks=chunks, source_id=source_id)

    def _upsert(chunks_and_src: RAGChunkAndSrc) -> RAGUpsertResult:
        chunks = chunks_and_src.chunks
        source_id = chunks_and_src.source_id
        vecs = embed_texts(chunks)
        ids = [str(uuid.uuid5(uuid.NAMESPACE_URL, f"{source_id}:{i}")) for i in range(len(chunks))]
        payloads = [{"source": source_id, "text": chunks[i]} for i in range(len(chunks))]
        QdrantStorage().upsert(ids, vecs, payloads)
        return RAGUpsertResult(ingested=len(chunks))

    chunks_and_src = await ctx.step.run("load-and-chunk", lambda: _load(ctx), output_type=RAGChunkAndSrc)
    ingested = await ctx.step.run("embed-and-upsert", lambda: _upsert(chunks_and_src), output_type=RAGUpsertResult)
    
    # Update DB directly since we're in the same process
    session_id = ctx.event.data.get("session_id")
    if session_id:
        db.update_session_status(session_id, "ready", chunks_count=ingested.ingested)
        
    return ingested.model_dump()


@inngest_client.create_function(
    fn_id="RAG: Query PDF",
    trigger=inngest.TriggerEvent(event="rag/query_pdf"),
)
async def rag_query_pdf_ai(ctx: inngest.Context):
    def _search(question: str, top_k: int = 5):
        query_vec = embed_texts([question])[0]
        store = QdrantStorage()
        found = store.search(query_vec, top_k=top_k)
        return RAGSearchResult(contexts=found["contexts"], sources=found["sources"])

    question = ctx.event.data["question"]
    top_k = int(ctx.event.data.get("top_k", 5))

    found = await ctx.step.run("embed-and-search", lambda: _search(question, top_k), output_type=RAGSearchResult)

    context_block = "\n\n".join(f"- {c}" for c in found.contexts)
    user_content = (
        "Use the following retrieved contexts to answer the question.\n\n"
        f"Contexts:\n{context_block}\n\n"
        f"Question: {question}\n\n"
        "Answer concisely using the context above."
    )

    adapter = ai.openai.Adapter(
        auth_key=os.getenv("GEMINI_API_KEY"),
        model="gemini-2.5-flash",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
    )

    res = await ctx.step.ai.infer(
        "llm-answer",
        adapter=adapter,
        body={
            "messages": [
                {"role": "system", "content": "You answer questions using only the provided contexts."},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
        },
    )

    answer = res["choices"][0]["message"]["content"].strip()
    return {"answer": answer, "sources": found.sources}


# ── Inngest polling helpers (moved from streamlit_app.py) ─────────────────────

def _inngest_api_base() -> str:
    return os.getenv("INNGEST_API_BASE", "http://127.0.0.1:8288/v1")


async def _fetch_runs(event_id: str) -> list[dict]:
    url = f"{_inngest_api_base()}/events/{event_id}/runs"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10.0)
        resp.raise_for_status()
        return resp.json().get("data", [])


async def _wait_for_run_output(event_id: str, timeout_s: float = 120.0, poll_interval_s: float = 0.5) -> dict:
    start = time.time()
    last_status = None
    while True:
        try:
            runs = await _fetch_runs(event_id)
            if runs:
                run = runs[0]
                status = run.get("status")
                last_status = status or last_status
                if status in ("Completed", "Succeeded", "Success", "Finished"):
                    return run.get("output") or {}
                if status in ("Failed", "Cancelled"):
                    raise RuntimeError(f"Inngest run {status}: {run.get('error', '')}")
        except Exception as e:
            logging.getLogger("uvicorn").warning("Error fetching runs for %s: %s", event_id, e)

        if time.time() - start > timeout_s:
            raise TimeoutError(f"Timed out waiting for run output (last status: {last_status})")
        await asyncio.sleep(poll_interval_s)


# ── FastAPI app ────────────────────────────────────────────────────────────────

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="Intelle X RAG API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response models ────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    session_id: str
    question: str
    top_k: int = 5


# ── Background task: update session status after Inngest finishes ──────────────

async def _background_ingest(session_id: str, event_ids: list[str]) -> None:
    """Poll Inngest for ingest completion and update session status."""
    try:
        output = await _wait_for_run_output(event_ids[0], timeout_s=300.0)
        ingested = output.get("ingested", 0)
        db.update_session_status(session_id, "ready", chunks_count=ingested)
    except Exception as exc:
        logging.getLogger("uvicorn").error("Ingest failed for session %s: %s", session_id, exc)
        db.update_session_status(session_id, "error")


# ── REST endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    session_id = str(uuid.uuid4())
    file_path = UPLOADS_DIR / f"{session_id}_{file.filename}"
    contents = await file.read()
    file_path.write_bytes(contents)

    session = db.create_session(session_id, file.filename, str(file_path))

    # Fire Inngest ingest event
    result = await inngest_client.send(
        inngest.Event(
            name="rag/ingest_pdf",
            data={
                "pdf_path": str(file_path.resolve()),
                "source_id": file.filename,
                "session_id": session_id,
            },
        )
    )

    # Immediately set to processing. Inngest function will update it to ready when done.
    db.update_session_status(session_id, "processing")

    return {
        "session_id": session_id,
        "filename": file.filename,
        "status": session["status"],
        "created_at": session["created_at"],
    }


@app.get("/api/sessions")
async def list_sessions():
    sessions = db.get_all_sessions()
    return {"sessions": sessions}


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@app.get("/api/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    messages = db.get_messages(session_id)
    return {"session_id": session_id, "messages": messages}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    session = db.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Save user message
    db.add_message(req.session_id, "user", req.question)

    # Fire Inngest query event and wait for result
    try:
        result = await inngest_client.send(
            inngest.Event(
                name="rag/query_pdf",
                data={"question": req.question, "top_k": req.top_k},
            )
        )
        event_ids = result or []
        if not event_ids:
            raise RuntimeError("No event IDs returned from Inngest.")

        output = await _wait_for_run_output(event_ids[0], timeout_s=120.0)
        answer = output.get("answer", "(No answer returned)")
        sources = output.get("sources", [])
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Query timed out. Please try again.")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    # Save assistant message
    db.add_message(req.session_id, "assistant", answer, sources=sources)

    return {"answer": answer, "sources": sources, "session_id": req.session_id}


@app.get("/api/sessions/{session_id}/status")
async def get_session_status(session_id: str):
    """Lightweight polling endpoint for upload progress."""
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"status": session["status"], "chunks_count": session.get("chunks_count")}


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    # Delete file
    file_path = Path(session["file_path"])
    if file_path.exists():
        file_path.unlink()
        
    # Delete from DB
    db.delete_session(session_id)
    return {"status": "ok", "session_id": session_id}


# ── Inngest webhook (must come last) ──────────────────────────────────────────

inngest.fast_api.serve(app, inngest_client, [rag_ingest_pdf, rag_query_pdf_ai])