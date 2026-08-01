const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function buildDocumentationPdf() {
  return new Promise((resolve, reject) => {
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const targetPath = path.join(reportsDir, 'PROJECT_DOCUMENTATION.pdf');
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
    });

    const writeStream = fs.createWriteStream(targetPath);
    doc.pipe(writeStream);

    // Styling constants
    const PRIMARY_COLOR = '#0F1115';
    const ACCENT_COLOR = '#1A56DB';
    const TEXT_COLOR = '#2D3748';
    const MUTED_COLOR = '#718096';
    const LIGHT_BG = '#F7FAFC';
    const BORDER_COLOR = '#E2E8F0';

    // Helper functions for PDF formatting
    const addHeader = (text, level = 1) => {
      doc.moveDown(0.5);
      if (level === 1) {
        doc.fillColor(ACCENT_COLOR).fontSize(16).font('Helvetica-Bold').text(text);
        doc.moveDown(0.2);
        doc.strokeColor(ACCENT_COLOR).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
      } else if (level === 2) {
        doc.fillColor(PRIMARY_COLOR).fontSize(13).font('Helvetica-Bold').text(text);
        doc.moveDown(0.3);
      } else {
        doc.fillColor(PRIMARY_COLOR).fontSize(11).font('Helvetica-Bold').text(text);
        doc.moveDown(0.2);
      }
      doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10);
    };

    const addParagraph = (text) => {
      doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10).text(text, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.4);
    };

    const addBullet = (title, description) => {
      doc.fillColor(TEXT_COLOR).fontSize(10).font('Helvetica-Bold').text(`• ${title}: `, { continued: true });
      doc.font('Helvetica').text(description, { lineGap: 2 });
      doc.moveDown(0.25);
    };

    const addCodeBlock = (code) => {
      doc.moveDown(0.25);
      const startY = doc.y;
      doc.font('Courier').fontSize(8.5);
      const textHeight = doc.heightOfString(code, { width: 475 });

      doc.rect(50, startY, 495, textHeight + 10).fillAndStroke(LIGHT_BG, BORDER_COLOR);
      doc.fillColor('#1A202C').text(code, 58, startY + 5, { width: 475 });
      doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR);
      doc.y = startY + textHeight + 15;
      doc.moveDown(0.25);
    };

    // --- Title Page Header ---
    doc.fillColor(PRIMARY_COLOR).fontSize(22).font('Helvetica-Bold').text('Multi-Source Learning Content Ingestion & Structured Output Generation', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor(ACCENT_COLOR).fontSize(13).font('Helvetica').text('Comprehensive System Architecture, Functional Feature Mapping & Technical Reference', { align: 'center' });
    doc.moveDown(0.5);
    doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // --- 1. Project Overview & Objective ---
    addHeader('1. Executive Overview & System Objectives', 1);
    addParagraph(
      'The Multi-Source Learning Content Ingestion System is an enterprise-grade platform built to solve the challenge of transforming unstructured educational materials into structured, interactive learning artifacts. By accepting diverse input formats—including PDFs, plain-text transcripts, VTT subtitle tracks, and video/audio transcript sidecars—the platform extracts key concepts, topological prerequisite relationships, concise document summaries, flashcard study decks, and vector embeddings for semantic search.'
    );
    addParagraph(
      'Designed around a strict unidirectional layer architecture, the system guarantees zero circular dependencies, provider-agnostic LLM extraction (supporting Groq, NVIDIA NIM, and Anthropic), schema validation with automatic repair retries, cross-document concept deduplication, and a dual-interface presentation layer comprising a Commander CLI and a dark-mode React web application.'
    );

    // --- 2. Complete Architecture Explanation ---
    addHeader('2. Complete System Architecture', 1);
    addParagraph(
      'The architecture comprises seven isolated, sequential layers. Each layer communicates exclusively through defined TypeScript interfaces, preventing cross-layer coupling and enabling independent extensibility.'
    );

    addCodeBlock(
`+-----------------------------------------------------------------------------------+
|                           SYSTEM PIPELINE FLOW DIAGRAM                            |
+-----------------------------------------------------------------------------------+
[ 1. Ingestion Layer ]   --> Parsers (PDF, TXT, VTT, Video/Audio Sidecars)
         |
[ 2. Normalization ]     --> SourceDocument Canonical Format + i18n Language Detection
         |
[ 3. Extraction Layer ]  --> Chunking + LLM Provider (Groq/NVIDIA) + Reconciler
         |
[ 4. Validation Layer ]  --> Zod Schema Verification + 1-Repair Retry Loop
         |
[ 5. Storage Layer ]     --> SQLite Repositories (Docs, Concepts, Rel, Flashcards, Embeddings)
         |
[ 6. Retrieval Layer ]   --> Multi-Stage Retrieval (Exact, Substring, Cosine Vector Fallback)
         |
[ 7. Presentation ]      --> Commander CLI Commands & Express/React Dark Theme Web UI
+-----------------------------------------------------------------------------------+`
    );

    addHeader('Layer Responsibilities & Design Patterns', 2);
    addBullet('Ingestion Layer (`src/ingestion/`)', 'Implements the Plugin Pattern via `registry.ts` and `Parser` interface. Translates raw files into structured raw text and metadata.');
    addBullet('Normalization Layer (`src/normalization/`)', 'Converts parsed outputs into the canonical `SourceDocument` schema. Evaluates document language script distribution (`src/ingestion/language.ts`).');
    addBullet('Extraction Layer (`src/extraction/`)', 'Uses token/character chunking, LLM provider abstractions (`GroqProvider`, `NVIDIAProvider`), and a second-pass multi-chunk reconciliation prompt (`mergeChunks.ts`).');
    addBullet('Validation/Structuring Layer (`src/validation/`)', 'Validates raw LLM JSON outputs against Zod schemas. Triggers a single repair retry on malformed JSON before raising typed errors.');
    addBullet('Storage Layer (`src/storage/`)', 'Repository pattern over SQLite (`better-sqlite3`). Implements cross-document deduplication via lowercased `canonical_name` matching and `concept_documents` junction table.');
    addBullet('Retrieval Layer (`src/retrieval/`)', 'Provides multi-stage retrieval: exact match -> substring match -> semantic nearest-neighbor vector search fallback via `concept_embeddings`.');
    addBullet('Presentation Layer (`src/cli/` & `web/`)', 'Standalone Commander CLI for offline demo safety, paired with Express REST API and a React Web UI featuring SVG concept graph pan/zoom and topological learning paths.');

    addHeader('Running the Project', 2);
    addParagraph('Order of operations for local development:');
    addCodeBlock(
`# 1. Install & configure environment
npm install && cp .env.example .env

# 2. Initialize database schema
npm run db:init

# 3. Run CLI ingestion & learning path commands
npm run cli -- ingest seed-data/pdfs/neural_networks.pdf
npm run cli -- learning-path "Artificial Intelligence"

# 4. Launch web server & UI
npm run build && npx vite build --prefix web/client && npm run server`
    );

    addHeader('Scaling & Future Roadmap', 2);
    addBullet('Database Migration', 'SQLite repositories can be swapped for PostgreSQL / Supabase with zero changes to business logic layers.');
    addBullet('Async Job Queues', 'Large document processing can be offloaded to Redis-backed BullMQ job queues with WebSocket progress notifications.');
    addBullet('Vector Search Scaling', 'Local 128-dim TF-IDF n-gram embeddings can scale seamlessly to PGVector or Qdrant for millions of concepts.');
    addBullet('Parallel Extraction', 'Chunk extractions execute concurrently via worker pools, merged by second-pass LLM reconciliation.');
    addBullet('Retrieval Caching', 'Redis LRU caching layer for sub-millisecond retrieval responses on popular topic graphs.');

    addHeader('Internationalization (i18n)', 2);
    addParagraph(
      'Document Language Detection automatically flags non-Latin content. Future multi-lingual support extends extraction prompts to output English canonical concept names alongside localized names (`canonical_name_en`), while UI components reference JSON translation catalogs (`locales/en.json`).'
    );

    // --- 3. Functional Feature List ---
    addHeader('3. Functional Feature Mapping (MVP & Completed Stretch Features)', 1);

    addHeader('MVP Core Features (100% Completed)', 2);
    addBullet('M1: PDF Parsing', 'Extracts clean text from PDF documents using pdf-parse with fallback streams (FR1.1).');
    addBullet('M2: Transcript Text Parsing', 'Ingests text and markdown transcripts into clean string representations (FR1.2).');
    addBullet('M3: Source Document Normalization', 'Maps parsed files into canonical SourceDocument objects (FR1.3).');
    addBullet('M4: LLM Concept & Relationship Extraction', 'Extracts concepts, prerequisite/related-to/part-of relationships, and summaries (FR2.1).');
    addBullet('M5: Schema Validation & Repair Retry', 'Zod schema validation with automatic single-repair re-prompt on malformed JSON (FR2.2, FR2.3).');
    addBullet('M6: Chunking & Merge Logic', 'Token-threshold text chunking with concept deduplication (FR2.4).');
    addBullet('M7: Flashcard Generation', 'Generates concept Q&A flashcards exportable in JSON and CSV formats (FR3.1).');
    addBullet('M8: Summary Generation', 'Produces concise summaries per source document (FR3.2).');
    addBullet('M9: Concept Graph Data', 'Transforms concepts and relationships into node/edge graph data structures (FR3.3).');
    addBullet('M10: SQLite Storage Layer', 'Persists all entities via thin repository patterns with foreign keys enabled (FR4.1).');
    addBullet('M11: Topic-Based Retrieval', 'Queries stored artifacts by concept name with exact and substring matching (FR4.2).');
    addBullet('M12: Standalone CLI Interface', 'Commander CLI commands: ingest, list-topics, export (FR5.1-FR5.3).');
    addBullet('M13: React Web UI', 'Dark-theme UI featuring file dropzone, summary view, flashcard decks, and SVG graph (FR6.1-FR6.3).');
    addBullet('M14: Setup Reproducibility', 'Clean setup verified with seed data and comprehensive documentation.');

    addHeader('Completed Stretch Features (100% Completed)', 2);
    addBullet('S1: Edge-Case Hardening', 'Non-English script detection and second-pass LLM multi-chunk concept reconciliation.');
    addBullet('S2: Cross-Document Deduplication', 'Canonical concept name deduplication across distinct documents via junction table.');
    addBullet('S3: SVG Graph Visualization Polish', 'Interactive SVG canvas with pan/zoom controls, node click-to-expand panel, and edge legends.');
    addBullet('S4: Semantic Vector Retrieval', '128-dimensional n-gram TF-IDF embeddings stored in SQLite with cosine similarity search fallback.');
    addBullet('S5: Video & Audio File Ingestion', '`videoParser.ts` for MP4, MP3, WAV, and VTT/SRT subtitle track ingestion.');
    addBullet('S6: Comprehensive Automated Test Suite', '13 unit and integration test modules executed via `npm run test`.');
    addBullet('S7: Topological Learning Path Generation', 'Computes step-by-step ordered learning paths using Kahn\'s topological sort algorithm.');

    // --- 4. API & CLI Usage Guide ---
    addHeader('4. API & CLI Usage Guide', 1);
    addParagraph('The platform provides complete CLI and REST API parity:');
    addCodeBlock(
`# CLI Commands:
npm run cli -- ingest <filePath>
npm run cli -- list-topics
npm run cli -- export <topic> -f <json|csv>
npm run cli -- learning-path <topic> -f <text|json>

# REST API Endpoints:
POST /api/ingest            (Multipart file upload -> JSON pipeline response)
GET  /api/topics            (Returns list of distinct stored topic names)
GET  /api/topics/:topic     (Returns concepts, flashcards, summary, graph & learning path)`
    );

    // --- 5. Database Schema Summary ---
    addHeader('5. Database Schema Summary', 1);
    addParagraph('Relational SQLite schema managed via `src/storage/db.ts`:');
    addBullet('documents', 'id (PK), filename, source_type, raw_text, metadata (JSON), ingested_at');
    addBullet('concepts', 'id (PK), document_id (FK), name, description, canonical_name');
    addBullet('concept_documents', 'concept_id (FK), document_id (FK) - Composite PK for cross-document dedupe');
    addBullet('relationships', 'id (PK), from_concept_id (FK), to_concept_id (FK), type');
    addBullet('flashcards', 'id (PK), concept_id (FK), question, answer');
    addBullet('summaries', 'id (PK), document_id (FK), summary_text');
    addBullet('concept_embeddings', 'concept_id (PK, FK), embedding (JSON vector array)');

    // --- 6. Known Limitations ---
    addHeader('6. Known Limitations', 1);
    addBullet('Non-English Support', 'System explicitly detects and rejects non-Latin scripts; native multi-language translation is deferred.');
    addBullet('Binary Media Transcriptions', 'Video/audio parsing requires VTT/SRT subtitle sidecars unless local Whisper binary is installed.');

    // Page Numbers Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor(MUTED_COLOR).fontSize(8).text(
        `Multi-Source Learning Ingestion System — Project Documentation | Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 35,
        { align: 'center', width: 495 }
      );
    }

    doc.end();

    writeStream.on('finish', () => {
      console.log(`Successfully generated documentation PDF at: ${targetPath}`);
      resolve();
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

if (require.main === module) {
  buildDocumentationPdf().catch(err => {
    console.error('PDF Generation Failure:', err);
    process.exit(1);
  });
}

module.exports = { buildDocumentationPdf };
