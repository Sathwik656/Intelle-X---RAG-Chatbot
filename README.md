<div align="center">

# Intelle X — RAG Chatbot

### *AI-Powered Document Intelligence using RAG pipeline*

![Python](https://img.shields.io/badge/PYTHON-3.12%2B-3776AB?style=flat-square&logo=python&logoColor=white&labelColor=111111)
![FastAPI](https://img.shields.io/badge/FASTAPI-0.136%2B-009688?style=flat-square&logo=fastapi&logoColor=white&labelColor=111111)
![React](https://img.shields.io/badge/REACT-19.x-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=111111)
![Gemini](https://img.shields.io/badge/GEMINI-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white&labelColor=111111)
![Qdrant](https://img.shields.io/badge/QDRANT-1.18%2B-DC143C?style=flat-square&logo=qdrant&logoColor=white&labelColor=111111)
![Inngest](https://img.shields.io/badge/INNGEST-0.5%2B-5865F2?style=flat-square&logoColor=white&labelColor=111111)
![Docker](https://img.shields.io/badge/DOCKER-READY-2496ED?style=flat-square&logo=docker&logoColor=white&labelColor=111111)
![License](https://img.shields.io/badge/LICENSE-MIT-c6f135?style=flat-square&labelColor=111111)
![Status](https://img.shields.io/badge/STATUS-ACTIVE-00ff88?style=flat-square&labelColor=111111)

---

*Upload any PDF. Ask anything. Get contextually-aware, source-cited answers — powered by Google Gemini embeddings, Qdrant vector search, and Inngest async workflows.*

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Installation Guide](#installation-guide)
- [Docker + Qdrant Setup](#docker--qdrant-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [API Reference](#api-reference)
- [Inngest Workflow Documentation](#inngest-workflow-documentation)
- [UI / Design System](#ui--design-system)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Project Overview

**Intelle X** is a full-stack, production-grade **Retrieval-Augmented Generation (RAG)** chatbot system that enables users to upload PDF documents and query them using natural language — receiving precise, source-cited answers powered by Google Gemini's state-of-the-art embedding and generation models.

The system is architected around an **event-driven, asynchronous workflow engine** (Inngest), a **high-performance vector database** (Qdrant), and a **FastAPI backend** exposing a clean REST API consumed by a beautifully crafted **React 19 frontend**.

> Originally prototyped with a Streamlit frontend, the project has been migrated to a production-grade React + Vite SPA, demonstrating a complete full-stack AI SaaS architecture pattern.

---

## Features

| Feature | Description |
|---|---|
| **PDF Upload & Ingestion** | Upload any PDF and trigger an asynchronous ingestion pipeline |
| **Semantic Chunking** | Documents split with 1000-token chunks and 200-token overlap via LlamaIndex `SentenceSplitter` |
| **Gemini Embeddings** | 3072-dimensional dense embeddings via `gemini-embedding-001` for rich semantic representation |
| **Vector Search** | Cosine-similarity vector retrieval from Qdrant using top-k nearest-neighbour search |
| **Multi-Session PDF History** | Track multiple uploaded documents per user session with status lifecycle management |
| **Persistent Chat Sessions** | Full conversation history stored in SQLite, scoped per session with role-based message tracking |
| **AI-Powered Contextual Answers** | `gemini-2.5-flash` generates answers strictly grounded in retrieved document contexts |
| **Source-Aware Responses** | Every answer includes file source attribution for full traceability |
| **Async Inngest Workflows** | Non-blocking, event-driven PDF ingestion and AI query workflows with observable steps |
| **Dockerized Vector DB** | Qdrant runs in a Docker container with persistent volume storage |
| **Session Deletion** | Delete sessions along with their associated PDF file, vectors, and chat history |
| **FastAPI REST API** | Clean, versioned API with CORS, background tasks, lifespan events, and Pydantic validation |
| **Real-time Ingestion Status** | Frontend polls session status and reflects `pending → processing → ready` state transitions |

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 8.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Axios** | 1.x | HTTP API client |
| **React Router DOM** | 7.x | Client-side routing |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Role |
|---|---|---|
| **FastAPI** | 0.136+ | REST API framework |
| **Uvicorn** | 0.48+ | ASGI server |
| **Pydantic** | 2.x | Data validation & serialization |
| **python-multipart** | Latest | File upload parsing |
| **httpx** | Latest | Async HTTP client (Inngest polling) |
| **python-dotenv** | 1.2+ | Environment variable management |

### AI / ML
| Technology | Version | Role |
|---|---|---|
| **Google Gemini** | `gemini-embedding-001` | 3072-dim dense embeddings |
| **Google Gemini** | `gemini-2.5-flash` | Contextual answer generation |
| **google-genai SDK** | 2.6+ | Official Python Gemini client |
| **LlamaIndex Core** | 0.14+ | Document loading & text node parsing |
| **LlamaIndex Readers File** | 0.6+ | PDF file reader integration |

### Databases
| Technology | Role |
|---|---|
| **Qdrant** | Vector database — stores and queries 3072-dim embeddings |
| **SQLite** | Relational DB — stores session metadata and full chat history |

### Workflow Engine
| Technology | Role |
|---|---|
| **Inngest** | Event-driven async workflow orchestration for ingestion & query pipelines |
| **Inngest Dev Server** | Local observability dashboard for function runs, steps, and retries |

### Deployment / Containerization
| Technology | Role |
|---|---|
| **Docker** | Containerizes Qdrant vector database |
| **UV** | Fast Python package manager (PEP 723 compliant) |
| **npm / Node.js** | JavaScript runtime for frontend tooling |

---

## Project Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTELLE X — SYSTEM ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐         HTTP / REST         ┌─────────────────────┐
  │   React 19 SPA   │ ◄──────────────────────────► │   FastAPI Backend   │
  │  (Vite + Tailwind│         /api/*               │   (Uvicorn ASGI)    │
  │   Neo Brutalism) │                              │   Port: 8000        │
  └──────────────────┘                              └─────────┬───────────┘
                                                              │
                                          ┌───────────────────┼───────────────────┐
                                          │                   │                   │
                                   ┌──────▼──────┐   ┌────────▼──────┐  ┌────────▼───────┐
                                   │   SQLite    │   │    Inngest     │  │    Uploads     │
                                   │  sessions.db│   │  (Event Bus)   │  │   /uploads/    │
                                   │  - sessions │   │  Port: 8288    │  │   PDF Files    │
                                   │  - messages │   └────────┬───────┘  └────────────────┘
                                   └─────────────┘           │
                                                   ┌──────────┴──────────┐
                                                   │                     │
                                          ┌────────▼──────┐    ┌─────────▼──────┐
                                          │  rag/ingest_  │    │  rag/query_    │
                                          │  pdf workflow  │    │  pdf workflow   │
                                          └────────┬───────┘    └────────┬───────┘
                                                   │                     │
                                          ┌────────▼───────────────────▼─┐
                                          │        Gemini AI (Google)     │
                                          │  ┌─────────────────────────┐  │
                                          │  │  gemini-embedding-001   │  │
                                          │  │  (3072-dim embeddings)  │  │
                                          │  └─────────────────────────┘  │
                                          │  ┌─────────────────────────┐  │
                                          │  │   gemini-2.5-flash      │  │
                                          │  │   (answer generation)   │  │
                                          │  └─────────────────────────┘  │
                                          └────────────────┬───────────────┘
                                                           │
                                                  ┌────────▼───────┐
                                                  │     Qdrant      │
                                                  │  Vector Store   │
                                                  │  (Docker)       │
                                                  │  Port: 6333     │
                                                  │  Cosine Sim     │
                                                  │  dim=3072       │
                                                  └─────────────────┘
```

### PDF Ingestion Pipeline

```
User Uploads PDF
       │
       ▼
POST /api/upload  (FastAPI)
       │
       ├── Save PDF to /uploads/{session_id}_{filename}.pdf
       ├── Create session record in SQLite (status: "pending")
       ├── Fire Inngest event "rag/ingest_pdf" with pdf_path + session_id
       └── Set session status: "processing"
              │
              ▼
    Inngest: rag_ingest_pdf()
              │
              ├── Step 1: "load-and-chunk"
              │    └── PDFReader().load_data(pdf_path)
              │         └── SentenceSplitter(chunk_size=1000, overlap=200)
              │              └── Returns: list[str]   (text chunks)
              │
              └── Step 2: "embed-and-upsert"
                   ├── embed_texts(chunks)
                   │    └── gemini-embedding-001 API → list[list[float]] (dim=3072)
                   ├── Generate deterministic UUIDs per chunk
                   ├── QdrantStorage().upsert(ids, vectors, payloads)
                   └── db.update_session_status(session_id, "ready", chunks_count=N)
```

### RAG Query Pipeline

```
User Sends Message
       │
       ▼
POST /api/chat  (FastAPI)
       │
       ├── db.add_message(session_id, "user", question)
       ├── Fire Inngest event "rag/query_pdf" with question + top_k
       └── Poll Inngest Dev Server for run output (120s timeout)
              │
              ▼
    Inngest: rag_query_pdf_ai()
              │
              ├── Step 1: "embed-and-search"
              │    ├── embed_texts([question]) → query_vector (dim=3072)
              │    └── QdrantStorage().search(query_vector, top_k=5)
              │         └── Returns: contexts[], sources[]
              │
              └── Step 2: "llm-answer"  (ctx.step.ai.infer)
                   ├── Build context prompt with retrieved passages
                   ├── Call gemini-2.5-flash via OpenAI-compatible adapter
                   ├── temperature=0.2, max_tokens=1024
                   └── Returns: {answer, sources}
                          │
                          ▼
              FastAPI receives output
              db.add_message(session_id, "assistant", answer, sources)
              Returns {answer, sources} to React frontend
```

---

## Folder Structure

```
RAG/
├── RAG_Chatbot/                    # Python backend
│   ├── .env                        # API keys (gitignored)
│   ├── .python-version             # Python version pin (3.12)
│   ├── .venv/                      # UV virtual environment
│   ├── pyproject.toml              # PEP 517 project manifest
│   ├── requirements.txt            # Pip-compatible dependency list
│   ├── uv.lock                     # UV lockfile (deterministic builds)
│   │
│   ├── main.py                     # FastAPI app + Inngest functions + REST API
│   ├── data_loader.py              # PDF chunking + Gemini embedding generation
│   ├── vector_db.py                # Qdrant client wrapper (upsert + cosine search)
│   ├── db.py                       # SQLite persistence (sessions + messages)
│   ├── custom_types.py             # Pydantic models for Inngest step I/O
│   ├── streamlit_app.py            # Legacy Streamlit frontend (reference only)
│   │
│   ├── sessions.db                 # SQLite database (auto-created, gitignored)
│   ├── uploads/                    # Uploaded PDF files (auto-created, gitignored)
│   └── qdrant_storage/             # Qdrant local storage (if not using Docker)
│
├── frontend/                       # React 19 SPA
│   ├── index.html                  # HTML entry point with Google Fonts
│   ├── vite.config.js              # Vite config + /api proxy to FastAPI
│   ├── tailwind.config.js          # Neo Brutalism design tokens
│   ├── postcss.config.js           # PostCSS + Autoprefixer
│   ├── package.json                # Node.js dependencies
│   │
│   └── src/
│       ├── main.jsx                # React root (BrowserRouter + AppProvider)
│       ├── App.jsx                 # Root layout (Sidebar + Page + UploadModal)
│       ├── index.css               # Global Neo Brutalism CSS design system
│       │
│       ├── api/
│       │   └── client.js           # Axios instance + all API helper functions
│       │
│       ├── context/
│       │   └── AppContext.jsx      # Global state (useReducer) + all async actions
│       │
│       ├── pages/
│       │   ├── HomePage.jsx        # Landing / welcome page with quick actions
│       │   └── ChatPage.jsx        # Active chat interface with message history
│       │
│       └── components/
│           ├── Sidebar/
│           │   ├── Sidebar.jsx     # Left navigation panel + session list
│           │   ├── SessionItem.jsx # Individual session card with status + delete
│           │   └── UserFooter.jsx  # Bottom user profile section
│           ├── Chat/
│           │   ├── ChatInput.jsx   # Message input bar + send button
│           │   ├── MessageBubble.jsx # Individual message rendering (user/assistant)
│           │   └── SourceChip.jsx  # Source document attribution badge
│           └── Upload/
│               └── UploadModal.jsx # PDF upload modal with drag-and-drop
│
└── README.md                       # This file
```

---

## Installation Guide

### Prerequisites

Ensure you have the following installed on your system:

- **Python** 3.12+
- **Node.js** 18+ and **npm** 9+
- **Docker Desktop** (for Qdrant)
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/intelle-x-rag-chatbot.git
cd intelle-x-rag-chatbot
```

---

### 2. Python Backend Setup

#### Option A — Using UV (Recommended)

[UV](https://docs.astral.sh/uv/) is a fast, modern Python package manager.

```bash
# Install UV
pip install uv

# Navigate to backend
cd RAG_Chatbot

# Create virtual environment and install all dependencies
uv sync

# Activate the virtual environment
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate
```

#### Option B — Using pip + venv

```bash
cd RAG_Chatbot

# Create virtual environment
python -m venv .venv

# Activate
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# or using pyproject.toml:
pip install -e .
```

---

### 3. Environment Variable Configuration

Create a `.env` file inside the `RAG_Chatbot/` directory:

```bash
# RAG_Chatbot/.env

GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: Override Inngest Dev Server base URL (default shown)
INNGEST_API_BASE=http://127.0.0.1:8288/v1
```

#### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key and paste it into your `.env` file

> **Important:** Never commit your `.env` file to version control. It is included in `.gitignore` by default.

---

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install all Node.js dependencies
npm install
```

---

## Docker + Qdrant Setup

Qdrant must be running before starting the backend. Use Docker to spin it up:

### Pull and Run Qdrant

```bash
# Pull the latest Qdrant image
docker pull qdrant/qdrant

# Run Qdrant with persistent volume storage
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

> **Windows (PowerShell):**
> ```powershell
> docker run -d `
>   --name qdrant `
>   -p 6333:6333 `
>   -p 6334:6334 `
>   -v ${PWD}/qdrant_storage:/qdrant/storage `
>   qdrant/qdrant
> ```

### Port Mapping

| Port | Service |
|---|---|
| `6333` | Qdrant REST API |
| `6334` | Qdrant gRPC API |

### Verify Qdrant is Running

```bash
# Check container status
docker ps

# Check Qdrant health endpoint
curl http://localhost:6333/healthz
# Expected: {"title":"qdrant - vector search engine","version":"..."}

# View collections (should be empty initially)
curl http://localhost:6333/collections
```

### Stopping and Restarting Qdrant

```bash
# Stop the container
docker stop qdrant

# Restart (data is persisted via volume)
docker start qdrant

# View logs
docker logs qdrant
```

---

## Running the Backend

You need **three terminal windows** running simultaneously for the full backend stack:

### Terminal 1 — FastAPI Server

```bash
cd RAG_Chatbot
.venv\Scripts\activate  # or source .venv/bin/activate

python -m uvicorn main:app --reload --port 8000
```

> The API will be available at `http://localhost:8000`  
> Interactive Swagger docs: `http://localhost:8000/docs`

### Terminal 2 — Inngest Dev Server

```bash
# In the RAG_Chatbot directory (with venv active)
npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest --no-discovery
```

> The Inngest dashboard will be available at `http://localhost:8288`  
> This dashboard lets you observe workflow runs, steps, and retries in real time.

### Terminal 3 — Docker / Qdrant

```bash
docker start qdrant
# (or the full docker run command from the setup section)
```

---

## Running the Frontend

```bash
cd frontend
npm run dev
```

> The React app will be available at `http://localhost:5173`  
> Vite proxies all `/api` requests to `http://localhost:8000` automatically — no CORS configuration needed in development.

---

## API Reference

All endpoints are prefixed with `/api`.

### Health Check

```http
GET /api/health
```

**Response:**
```json
{ "status": "ok" }
```

---

### Upload PDF

```http
POST /api/upload
Content-Type: multipart/form-data

file: <PDF binary>
```

**Response `201`:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "my-document.pdf",
  "status": "processing",
  "created_at": "2026-05-28T12:33:39.471306+00:00"
}
```

> Triggers the `rag/ingest_pdf` Inngest event asynchronously. Session status transitions: `pending → processing → ready`.

---

### List All Sessions

```http
GET /api/sessions
```

**Response:**
```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "filename": "my-document.pdf",
      "file_path": "/path/to/uploads/...",
      "status": "ready",
      "chunks_count": 42,
      "created_at": "2026-05-28T12:33:39+00:00",
      "updated_at": "2026-05-28T12:37:24+00:00"
    }
  ]
}
```

---

### Get Single Session

```http
GET /api/sessions/{session_id}
```

---

### Poll Session Status

```http
GET /api/sessions/{session_id}/status
```

**Response:**
```json
{ "status": "ready", "chunks_count": 42 }
```

> Used by the frontend during document ingestion to poll progress (`pending → processing → ready`).

---

### Get Chat History

```http
GET /api/sessions/{session_id}/messages
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": 1,
      "session_id": "550e8400-...",
      "role": "user",
      "content": "What is machine learning?",
      "sources": [],
      "created_at": "2026-05-28T12:40:00+00:00"
    },
    {
      "id": 2,
      "session_id": "550e8400-...",
      "role": "assistant",
      "content": "Machine learning is a subset of AI...",
      "sources": ["Unit I Notes Complete Feb 2026.pdf"],
      "created_at": "2026-05-28T12:40:05+00:00"
    }
  ]
}
```

---

### Send Chat Message

```http
POST /api/chat
Content-Type: application/json

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": "Explain supervised learning with examples.",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "Supervised learning is a paradigm where a model is trained on labeled data...",
  "sources": ["Unit I Notes Complete Feb 2026.pdf"],
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

> Fires the `rag/query_pdf` Inngest event and polls for the result synchronously (120s timeout).

---

### Delete Session

```http
DELETE /api/sessions/{session_id}
```

**Response:**
```json
{ "status": "ok", "session_id": "550e8400-e29b-41d4-a716-446655440000" }
```

> Permanently deletes the session record, all associated chat messages (cascade), and the uploaded PDF file from disk.

---

## Inngest Workflow Documentation

Inngest provides **event-driven, durable workflow orchestration** — each workflow is a series of observable steps that can be retried independently on failure.

### Architecture Overview

```
FastAPI Backend                    Inngest Dev Server
     │                                    │
     │  inngest_client.send(Event(...))   │
     │ ─────────────────────────────────► │
     │                                    │ ← registers function handlers
     │                                    │    from /api/inngest webhook
     │                                    │
     │          async execution           │
     │ ◄───────────────────────────────── │
     │  _wait_for_run_output(event_id)    │
     │  (polls /v1/events/{id}/runs)      │
```

### Event: `rag/ingest_pdf`

**Triggered by:** `POST /api/upload`

**Payload:**
```json
{
  "pdf_path": "/absolute/path/to/uploads/session_pdf.pdf",
  "source_id": "original-filename.pdf",
  "session_id": "uuid-of-session"
}
```

**Workflow Steps:**

| Step ID | Action | Output |
|---|---|---|
| `load-and-chunk` | Reads PDF via `PDFReader`, splits into chunks (1000 tokens, 200 overlap) | `RAGChunkAndSrc` |
| `embed-and-upsert` | Generates Gemini embeddings for each chunk, upserts to Qdrant with UUID keys | `RAGUpsertResult` |
| *(direct call)* | Updates SQLite session status to `ready` with `chunks_count` | — |

---

### Event: `rag/query_pdf`

**Triggered by:** `POST /api/chat`

**Payload:**
```json
{
  "question": "What is gradient descent?",
  "top_k": 5
}
```

**Workflow Steps:**

| Step ID | Action | Output |
|---|---|---|
| `embed-and-search` | Embeds the question, performs cosine similarity search in Qdrant | `RAGSearchResult` |
| `llm-answer` | Builds context-aware prompt, calls `gemini-2.5-flash` via `ctx.step.ai.infer` | `{answer, sources}` |

**Prompt Construction:**
```
System: You answer questions using only the provided contexts.

User:
Use the following retrieved contexts to answer the question.

Contexts:
- [chunk 1 text]
- [chunk 2 text]
...

Question: {user question}

Answer concisely using the context above.
```

---

### Observability

The Inngest Dev Server (`http://localhost:8288`) provides:
- **Real-time function run dashboard** — view all triggered events
- **Step-by-step execution trace** — see each step's input/output
- **Automatic retry** — failed steps are retried automatically
- **Run history** — inspect past executions and their outputs

---

## UI / Design System

The frontend implements a custom **dark Theme** design system built entirely in Tailwind CSS v3.

#### Design Tokens

| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#0a0a0a` | Page background |
| `bg-secondary` | `#111111` | Input fields, panels |
| `bg-card` | `#1a1a1a` | Cards, sidebar |
| `accent-cyan` | `#00d4ff` | Primary action color |
| `accent-lime` | `#c6f135` | Secondary action, success |
| `accent-pink` | `#ff0066` | Accent, delete, error |
| `accent-yellow` | `#ffd93d` | Warnings, in-progress |
| `text-primary` | `#ffffff` | Main body text |
| `text-muted` | `rgba(255,255,255,0.5)` | Secondary text |
| `text-dim` | `rgba(255,255,255,0.25)` | Placeholder, metadata |

#### Component Classes

```css
.brutal-card      /* 2px border + hard shadow (4px 4px 0 #000) */
.btn-brutal       /* Bordered button with offset shadow */
.btn-ghost        /* Transparent bordered ghost button */
.sidebar-item     /* Sidebar nav entry with active state */
.tag-*            /* Colored label badges (cyan, lime, pink, yellow) */
```

#### Typography

| Font | Usage |
|---|---|
| `Space Grotesk` | Hero headlines, section titles |
| `Inter` | Body text, chat messages |
| `JetBrains Mono` | Code, labels, status tags, metadata |

#### Key Animations

- `fade-in` — Staggered entrance for page sections
- `slide-up` — Chat message entrance
- `shimmer` — Loading skeleton effect for session list
- `pulse` — Live status indicator dots

### Component Architecture

```
App.jsx
├── Sidebar.jsx           ← Fixed left panel (160px)
│   ├── SessionItem.jsx   ← Document card with status icon + delete button
│   └── UserFooter.jsx    ← User profile footer
├── HomePage.jsx          ← Landing page (no active session)
├── ChatPage.jsx          ← Active chat view
│   ├── MessageBubble.jsx ← User/assistant message rendering
│   ├── SourceChip.jsx    ← Source document attribution badge
│   └── ChatInput.jsx     ← Message composer
└── UploadModal.jsx       ← Drag-and-drop PDF uploader overlay
```

---

## Future Improvements

| Priority | Feature |
|---|---|
|  High | **Multi-collection Qdrant support** — isolate each session's vectors in a dedicated Qdrant collection to enable per-document querying |
|  High | **WebSocket streaming** — stream Gemini responses token-by-token for real-time chat experience |
|  Medium | **GitHub repository ingestion** — connect and ingest entire GitHub repos as a knowledge source |
|  Medium | **Web search integration** — fall back to live web search when document context is insufficient |
|  Medium | **User authentication** — add JWT-based auth to enable multi-user session isolation |
|  Medium | **Multi-file query** — allow querying across multiple uploaded PDFs simultaneously |
|  Low | **Reranker integration** — add a cross-encoder reranker step between retrieval and generation for improved accuracy |
|  Low | **Export conversations** — allow users to export chat history as PDF or Markdown |
|  Low | **Production deployment** — Dockerfile for FastAPI + static build of React SPA with Nginx |
|  Low | **Automated tests** — pytest for backend endpoints and Playwright for UI |

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style / formatting
refactor: Code refactor
test:     Adding tests
chore:    Build process or tooling changes
```

### Code Style

- **Python**: PEP 8, type hints preferred
- **JavaScript/JSX**: ESLint config included, prefer functional components and hooks
- **CSS**: Tailwind utility classes, custom design tokens via `tailwind.config.js`

---

## License

```
MIT License

Copyright (c) 2026 Intelle X Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgements

| Project | Usage |
|---|---|
| [**Google Gemini**](https://ai.google.dev/) | Embedding generation and answer synthesis |
| [**Qdrant**](https://qdrant.tech/) | High-performance vector similarity search |
| [**Inngest**](https://inngest.com/) | Event-driven workflow orchestration |
| [**FastAPI**](https://fastapi.tiangolo.com/) | Modern Python web framework |
| [**LlamaIndex**](https://www.llamaindex.ai/) | Document ingestion and text splitting pipeline |
| [**Vite**](https://vitejs.dev/) | Next-generation frontend build tooling |
| [**Tailwind CSS**](https://tailwindcss.com/) | Utility-first CSS framework |
| [**React**](https://react.dev/) | UI library for the frontend SPA |
| [**Lucide**](https://lucide.dev/) | Beautiful open-source icon set |

---

<div align="center">

**Built with love using Google Gemini, Qdrant, Inngest, and React**

*If this project helped you, consider giving it a star on GitHub!*

</div>
