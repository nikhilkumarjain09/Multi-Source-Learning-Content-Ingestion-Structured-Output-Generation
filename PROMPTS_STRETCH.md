# PROMPTS_STRETCH.md
## Stretch Feature Prompts — Run ONLY After MVP (Phases 0–11) Is Fully Demo-Verified

Run these in priority order from FEATURES.md (S1 -> S7). Before starting
any stretch prompt, confirm the MVP demo checklist in TESTING.md section 3
still passes. Consider creating a git branch before each stretch feature so
the MVP state on main/master is always recoverable if a stretch feature
runs out of time mid-implementation.

Each prompt follows the same discipline as PROMPTS.md: re-read first,
implement only the specified scope, commit and push at the end.

---

### Stretch S1 — Edge Case Hardening

```
Read REQUIREMENTS.md section 4 (edge cases) and FEATURES.md (S1) before
proceeding.

Add explicit handling for the "documented as known limitations" edge cases
from REQUIREMENTS.md section 4, specifically:
- Long documents exceeding context window: improve chunk merge quality
  (e.g., a second-pass LLM call that reconciles concepts across chunk
  boundaries rather than pure name-based dedupe)
- Non-English content: detect and either process as-is or return a clear
  "unsupported language" message rather than a silent poor-quality result

Do not touch any MVP pipeline logic outside what's needed for these two
cases specifically.

When done: git add -A, commit describing edge case hardening, git push.
```

---

### Stretch S2 — Cross-Document Concept Deduplication

```
Read ARCHITECTURE.md (section 2.3, 2.5) and FEATURES.md (S2) before
proceeding.

Currently concept dedupe only happens within a single document's chunks
(mergeChunks.ts). Extend this so that when a new document is ingested, its
extracted concepts are checked against ALL existing concepts already
stored in the database (via conceptRepository.ts), not just within the
current document. Matching concepts should be linked (same concept_id
referenced, or a normalized "canonical name" field added) rather than
duplicated as separate rows.

Update the retrieval layer (getArtifactsByTopic.ts) so a topic search
returns artifacts correctly aggregated across all documents that
contributed to that concept.

When done: git add -A, commit describing cross-document dedupe, git push.
```

---

### Stretch S3 — Graph Visualization Polish

```
Read DESIGN_SYSTEM.md and FEATURES.md (S3) before proceeding.

Enhance the concept graph in the web UI with:
- Pan and zoom on the SVG canvas
- Click-to-expand: clicking a node highlights its direct edges and shows
  a small detail panel (concept description, related flashcards)
- A small always-visible legend distinguishing prerequisite / related-to /
  part-of edge styles (color or line style, not just on-hover text)

Do not change the underlying graph data shape from ARCHITECTURE.md/API.md
— this is a rendering-only enhancement.

When done: git add -A, commit describing graph visualization polish,
git push.
```

---

### Stretch S4 — Semantic Topic Retrieval

```
Read ARCHITECTURE.md (section 2.6, section 4 scaling story) and
DATABASE.md section 4 (migration note) before proceeding.

Add a concept_embeddings table (per DATABASE.md section 4 guidance) and a
new repository file for it. Generate embeddings for each concept at
ingestion time. Update getArtifactsByTopic.ts to fall back to nearest-
embedding semantic match when exact/fuzzy string match returns no results,
without changing the function's external interface or return shape.

When done: git add -A, commit describing semantic retrieval, git push.
```

---

### Stretch S5 — Video/Audio Ingestion

```
Read ARCHITECTURE.md section 2.1 (plugin pattern) and REQUIREMENTS.md
section 6 (explicitly out of scope for MVP) before proceeding.

Add a new videoParser.ts implementing the existing Parser interface,
using a transcription approach appropriate to available tooling (e.g., an
existing transcript-extraction library, or an external transcription API
if one is already configured in this environment). Register it in
src/ingestion/registry.ts. No changes to any other layer should be
required — if changes outside the ingestion layer seem necessary, stop and
reconsider whether the Parser interface needs a small, backward-compatible
extension rather than a broader refactor.

Add 1-2 seed video/audio files if feasible, or clearly document in the
README that this parser is implemented but not demo-verified with seed
data, if no suitable seed file is available.

When done: git add -A, commit describing video/audio ingestion, git push.
```

---

### Stretch S6 — Expanded Automated Test Suite

```
Read TESTING.md in full before proceeding.

Expand test coverage beyond the MVP smoke tests: add tests for the edge
cases handled in Stretch S1, the cross-document dedupe logic from Stretch
S2 (if implemented), and any additional parsers added (Stretch S5, if
implemented). Do not reduce or weaken any existing MVP test.

When done: git add -A, commit describing expanded test coverage, git push.
```

---

### Stretch S7 — Learning Path Generation

```
Read REQUIREMENTS.md (FR3.3) and FEATURES.md (S7) before proceeding.

Add a new module src/outputs/learningPath.ts that, given a topic or a full
concept graph, produces an ordered sequence of concepts respecting
"prerequisite" edges (topological ordering). Expose this via a new CLI
command (src/cli/commands/learningPath.ts) and, if time allows, a simple
ordered-list view in the web UI alongside the graph.

When done: git add -A, commit describing learning path generation,
git push.
```

---

## After Any Stretch Work — Final Re-Verification

```
Read TESTING.md section 3 (pre-demo checklist) before proceeding.

Re-run the full pre-demo checklist end-to-end, including every stretch
feature added. If a stretch feature is incomplete or unstable at the time
you need to stop, either revert it to the last known-good commit or
clearly disable/hide it from the demo path (e.g., feature-flag it off in
config.ts) so the MVP path remains the guaranteed fallback.

Update docs/PROJECT_DOCUMENTATION.pdf (from PROMPTS.md Phase 11) to
reflect any stretch features actually completed, re-generate it, and:
git add -A, commit describing final stretch verification and updated
documentation, git push.
```
