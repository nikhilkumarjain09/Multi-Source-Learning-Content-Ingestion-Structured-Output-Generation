# DESIGN_SYSTEM.md

> Re-read SETTINGS.md before implementing UI. This covers the web UI only
> (FR6) — the CLI has no visual design beyond clean, readable terminal output.

---

## 1. Principles

- Minimal surface area. This is not a full app shell — it is one focused
  screen: upload/select a file, trigger the pipeline, view results
  (concepts, summary, flashcards, graph).
- Dark mode is the default and only theme for MVP — no theme toggle,
  that is a stretch feature, not core.
- The concept graph is the visual centerpiece. Everything else (upload
  control, summary text, flashcard list) is intentionally plain so the
  graph doesn't compete for attention.

---

## 2. Color Palette (dark theme)

- Background base: `#0F1115`
- Surface/card background: `#171A21`
- Border/divider: `#2A2E37`
- Primary text: `#E6E8EB`
- Secondary/muted text: `#8A8F98`
- Accent (primary actions, active graph nodes): `#5B8CFF`
- Success/positive state: `#3ECF8E`
- Warning/error state: `#F2555A`

## 3. Typography

- System font stack (no custom font loading needed for a time-boxed build):
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Headings: medium weight, not bold — avoid heavy visual shouting.
- Body text: 14–15px base size, comfortable line height (1.5).
- Monospace (for flashcard/JSON preview): `"SF Mono", Consolas, monospace`.

## 4. Components (minimal set)

- **Upload/select control:** single dropzone or file input, isolated
  loading state ("Parsing file…", "Extracting concepts…") shown inline
  next to the control — never a full-page spinner.
- **Summary panel:** simple card, muted background, primary-text summary
  content.
- **Flashcard list:** simple two-column (question/answer) list, expandable
  per card, not a heavy carousel component.
- **Concept graph:** SVG-rendered nodes (concepts) and edges (relationships),
  accent color for nodes, muted color for edges, edge type shown on hover
  (prerequisite / related-to / part-of) rather than always-visible labels
  to avoid clutter.
- **Topic browser:** simple list/search input filtering by topic name —
  no fancy autocomplete needed for MVP.

## 5. Icons

- lucide-react only. Suggested icons: `Upload`, `FileText`, `Network` (for
  graph), `Layers` (for concepts), `Download` (for export), `Loader2` (for
  isolated loading spinners, animated via CSS not a GIF).

## 6. Explicit Non-Goals for MVP UI

- No animations beyond simple loading spinners.
- No responsive/mobile layout polish — desktop-first is acceptable given
  the live demo context; note as a stretch item if time remains.
- No theming system/toggle.
- No onboarding/empty-state illustrations — a plain, clear text empty
  state is sufficient ("No documents ingested yet — upload a file to begin").
