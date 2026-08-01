# Multi-Source Learning Content Ingestion & Structured Output Generation

A robust, production-grade system designed to ingest educational content (PDFs, plain-text transcripts, markdown documents), normalize input text, extract key learning concepts and directed relationships via LLM provider abstraction, and generate structured outputs (flashcards, summaries, and SVG concept graphs) backed by SQLite storage.

---

## 1. Architecture Summary

The project follows a strict layered architecture with decoupled responsibilities and zero circular dependencies:

```
Ingestion Layer (PDF & Transcript Parsers via Plugin Pattern)
      │
      ▼
Normalization Layer (Canonical SourceDocument Format)
      │
      ▼
Extraction Layer (LLM Provider Abstraction: Groq & NVIDIA NIM)
      │
      ▼
Validation & Structuring Layer (Zod Schema Validation & Single-Repair Retry)
      │
      ▼
Storage Layer (SQLite Repositories: Documents, Concepts, Relationships, Flashcards, Summaries)
      │
      ▼
Retrieval Layer (Topic Search with Exact Match & Substring Fallback)
      │
      ▼
Presentation Layer (CLI Commands + Minimal Web UI with SVG Concept Graph)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for full architectural details and layer boundaries.

---

## 2. Technical Stack

- **Runtime & Language:** Node.js + TypeScript (strict mode)
- **CLI Framework:** Commander
- **Web Backend:** Express.js
- **Web Frontend:** React + TypeScript (Dark Theme)
- **Database:** SQLite (via `better-sqlite3` with foreign keys enabled)
- **Validation:** Zod
- **PDF Parsing:** `pdf-parse`
- **LLM Providers:** Groq API (`llama-3.3-70b-versatile`) & NVIDIA NIM API (`meta/llama-3.3-70b-instruct`)
- **Icons:** `lucide-react`

---

## 3. Prerequisites & Environment Setup

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### Environment Setup

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone https://github.com/nikhilkumarjain09/Multi-Source-Learning-Content-Ingestion-Structured-Output-Generation.git
   cd Multi-Source-Learning-Content-Ingestion-Structured-Output-Generation
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your preferred LLM provider and API key:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_actual_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile

   # Alternative Provider: NVIDIA NIM
   # LLM_PROVIDER=nvidia
   # NVIDIA_API_KEY=your_actual_nvidia_api_key_here
   # NVIDIA_MODEL=meta/llama-3.3-70b-instruct
   ```

3. **Initialize SQLite Database:**
   ```bash
   npm run db:init
   ```

---

## 4. CLI Usage & Examples

The CLI provides demo-safe, end-to-end access to the pipeline.

### Command Help
```bash
npm run cli -- --help
```

### 1. Ingest Learning Files (`ingest <filePath>`)
Ingests a document, normalizes text, extracts concepts via LLM, generates flashcards/summaries, and persists records to SQLite:
```bash
# Ingest sample text transcript
npm run cli -- ingest seed-data/transcripts/machine_learning_intro.txt

# Ingest sample PDF file
npm run cli -- ingest seed-data/pdfs/neural_networks.pdf
```

### 2. List Stored Topics (`list-topics`)
Lists all distinct concept names stored in the database:
```bash
npm run cli -- list-topics
```

### 3. Export Topic Flashcards (`export <topic> --format json|csv`)
Exports flashcards for a specific topic to JSON or CSV format:
```bash
# Export flashcards to JSON format
npm run cli -- export "Machine Learning" --format json

# Export flashcards to CSV format
npm run cli -- export "Machine Learning" --format csv
```

---

## 5. Web UI & Express Server Execution

Start the Express API server and Web UI:
```bash
npm run server
```
Navigate to `http://localhost:3000` in your browser.

### Web UI Features:
- **File Upload:** Single dropzone control with inline progress spinner.
- **Document Summary:** Card view displaying concise summary text.
- **Interactive Concept Graph:** SVG-rendered nodes with accent coloring (`#5B8CFF`) and directed relationship edge tooltips (`prerequisite`, `related-to`, `part-of`).
- **Flashcard Cards & Exports:** Expandable Q&A flashcard list with instant JSON/CSV file download buttons.
- **Topic Browser:** Filterable list for browsing stored topics.

---

## 6. Verification & Test Suite

Run automated unit and integration tests:
```bash
# Build TypeScript project
npm run build

# Run Parser Smoke Tests
node node_modules/tsx/dist/cli.mjs tests/parserSmoke.test.ts

# Run Schema Validation & Repair Retry Tests
node node_modules/tsx/dist/cli.mjs tests/schemaValidation.test.ts

# Run Repository Round-Trip Data Integrity Tests
node node_modules/tsx/dist/cli.mjs tests/repositoryRoundtrip.test.ts

# Run Topic Retrieval Layer Tests
node node_modules/tsx/dist/cli.mjs tests/retrievalByTopic.test.ts

# Run Web API Endpoint Tests
node node_modules/tsx/dist/cli.mjs tests/webApi.test.ts

# Run CLI End-to-End Smoke Test
node node_modules/tsx/dist/cli.mjs tests/cliSmoke.test.ts
```

---

## 7. Project Documentation Index

- [REQUIREMENTS.md](REQUIREMENTS.md) — Functional and non-functional requirements single source of truth.
- [SETTINGS.md](SETTINGS.md) — Project conventions and tech stack constraints.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture, module boundaries, and scaling strategy.
- [DATABASE.md](DATABASE.md) — SQLite schema definition and indexing rules.
- [API.md](API.md) — CLI and Express Web API specifications.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — Web UI design tokens, color palette, and component specifications.
- [TESTING.md](TESTING.md) — Test strategy and pre-demo verification checklist.
