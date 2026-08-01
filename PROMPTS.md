# PROMPTS.md
## MVP Implementation Prompts — Run in Order

Each prompt below is self-contained and follows the same pattern:
1. Re-read the relevant `.md` files first.
2. Implement only what the phase specifies — do not pull in later-phase
   scope even if it seems convenient.
3. End the phase with `git add -A`, a scoped commit message, and `git push`.

Copy each phase into your AI coding assistant one at a time, in order.
Do not skip the re-read instruction even if the phase seems simple.

---

### Phase 0 — Project Foundations

```
Read REQUIREMENTS.md, SETTINGS.md, and ARCHITECTURE.md in full before doing
anything else.

Scaffold the project per the folder structure in ARCHITECTURE.md section 3.
Set up:
- TypeScript config, package.json, and the locked tech stack from SETTINGS.md
  section 1
- .env.example with placeholder ANTHROPIC_API_KEY and any other config
  values referenced in ARCHITECTURE.md
- src/shared/config.ts centralizing DB path, LLM model name, token/chunk
  size limits, retry counts (no magic numbers elsewhere)
- SQLite DB initialization per DATABASE.md schema (all five tables, with
  the indexes specified)
- Empty placeholder files for each module listed in the folder structure
  so the project shape exists before logic is added

Do not implement any pipeline logic yet — this phase is scaffolding only.

When done: git add -A, commit with a message describing the scaffold setup,
git push.
```

---

### Phase 1 — Ingestion Layer

```
Read REQUIREMENTS.md, SETTINGS.md, and ARCHITECTURE.md (section 2.1)
before proceeding.

Implement:
- The Parser interface in src/ingestion/types.ts
- src/ingestion/parsers/pdfParser.ts (PDF text extraction)
- src/ingestion/parsers/textTranscriptParser.ts (plain text file reading)
- src/ingestion/registry.ts registering both parsers, with a function that
  selects the correct parser for a given file path

Add 2-3 seed PDF files to seed-data/pdfs/ and 2-3 seed transcript/doc text
files to seed-data/transcripts/ (real, readable educational content — not
placeholder lorem ipsum, since these will be used in the live demo).

Write the parser smoke tests specified in TESTING.md section 1, item 2,
using the seed files.

Do not implement normalization or extraction yet.

When done: git add -A, commit describing the ingestion layer, git push.
```

---

### Phase 2 — Normalization Layer

```
Read REQUIREMENTS.md and ARCHITECTURE.md (section 2.2) before proceeding.

Implement src/normalization/normalize.ts, converting any parser output into
the SourceDocument shape defined in ARCHITECTURE.md. Wire this to run
immediately after parser selection in a new orchestrator entry point
(src/pipeline.ts or similar) that: selects parser -> parses -> normalizes ->
returns a SourceDocument. Do not add extraction logic yet — the
orchestrator should currently stop after normalization and return the
result.

When done: git add -A, commit describing normalization + orchestrator
skeleton, git push.
```

---

### Phase 3 — Extraction Layer (LLM)

```
Read REQUIREMENTS.md (FR2), SETTINGS.md, and ARCHITECTURE.md (section 2.3)
before proceeding.

Implement:
- src/extraction/prompts/extractConcepts.prompt.ts — a strict,
  schema-constrained prompt instructing the LLM to return ONLY valid JSON
  matching the ExtractionResult shape (concepts, relationships, summary).
  Include explicit instructions in the prompt for relationship types
  (prerequisite, related-to, part-of) and to avoid any prose outside the
  JSON object.
- src/extraction/chunk.ts — chunks SourceDocument.rawText if it exceeds the
  configured token threshold from config.ts
- src/extraction/mergeChunks.ts — merges ExtractionResult objects from
  multiple chunks, deduping concepts by normalized (lowercased, trimmed) name
- src/extraction/extract.ts — orchestrates: chunk if needed -> call LLM per
  chunk -> merge results

Use the Anthropic API per SETTINGS.md section 1. Do not implement schema
validation yet (next phase) — for now, assume the LLM response can be
JSON.parsed directly, but wrap the parse in a try/catch that logs failures
clearly (this will be replaced by proper validation in Phase 4).

Extend the orchestrator to call extraction after normalization.

When done: git add -A, commit describing the extraction layer, git push.
```

---

### Phase 4 — Validation/Structuring Layer

```
Read REQUIREMENTS.md (FR2.2, FR2.3) and ARCHITECTURE.md (section 2.4)
before proceeding.

Implement:
- src/validation/schema.ts — zod schema for ExtractionResult
- src/validation/validateExtraction.ts — validates raw LLM output against
  the schema; on failure, constructs a repair prompt (include the original
  invalid output and the specific validation error) and retries the LLM
  call exactly once; on second failure, throws a typed, clear error

Wire this into src/extraction/extract.ts, replacing the try/catch
placeholder from Phase 3 with proper validation + retry-once logic.

Write the schema validation tests specified in TESTING.md section 1, item 1.

When done: git add -A, commit describing validation + retry logic, git push.
```

---

### Phase 5 — Structured Outputs (Flashcards, Summary, Graph Data)

```
Read REQUIREMENTS.md (FR3) and ARCHITECTURE.md (section 2.3, 2.6) before
proceeding.

Implement:
- src/outputs/flashcardExport.ts — generates flashcards from validated
  concepts (question/answer pairs), with functions to export as JSON and
  as CSV
- src/outputs/graphExport.ts — transforms concepts + relationships into
  { nodes, edges } graph data shape (per API.md graph response shape)
- Summary is already produced by the extraction layer (Phase 3) — ensure
  it flows through the orchestrator and gets stored

Extend the orchestrator so a completed pipeline run produces: validated
concepts, relationships, summary, flashcards, and graph data, all in
memory (storage comes next phase).

When done: git add -A, commit describing structured output generation,
git push.
```

---

### Phase 6 — Storage Layer

```
Read REQUIREMENTS.md (FR4.1), ARCHITECTURE.md (section 2.5), and
DATABASE.md in full before proceeding.

Implement the repository pattern exactly as specified in DATABASE.md and
ARCHITECTURE.md section 2.5:
- src/storage/db.ts (SQLite connection + schema creation from DATABASE.md)
- documentRepository.ts, conceptRepository.ts, relationshipRepository.ts,
  flashcardRepository.ts, summaryRepository.ts

No raw SQL outside these repository files. Wire the orchestrator to
persist all pipeline outputs (document, concepts, relationships,
flashcards, summary) via these repositories after a successful run.

Write the repository round-trip tests specified in TESTING.md section 1,
item 4.

When done: git add -A, commit describing the storage layer, git push.
```

---

### Phase 7 — Retrieval Layer

```
Read REQUIREMENTS.md (FR4.2) and ARCHITECTURE.md (section 2.6) before
proceeding.

Implement src/retrieval/getArtifactsByTopic.ts: given a topic/concept name,
query stored concepts (exact match, falling back to case-insensitive
substring match), and return the associated flashcards, summary(ies), and
graph data (nodes/edges limited to the matched concept and its direct
relationships).

When done: git add -A, commit describing the retrieval layer, git push.
```

---

### Phase 8 — CLI (Primary Interface)

```
Read REQUIREMENTS.md (FR5), ARCHITECTURE.md (section 2.7), and API.md
section 1 before proceeding.

Implement:
- src/cli/index.ts — CLI entrypoint
- src/cli/commands/ingest.ts — runs the full orchestrator pipeline against
  a given file path, prints a clear summary to stdout
- src/cli/commands/listTopics.ts — lists distinct stored concept/topic names
- src/cli/commands/export.ts — exports flashcards for a topic as JSON or CSV

Ensure every command has clear, human-readable error output (unsupported
file type, file not found, topic not found) and appropriate non-zero exit
codes on failure, per API.md section 1.

Write the CLI end-to-end smoke test specified in TESTING.md section 1,
item 5, running against the actual seed files from Phase 1.

Manually run through the pre-demo checklist in TESTING.md section 3 for
every CLI-related item and confirm each passes before moving on — this is
the demo-safety fallback and must be rock solid.

When done: git add -A, commit describing the CLI, git push.
```

---

### Phase 9 — Minimal Web UI

```
Read REQUIREMENTS.md (FR6), ARCHITECTURE.md (section 2.7), API.md
section 2, and DESIGN_SYSTEM.md in full before proceeding.

Implement:
- web/server/routes.ts — Express routes per API.md section 2, calling the
  exact same orchestrator/retrieval functions used by the CLI (no
  duplicated pipeline logic)
- web/client/ — minimal React app: file upload control (isolated loading
  state per DESIGN_SYSTEM.md), results display (summary, flashcard list),
  and an SVG-rendered concept graph (nodes/edges, accent color per
  DESIGN_SYSTEM.md section 2), plus a simple topic search/browse view

Follow DESIGN_SYSTEM.md exactly for colors, typography, and component
behavior. Use lucide-react icons only. No animations beyond loading
spinners. Dark theme only, no toggle.

Manually verify the web UI checklist items in TESTING.md section 3 before
considering this phase complete.

When done: git add -A, commit describing the minimal web UI, git push.
```

---

### Phase 10 — README, Seed Data Verification, Final Polish

```
Read REQUIREMENTS.md (Deliverables and NFR7) before proceeding.

Write a README.md covering: project overview, setup instructions (clone,
install, .env setup, DB init, how to run CLI and web UI), example CLI
usage against the seed data, and a short architecture summary linking to
ARCHITECTURE.md.

Verify the entire setup works from a clean clone (simulate this literally
if possible: fresh directory, follow only the README steps, confirm no
undocumented steps were needed).

Run through the full pre-demo checklist in TESTING.md section 3 one final
time, top to bottom.

When done: git add -A, commit describing README + final MVP verification,
git push.
```

---

### Phase 11 — Final Documentation PDF (run last, after MVP is demo-verified)

```
Read REQUIREMENTS.md, ARCHITECTURE.md, FEATURES.md, and README.md in full
before proceeding.

Generate a single comprehensive PDF document at docs/PROJECT_DOCUMENTATION.pdf
covering:
- Project overview and objective
- Full architecture explanation (pipeline layers, plugin pattern, folder
  structure) written in clear prose, not just copied file contents
- Complete functional feature list (what was built, mapped to each FR from
  REQUIREMENTS.md), clearly distinguishing MVP features actually completed
  from any stretch features completed if time allowed
- API/CLI usage guide with concrete example commands and expected output
- Database schema summary
- Setup/installation guide (mirroring README.md but expanded with
  screenshots or terminal output examples if feasible)
- Known limitations (from REQUIREMENTS.md section 4)
- A short "how this would scale" section (from ARCHITECTURE.md section 4)

Use a PDF generation approach appropriate to the project's existing tooling
(e.g., markdown-to-PDF via pandoc, or a scripted approach) — keep it clean,
readable, and free of emojis, consistent with SETTINGS.md.

When done: git add -A, commit describing the final documentation PDF,
git push.
```
