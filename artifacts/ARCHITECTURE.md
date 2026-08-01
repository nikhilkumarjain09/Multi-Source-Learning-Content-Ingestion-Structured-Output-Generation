# ARCHITECTURE.md

> Re-read REQUIREMENTS.md and SETTINGS.md before implementing anything in
> this document. This file defines module boundaries — do not cross them
> even under time pressure; crossing them is what makes stretch features
> expensive later.

---

## 1. Pipeline Overview

```
Ingestion Layer
      |
      v
Normalization Layer
      |
      v
Extraction Layer (LLM)
      |
      v
Validation/Structuring Layer
      |
      v
Storage Layer
      |
      v
Retrieval Layer
      |
      v
Presentation Layer (CLI + Web UI)
```

Each layer only talks to the layer directly adjacent to it, through a
defined TypeScript interface/type. No layer reaches "up" or "sideways"
past its neighbor.

---

## 2. Layer Responsibilities

### 2.1 Ingestion Layer (`src/ingestion/`)
- Responsible ONLY for turning a file on disk into raw extracted text +
  basic metadata (filename, sourceType, pageCount if applicable).
- Implements the plugin pattern:

```ts
interface Parser {
  supports(filePath: string): boolean;
  parse(filePath: string): Promise<{ rawText: string; metadata: Record<string, unknown> }>;
}
```

- `registry.ts` holds an array of registered parsers. The orchestrator
  asks the registry "who supports this file?" and never contains
  format-specific logic itself.
- MVP parsers: `pdfParser.ts`, `textTranscriptParser.ts`.
- Adding video/audio later = one new `videoParser.ts` + one registry line.

### 2.2 Normalization Layer (`src/normalization/`)
- Converts any parser's raw output into the single canonical shape:

```ts
interface SourceDocument {
  id: string;
  filename: string;
  sourceType: string;
  rawText: string;
  metadata: Record<string, unknown>;
  ingestedAt: string;
}
```

- This is the only shape the rest of the pipeline ever sees — ingestion
  format differences stop here.

### 2.3 Extraction Layer (`src/extraction/`)
- Takes a `SourceDocument`, chunks text if needed (token-threshold based),
  and calls the LLM (via the provider abstraction below) with a strict
  schema-constrained prompt.
- Prompt templates live in `src/extraction/prompts/` as separate files,
  not inline strings in logic files — makes prompt iteration low-risk.
- **LLM provider abstraction** (`src/extraction/providers/`): `extract.ts`
  depends only on the `LLMProvider` interface defined in SETTINGS.md
  section 7 — it never imports a vendor SDK directly. `providers/index.ts`
  selects between `groqProvider.ts` (default) and `nvidiaProvider.ts` based
  on `config.llmProvider`. Switching providers is a `.env` change
  (`LLM_PROVIDER=groq` or `LLM_PROVIDER=nvidia`), not a code change.
- Output target schema (validated via zod in the next layer):

```ts
interface ExtractionResult {
  concepts: { name: string; description: string }[];
  relationships: { from: string; to: string; type: "prerequisite" | "related-to" | "part-of" }[];
  summary: string;
}
```

- Chunk merge logic (dedupe by normalized concept name) lives here too,
  isolated in `mergeChunks.ts`.

### 2.4 Validation/Structuring Layer (`src/validation/`)
- Validates raw LLM JSON output against the `ExtractionResult` zod schema.
- On failure: triggers ONE repair retry (re-prompt with the error + original
  output asking for a corrected JSON), per REQUIREMENTS.md FR2.3.
- On second failure: raises a clear, typed error — never returns a silently
  empty/partial result without flagging it.

### 2.5 Storage Layer (`src/storage/`)
- Thin repository pattern over MongoDB (via Mongoose). One repository file
  per entity: `documentRepository.ts`, `conceptRepository.ts`,
  `flashcardRepository.ts`, `relationshipRepository.ts`,
  `summaryRepository.ts`.
- No raw Mongoose queries outside repository files — all other layers call
  repository functions only. Repository functions return plain typed
  objects (not raw Mongoose documents), keeping every other layer
  decoupled from Mongoose internals.
- **Serverless-safe connection handling (`db.ts`):** because the web
  app/API deploys to Vercel, `db.ts` must cache the Mongoose connection on
  the Node.js global object and reuse it across warm invocations, rather
  than calling `mongoose.connect()` on every request. Opening a fresh
  connection per invocation is the single most common cause of Mongo
  connection-limit errors on serverless platforms. The CLI, which runs as
  a normal long-lived local process, can use a simpler connect-once-at-
  startup pattern — both paths go through the same `db.ts` module so
  repository code never needs to know which context it's running in.

### 2.6 Retrieval Layer (`src/retrieval/`)
- `getArtifactsByTopic(topicName)` — fuzzy/exact match against stored
  concept names, returns associated flashcards, summary, and graph data.
- Isolated from storage internals — presentation layer never queries
  SQLite directly, only through this layer.

### 2.7 Presentation Layer
- **CLI** (`src/cli/`): commands map 1:1 to pipeline entry points. The CLI
  must be able to run the entire pipeline with zero dependency on the web
  server being up — this is the demo-safety fallback (NFR2).
- **Web UI** (`web/`): thin Express API (`web/server/`) exposing the same
  underlying pipeline/retrieval functions, plus a React frontend
  (`web/client/`) for upload + concept graph visualization.

---

## 3. Folder Structure

```
project-root/
├── src/
│   ├── ingestion/
│   │   ├── parsers/
│   │   │   ├── pdfParser.ts
│   │   │   └── textTranscriptParser.ts
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── normalization/
│   │   └── normalize.ts
│   ├── extraction/
│   │   ├── prompts/
│   │   │   └── extractConcepts.prompt.ts
│   │   ├── providers/
│   │   │   ├── groqProvider.ts
│   │   │   ├── nvidiaProvider.ts
│   │   │   └── index.ts
│   │   ├── extract.ts
│   │   ├── chunk.ts
│   │   └── mergeChunks.ts
│   ├── validation/
│   │   ├── schema.ts
│   │   └── validateExtraction.ts
│   ├── storage/
│   │   ├── db.ts
│   │   ├── documentRepository.ts
│   │   ├── conceptRepository.ts
│   │   ├── relationshipRepository.ts
│   │   ├── flashcardRepository.ts
│   │   └── summaryRepository.ts
│   ├── retrieval/
│   │   └── getArtifactsByTopic.ts
│   ├── outputs/
│   │   ├── flashcardExport.ts   # json + csv
│   │   └── graphExport.ts
│   ├── cli/
│   │   ├── index.ts
│   │   └── commands/
│   │       ├── ingest.ts
│   │       ├── listTopics.ts
│   │       └── export.ts
│   └── shared/
│       ├── config.ts
│       └── types.ts
├── web/
│   ├── server/
│   │   └── routes.ts
│   └── client/
│       ├── src/
│       │   ├── components/
│       │   └── App.tsx
│       └── index.html
├── seed-data/
│   ├── pdfs/
│   └── transcripts/
├── docs/
│   └── (generated PDF documentation goes here)
├── tests/
├── .env.example
├── README.md
└── package.json
```

---

## 4. Scaling Story (for interview "how would you scale this" discussion)

- Ingestion could move to a queue (e.g., a job per uploaded file) so large
  batch uploads don't block a request thread.
- Extraction is the expensive step — could be parallelized per-chunk with
  a worker pool, with results merged asynchronously.
- Retrieval could move from exact/fuzzy match to embedding-based semantic
  search (vector DB) without changing the retrieval layer's external
  interface — only its internal implementation.
- SQLite could be swapped for Postgres behind the same repository
  interfaces with no changes required in any other layer — this is the
  direct payoff of the repository pattern.
