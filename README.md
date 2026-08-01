# Multi-Source Learning Content Ingestion & Structured Output Generation

A system to ingest learning materials (PDFs, plain-text transcripts/docs), normalize content, extract key concepts and relationships via LLM, and generate structured educational artifacts (flashcards, summaries, concept graphs).

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Run CLI:
   ```bash
   npm run cli -- --help
   ```

## Architecture & Documentation

- See `REQUIREMENTS.md` for project scope and functional requirements.
- See `SETTINGS.md` for standing conventions and tech stack constraints.
- See `ARCHITECTURE.md` for overall system design and layer responsibilities.
- See `DATABASE.md` for SQLite schema and indexes.
- See `API.md` for CLI and Web API interfaces.
