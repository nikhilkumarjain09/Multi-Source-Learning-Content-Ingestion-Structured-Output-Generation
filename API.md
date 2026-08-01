# API.md

> Re-read ARCHITECTURE.md (Presentation Layer section) before implementing.
> Two interfaces exist: CLI (primary/demo-safe) and Web API (secondary).

---

## 1. CLI Commands

### `ingest <filePath>`
Runs the full pipeline (parse → normalize → extract → validate → store)
for one file.
- **Output:** prints a summary (concepts found, flashcards generated) to
  stdout; artifacts are persisted to SQLite.
- **Errors:** clear message on unsupported file type, corrupted file, or
  extraction failure after retry — process exits non-zero, does not crash
  silently.

### `list-topics`
Lists all distinct concept/topic names currently stored.
- **Output:** simple newline-delimited list, sorted alphabetically.

### `export <topic> --format json|csv`
Exports flashcards for a given topic.
- **Output:** writes a file to the current directory
  (`<topic>-flashcards.json` or `.csv`).
- **Errors:** clear message if topic not found (suggest closest match if
  feasible, otherwise just state "not found").

---

## 2. Web API (Express, thin wrapper over the same pipeline functions used by the CLI)

### `POST /api/ingest`
- **Body:** multipart file upload
- **Response 200:**
```json
{
  "documentId": "string",
  "concepts": [{ "name": "string", "description": "string" }],
  "relationships": [{ "from": "string", "to": "string", "type": "prerequisite|related-to|part-of" }],
  "summary": "string",
  "flashcards": [{ "question": "string", "answer": "string" }]
}
```
- **Response 422:** `{ "error": "human-readable message" }` — malformed
  file or extraction failure after retry.

### `GET /api/topics`
- **Response 200:** `{ "topics": ["string", ...] }`

### `GET /api/topics/:topic`
- **Response 200:**
```json
{
  "topic": "string",
  "flashcards": [{ "question": "string", "answer": "string" }],
  "summary": "string",
  "graph": {
    "nodes": [{ "id": "string", "label": "string" }],
    "edges": [{ "from": "string", "to": "string", "type": "string" }]
  }
}
```
- **Response 404:** topic not found

---

## 3. Consistency Rule

Both the CLI and the Web API must call the exact same underlying pipeline
functions (from `src/extraction/`, `src/storage/`, `src/retrieval/`) —
neither interface should contain its own copy of pipeline logic. This is
what guarantees the CLI fallback behaves identically to the web UI during
the live demo.
