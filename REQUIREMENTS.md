# REQUIREMENTS.md
## Project: Multi-Source Learning Content Ingestion & Structured Output Generation

> Every implementation prompt must re-read this file before making changes.
> This file is the single source of truth for scope. If a request conflicts
> with this file, the file wins unless the user explicitly updates it.

---

## 1. Context & Constraints (Locked)

- **Demo type:** LIVE demo required. Every core-path feature must work
  reliably in front of a reviewer — no "works on my machine, mostly."
- **Time budget:** A few hours. MVP scope is deliberately small.
- **Input formats (MVP):** PDF and plain-text transcripts/docs only.
  Video/audio ingestion is explicitly OUT of MVP scope (see FEATURES.md
  stretch list).
- **Presentation:** CLI (primary, safe fallback) + minimal web UI with a
  concept graph visualization (secondary, cut first under time pressure).
- **Guiding principle:** Quality over quantity. A small set of features
  that work perfectly beats a large set that mostly work.
- **Extensibility principle:** Core architecture must allow new file types,
  new output artifacts, and new features to be added via isolated modules
  (see ARCHITECTURE.md plugin pattern), not by editing core pipeline code.

---

## 2. Functional Requirements (MVP — must work for live demo)

### FR1 — Ingestion
- FR1.1: Accept a PDF file and extract raw text.
- FR1.2: Accept a plain-text transcript/document file and extract raw text.
- FR1.3: Normalize both into a single internal `SourceDocument` shape
  (id, filename, sourceType, rawText, metadata).

### FR2 — Concept Extraction
- FR2.1: Send normalized text to an LLM with a strict, schema-constrained
  prompt requesting: list of concepts, topic hierarchy, concept
  relationships (prerequisite / related-to / part-of).
- FR2.2: Validate the LLM's JSON response against a defined schema.
- FR2.3: On invalid/malformed JSON, retry once with a repair prompt before
  failing the document (never silently drop it).
- FR2.4: Chunk input text if it exceeds a safe token threshold, then merge
  extracted concepts across chunks (dedupe by normalized concept name).

### FR3 — Structured Output Generation
- FR3.1: Generate flashcards (question/answer pairs) from extracted
  concepts, exportable as JSON and CSV.
- FR3.2: Generate a concise summary per source document.
- FR3.3: Generate concept graph data: nodes (concepts) + edges
  (relationships + relationship type).

### FR4 — Storage & Retrieval
- FR4.1: Persist documents, concepts, relationships, flashcards, and
  summaries.
- FR4.2: Retrieve all artifacts filtered by topic/concept name.

### FR5 — CLI (primary interface, must always work)
- FR5.1: `ingest <file>` — runs full pipeline end-to-end for one file,
  prints/saves resulting artifacts.
- FR5.2: `list-topics` — lists all extracted topics across ingested docs.
- FR5.3: `export <topic> --format json|csv` — exports flashcards for a topic.

### FR6 — Minimal Web UI (secondary, first thing cut under time pressure)
- FR6.1: Upload/select a file, trigger the pipeline, show extraction
  results (concepts, summary, flashcards).
- FR6.2: Render the concept graph (nodes + edges) visually.
- FR6.3: Simple topic-based browsing of stored artifacts.

---

## 3. Non-Functional Requirements

- **NFR1 — Reliability over completeness:** every MVP feature listed above
  must work end-to-end with the provided seed files, every time, before any
  stretch feature is attempted.
- **NFR2 — Demo safety:** the CLI path (FR5) must work independently of the
  web UI, so it serves as a fallback if the UI has issues live.
- **NFR3 — Extensibility:** adding a new file-type parser or a new output
  artifact type must not require modifying the core pipeline orchestrator —
  only adding a new module + one registry entry (see ARCHITECTURE.md).
- **NFR4 — Explainability:** LLM extraction failures must produce a clear,
  human-readable error, not a silent empty result.
- **NFR5 — No unnecessary infra:** SQLite (or equivalent embedded DB) only —
  no external DB service, no message queue, no auth system for MVP.
- **NFR6 — Code quality:** code should read as deliberately engineered, not
  AI-generated boilerplate — meaningful names, no dead scaffolding, no
  emojis anywhere, consistent style per SETTINGS.md.
- **NFR7 — Setup reproducibility:** a reviewer must be able to clone, run
  one setup command, and successfully run the CLI against seed data with
  zero undocumented steps.

---

## 4. Edge Cases (triaged — handle the first 3, document the rest as known limitations)

**Must handle for MVP:**
1. Corrupted or unparseable PDF (fail gracefully with a clear message, do
   not crash the pipeline for other files).
2. LLM returns malformed/non-JSON output (retry-once logic, FR2.3).
3. Very short input (e.g., a one-paragraph transcript) producing few or no
   concepts — return a valid empty-ish result, not an error.

**Documented as known limitations (not handled in MVP):**
4. Extremely long documents exceeding context window (chunking exists per
   FR2.4, but cross-chunk concept merge quality is best-effort, not exhaustive).
5. Non-English content.
6. Duplicate concepts across *different* source documents (only within-document
   dedupe is guaranteed in MVP).

---

## 5. Deliverables

- Working CLI pipeline (ingest → extract → structure → store → retrieve/export).
- Minimal web UI with concept graph visualization.
- Seed data: 2–3 sample PDFs, 2–3 sample transcript/doc text files.
- README with setup instructions verified on a clean environment.
- PDF documentation (generated at the end) covering architecture, features,
  and a usage guide — for the reviewer to read even without running the code.

---

## 6. Explicitly Out of Scope for MVP

- Video/audio ingestion and transcription.
- User authentication or multi-user support.
- Semantic/embedding-based search (topic retrieval is exact/fuzzy string
  match on concept/topic name for MVP).
- Automated test suite covering every edge case (targeted tests only —
  see TESTING.md).
