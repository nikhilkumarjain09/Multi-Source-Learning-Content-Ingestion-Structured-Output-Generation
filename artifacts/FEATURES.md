# FEATURES.md

> Re-read REQUIREMENTS.md before consulting this file. This file exists to
> answer one question fast, at any point in the build: "is what I'm about
> to build MVP or stretch, and if stretch, what priority?"

---

## MVP Features (must be done and demo-safe before anything else)

| ID | Feature | Maps to |
|----|---------|---------|
| M1 | PDF parsing | FR1.1 |
| M2 | Transcript/doc text parsing | FR1.2 |
| M3 | Normalization into SourceDocument | FR1.3 |
| M4 | LLM concept/relationship/summary extraction | FR2.1 |
| M5 | Schema validation + one retry on malformed output | FR2.2, FR2.3 |
| M6 | Chunking + cross-chunk merge for long docs | FR2.4 |
| M7 | Flashcard generation (JSON + CSV) | FR3.1 |
| M8 | Summary generation | FR3.2 |
| M9 | Concept graph data generation | FR3.3 |
| M10 | SQLite storage for all artifacts | FR4.1 |
| M11 | Topic-based retrieval | FR4.2 |
| M12 | CLI: ingest, list-topics, export | FR5.1–5.3 |
| M13 | Minimal web UI: upload, view results, graph render | FR6.1–6.3 |
| M14 | Seed data + README setup verified on clean env | Deliverables |

**Build order = this table's order.** Do not start M13 before M1–M12 are
solid — the CLI working end-to-end is the safety net for the live demo.

---

## Stretch Features (only after ALL MVP features are demo-solid)

Ordered by impact-to-effort ratio, highest first:

| ID | Feature | Why it's high-value | Effort |
|----|---------|---------------------|--------|
| S1 | Better error messages / edge-case handling for corrupted files (edge cases 4–6 in REQUIREMENTS.md) | Shows engineering maturity, cheap to add incrementally | Low |
| S2 | Cross-document concept deduplication (not just within-document) | Strengthens the "concept graph" story significantly | Medium |
| S3 | Graph viz polish (zoom/pan, node click-to-expand, edge-type legend) | Visual wow-factor for the live demo | Medium |
| S4 | Semantic/embedding-based topic retrieval (replacing exact/fuzzy match) | Strong technical depth talking point | Medium-High |
| S5 | Video/audio ingestion (transcription via Groq Whisper API `whisper-large-v3-turbo`) | Fulfills full multi-source scope with automated Speech-to-Text | Completed |
| S6 | Basic automated test suite beyond MVP smoke tests | Good practice, lower demo-visible impact | Low-Medium |
| S7 | Learning path generation (ordered sequence through prerequisite graph) | Directly extends concept graph into something actionable | Medium |

**Rule:** never start a stretch feature that risks destabilizing an MVP
feature that's already demo-solid. If in doubt, branch before attempting a
stretch feature so the MVP state is always recoverable.

---

---

## Product Terminology & User-Facing Feature Names

| Developer Term | Product & UX Term | User Description |
|----------------|-------------------|------------------|
| Ingestion Pipeline | Learning Engine / Content Analysis | Process of analyzing documents and extracting knowledge |
| SourceDocument | Learning Material | Uploaded PDF or text document in the library |
| Concept Extraction | Knowledge Analysis | Identifying key learning topics and definitions |
| Concept Graph | Knowledge Map | Interactive visual map of connected learning topics |
| Relationships | Topic Connections | Prerequisites, related topics, and sub-concepts |
| Flashcards | Study Decks / Revision Cards | Interactive question & answer review cards |
| Summary Engine | Executive Summaries | Auto-generated executive and beginner summaries |
| Topological Path | Learning Path Roadmap | Sequenced step-by-step topic study guide |
| Vector Search | Semantic Search | Intelligent topic search across the knowledge base |

