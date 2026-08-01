# TESTING.md

> Re-read REQUIREMENTS.md (edge cases section) before implementing tests.
> Given the "a few hours" time budget, testing is targeted, not exhaustive —
> prioritize tests that protect demo-day reliability over test coverage percentage.

---

## 1. Priority Order

1. **Schema validation tests** (`src/validation/`) — the single highest-risk
   point of silent failure. Test: valid LLM output passes, malformed JSON
   triggers retry logic, still-malformed after retry raises a typed error.
2. **Parser smoke tests** (`src/ingestion/parsers/`) — one test per parser
   using an actual seed file, asserting non-empty `rawText` is returned.
3. **Chunk/merge logic** (`src/extraction/chunk.ts`, `mergeChunks.ts`) —
   test that a long document is chunked and that duplicate concept names
   across chunks are merged, not duplicated.
4. **Repository round-trip tests** (`src/storage/`) — write then read back
   a document/concept/flashcard, assert data integrity.
5. **CLI end-to-end smoke test** — run `ingest` against a real seed PDF and
   a real seed transcript, assert exit code 0 and expected artifacts exist
   in the DB afterward. This is the single most valuable test for demo
   confidence.

## 2. Explicitly Not Prioritized (given time constraints)

- Web UI component tests — visual verification during demo rehearsal is
  the practical substitute given the time budget.
- Exhaustive edge-case coverage (documented limitations in REQUIREMENTS.md
  section 4 are accepted as-is for MVP, not tested against).
- Load/performance testing — out of scope for a take-home of this size.

## 3. Pre-Demo Checklist (run manually before the live demo, not automated)

- [ ] `ingest` works end-to-end on both seed PDF and seed transcript
- [ ] `list-topics` returns expected topics after seeding
- [ ] `export` produces valid JSON and valid CSV
- [ ] Web UI upload → results → graph render works on at least one seed file
- [ ] Fresh clone + documented setup steps work with zero undocumented steps
- [ ] `.env.example` has correct variable names matching `config.ts`
