# DATABASE.md

> Re-read ARCHITECTURE.md (Storage Layer section) before implementing.
> Storage: SQLite, accessed only through repository files in `src/storage/`.

---

## 1. Schema

### `documents`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| filename | TEXT | original filename |
| source_type | TEXT | "pdf" \| "transcript" |
| raw_text | TEXT | normalized extracted text |
| metadata | TEXT | JSON blob |
| ingested_at | TEXT | ISO timestamp |

### `concepts`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| document_id | TEXT FK → documents.id | |
| name | TEXT | normalized (lowercased, trimmed) for dedupe matching |
| description | TEXT | |

### `relationships`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| from_concept_id | TEXT FK → concepts.id | |
| to_concept_id | TEXT FK → concepts.id | |
| type | TEXT | "prerequisite" \| "related-to" \| "part-of" |

### `flashcards`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| concept_id | TEXT FK → concepts.id | |
| question | TEXT | |
| answer | TEXT | |

### `summaries`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| document_id | TEXT FK → documents.id | |
| summary_text | TEXT | |

---

## 2. Indexing

- Index on `concepts.name` — this is the primary lookup path for
  topic-based retrieval (FR4.2).
- Index on `relationships.from_concept_id` and `relationships.to_concept_id`
  for fast graph edge lookups.

---

## 3. Access Rules

- No layer outside `src/storage/` executes raw SQL. All reads/writes go
  through the repository functions (`documentRepository.ts`,
  `conceptRepository.ts`, etc.) per ARCHITECTURE.md section 2.5.
- Repository functions return plain typed objects (not raw DB rows) — the
  mapping from DB row to domain type happens inside the repository file.

---

## 4. Migration Note (stretch-readiness)

If S4 (semantic search) is picked up later, it should be implementable as
an additional table (`concept_embeddings`) and an additional repository
file, without altering the schema above — this keeps the stretch feature
additive per SETTINGS.md's extensibility rules.
