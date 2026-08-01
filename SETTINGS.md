# SETTINGS.md
## Project Conventions & Standing Rules

> MANDATORY: Every implementation prompt must re-read this file, along with
> REQUIREMENTS.md and ARCHITECTURE.md, before writing or editing any code.
> These rules apply for the entire project lifetime, MVP and stretch phases alike.

---

## 1. Tech Stack (Locked)

- **Language/runtime:** Node.js + TypeScript
- **CLI framework:** commander (or equivalent lightweight CLI lib)
- **Web backend:** Express
- **Web frontend:** React + TypeScript, minimal component set
- **Storage:** SQLite (via better-sqlite3 or Prisma) — single file DB, zero
  external service dependency
- **LLM provider:** config-driven — default is Groq API, switchable to NVIDIA
  (NIM) purely via a config value, no code changes required. See section 7
  below for the provider abstraction contract. Structured/schema-constrained
  prompting is used regardless of provider.
- **PDF parsing:** pdf-parse (or equivalent)
- **Validation:** zod (schema validation for both LLM output and API payloads)
- **Graph rendering (web UI):** lightweight custom SVG or minimal D3 —
  no heavy graph libraries

Do not introduce a new major dependency (new framework, new DB, new cloud
service) without it being explicitly requested — this violates the
"no unnecessary infra" principle in REQUIREMENTS.md NFR5.

---

## 2. Code Style Rules

- **No emojis anywhere** — not in code, comments, commit messages, CLI
  output, or UI copy.
- **Dark theme as default** for the web UI (see DESIGN_SYSTEM.md).
- **Icons:** lucide-react only, no emoji-as-icon, no icon font kitchen-sinks.
- **Loading states:** isolated per-action loading states (e.g., "extracting
  concepts" spinner scoped to that action), never a single global spinner
  blocking the whole UI.
- **No dead scaffolding:** delete unused boilerplate from generators/templates
  immediately; do not leave commented-out example code in place.
- **Naming:** descriptive, domain-driven names (`extractConceptsFromChunk`,
  not `processData`). Avoid generic names like `handler`, `utils2`, `temp`.
- **Comments:** explain *why*, not *what* — avoid narrating obvious code.
  Code should not read as AI-generated: no excessive inline commentary,
  no repetitive boilerplate patterns copy-pasted across files without reason.
- **Error handling:** every I/O operation (file read, LLM call, DB write)
  must have explicit error handling with a human-readable message — never
  a bare try/catch that swallows the error silently.

---

## 3. Extensibility Rules (core to this project's design goal)

The project MUST be structured so that adding a feature is additive, not
invasive. Concretely:

- **New file-type parser** = one new file in `src/ingestion/parsers/`
  implementing the shared `Parser` interface, + one line registering it in
  `src/ingestion/registry.ts`. No changes to the orchestrator.
- **New output artifact type** (e.g., a new export format) = one new file
  in `src/outputs/`, + one registry entry. No changes to the extraction layer.
- **New CLI command** = one new file in `src/cli/commands/`, registered in
  the CLI entrypoint. No changes to existing commands.
- Any prompt that finds itself editing the core orchestrator/pipeline file
  just to add a feature should stop and reconsider whether that feature
  belongs behind the plugin interface instead.

---

## 4. Git & Commit Discipline

- Every implementation phase/prompt ends with:
  1. `git add -A`
  2. `git commit -m "<clear, scoped message describing the phase>"`
  3. `git push`
- Commit messages describe the *capability added*, not the file names
  touched. Example: `"Add PDF ingestion and text normalization pipeline"`,
  not `"update files"`.
- Never leave a phase uncommitted, even if the phase is partially finished —
  commit the working subset, note remaining work in the commit message or a
  TODO comment referencing the relevant FR number from REQUIREMENTS.md.

---

## 5. Environment & Config

- All secrets (API keys) via `.env`, never hardcoded, never committed.
  `.env.example` must be committed with placeholder values.
- Single `config.ts` (or equivalent) centralizing: DB path, LLM provider
  name, LLM model name, token/chunk size limits, retry counts — no magic
  numbers scattered across files.
- `.env` variables for the AI layer:
  - `LLM_PROVIDER` — `"groq"` (default) or `"nvidia"`
  - `GROQ_API_KEY`
  - `GROQ_MODEL` — e.g. a current Groq-hosted Llama/Mixtral model, confirm
    latest available model name at implementation time rather than
    assuming one from memory
  - `NVIDIA_API_KEY`
  - `NVIDIA_MODEL` — e.g. a current NVIDIA NIM-hosted model, same caveat
  - Switching providers is: change `LLM_PROVIDER` in `.env`, restart. No
    code edit required.

---

## 6. Re-Read Discipline

At the start of every implementation phase, re-read (in this order):
1. REQUIREMENTS.md — confirm scope hasn't drifted
2. ARCHITECTURE.md — confirm the layer/module being touched
3. FEATURES.md — confirm MVP vs stretch classification of the current task
4. Any format-specific doc relevant to the phase (DATABASE.md, API.md, etc.)

This re-read step exists specifically to prevent AI drift across a long,
multi-phase build — do not skip it even if the phase "seems simple."

---

## 7. LLM Provider Abstraction (contract — see ARCHITECTURE.md for placement)

All extraction-layer code must call a single provider-agnostic interface,
never a specific vendor SDK directly:

```ts
interface LLMProvider {
  complete(params: {
    systemPrompt?: string;
    userPrompt: string;
    maxTokens: number;
  }): Promise<{ text: string }>;
}
```

- `src/extraction/providers/groqProvider.ts` implements `LLMProvider` using
  the Groq API (OpenAI-compatible chat completions endpoint).
- `src/extraction/providers/nvidiaProvider.ts` implements `LLMProvider`
  using NVIDIA's API (NIM microservices are also OpenAI-compatible chat
  completions, so the two implementations should look structurally
  similar — mainly base URL, auth header, and model name differ).
- `src/extraction/providers/index.ts` reads `config.llmProvider` and
  returns the matching implementation — this is the ONLY place that
  branches on provider name. Everything upstream (extract.ts,
  validateExtraction.ts, etc.) only ever depends on `LLMProvider`, never
  on `config.llmProvider` directly.
- Adding a third provider later = one new file implementing `LLMProvider`
  + one line in the provider registry — no changes anywhere else. This
  follows the same plugin pattern already used for ingestion parsers.
