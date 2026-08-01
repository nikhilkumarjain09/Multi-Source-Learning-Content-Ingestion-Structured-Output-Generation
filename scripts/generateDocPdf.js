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
        doc.fillColor(ACCENT_COLOR).fontSize(15).font('Helvetica-Bold').text(text);
        doc.moveDown(0.2);
        doc.strokeColor(ACCENT_COLOR).lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
      } else if (level === 2) {
        doc.fillColor(PRIMARY_COLOR).fontSize(12).font('Helvetica-Bold').text(text);
        doc.moveDown(0.3);
      } else {
        doc.fillColor(PRIMARY_COLOR).fontSize(10.5).font('Helvetica-Bold').text(text);
        doc.moveDown(0.2);
      }
      doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(9.5);
    };

    const addParagraph = (text) => {
      doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(9.5).text(text, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.4);
    };

    const addBullet = (title, description) => {
      doc.fillColor(TEXT_COLOR).fontSize(9.5).font('Helvetica-Bold').text(`• ${title}: `, { continued: true });
      doc.font('Helvetica').text(description, { lineGap: 2 });
      doc.moveDown(0.25);
    };

    const addCodeBlock = (code) => {
      doc.moveDown(0.25);
      const startY = doc.y;
      doc.font('Courier').fontSize(8);
      const textHeight = doc.heightOfString(code, { width: 475 });

      doc.rect(50, startY, 495, textHeight + 10).fillAndStroke(LIGHT_BG, BORDER_COLOR);
      doc.fillColor('#1A202C').text(code, 58, startY + 5, { width: 475 });
      doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_COLOR);
      doc.y = startY + textHeight + 15;
      doc.moveDown(0.25);
    };

    // --- Title Page Header ---
    doc.fillColor(PRIMARY_COLOR).fontSize(20).font('Helvetica-Bold').text('SynthLearn — Multi-Source Learning Content Ingestion', { align: 'center' });
    doc.moveDown(0.4);
    doc.fillColor(ACCENT_COLOR).fontSize(12).font('Helvetica').text('Comprehensive System Architecture, MongoDB Schemas & Technical Reference', { align: 'center' });
    doc.moveDown(0.4);
    doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // --- 1. Project Overview & Objective ---
    addHeader('1. Executive Overview & System Objectives', 1);
    addParagraph(
      'SynthLearn is an enterprise-grade AI learning intelligence platform built for Challenge 3 ("Multi-Source Learning Content Ingestion & Structured Output Generation"). By accepting PDFs, plain-text transcripts, VTT subtitle tracks, and video/audio media files up to 50MB (with automatic Speech-to-Text via Groq Whisper API), the platform extracts domain concepts, directed prerequisite connections, document summaries, flashcard study decks, and 128-dimensional vector embeddings.'
    );
    addParagraph(
      'Designed around a strict 7-layer architecture, SynthLearn features production-grade JWT Authentication (access + refresh token rotation), Zod schema validation with automatic 1-retry repair loops, cross-document canonical concept deduplication in MongoDB, Kahn\'s topological sort for learning paths, interactive SVG Knowledge Graphs, and shimmer Skeleton UI loading states.'
    );

    // --- 2. Complete Architecture Explanation ---
    addHeader('2. System Architecture & Layer Breakdown', 1);
    addParagraph(
      'The architecture comprises seven isolated, sequential layers. Each layer communicates exclusively through defined TypeScript interfaces, preventing cross-layer coupling and enabling independent extensibility.'
    );

    addCodeBlock(
`+-----------------------------------------------------------------------------------+
|                           SYNTHLEARN PIPELINE ARCHITECTURE                        |
+-----------------------------------------------------------------------------------+
[ 1. Ingestion Layer ]   --> Parsers (PDF, TXT, VTT, Groq Whisper STT Video/Audio)
         |
[ 2. Normalization ]     --> SourceDocument Canonical Format + i18n Language Script Check
         |
[ 3. Extraction Layer ]  --> Chunking + LLM Provider (Groq Llama 3.3 / NVIDIA NIM)
         |
[ 4. Validation Layer ]  --> Zod Schema Verification + 1-Repair Retry Loop
         |
[ 5. Storage Layer ]     --> MongoDB Repositories (Users, Docs, Concepts, Embeddings)
         |
[ 6. Retrieval Layer ]   --> Multi-Stage Search (Exact, Substring, 128D Cosine Similarity)
         |
[ 7. Presentation ]      --> Commander CLI Commands & Express / React 19 Workspace UI
+-----------------------------------------------------------------------------------+`
    );

    addHeader('Layer Responsibilities & Design Patterns', 2);
    addBullet('Authentication Layer (`src/auth/`)', 'Handles bcrypt password hashing, 15-minute JWT access tokens, 7-day persistent refresh token rotation in MongoDB, and 6-digit email OTP verification via Nodemailer.');
    addBullet('Ingestion Layer (`src/ingestion/`)', 'Plugin Parser Registry (`registry.ts`). Handles PDFs (`pdf-parse`), transcripts, VTT subtitles, and automatic Speech-to-Text via Groq Whisper API (`whisper-large-v3-turbo`) for standalone video/audio files up to 50MB.');
    addBullet('Normalization Layer (`src/normalization/`)', 'Converts parsed outputs into the canonical `SourceDocument` schema. Evaluates document language script distribution (`detectLanguage`).');
    addBullet('Extraction Layer (`src/extraction/`)', 'Uses token/character chunking (12,000 chars, 500 overlap), LLM provider abstractions (`GroqProvider`, `NVIDIAProvider`), and second-pass multi-chunk concept reconciliation (`mergeChunks.ts`).');
    addBullet('Validation/Structuring Layer (`src/validation/`)', 'Validates raw LLM JSON outputs against Zod schemas. Triggers a single repair retry on malformed JSON before raising typed errors.');
    addBullet('Storage Layer (`src/storage/`)', 'Repository pattern over MongoDB (via Mongoose). Implements cross-document concept deduplication via lowercased `canonicalName` matching and serverless connection caching (`global.mongooseCache`).');
    addBullet('Retrieval Layer (`src/retrieval/`)', 'Multi-stage retrieval: exact string match -> substring match -> 128-dimensional TF-IDF cosine similarity search fallback.');
    addBullet('Presentation Layer (`src/cli/` & `web/`)', 'Commander CLI for offline automation, paired with Express REST API and React 19 UI featuring custom SVG Concept Graphs, flashcard JSON/CSV exports, and shimmer Skeleton UI loaders.');

    // --- 3. Database Schema (MongoDB) ---
    addHeader('3. MongoDB Database Collections & Schemas', 1);
    addParagraph('All persistence operations use isolated repository modules over Mongoose ODM models:');
    addBullet('users', 'id (UUID PK), fullName, email (unique, lowercase), passwordHash, role, isEmailVerified, accountStatus.');
    addBullet('refreshtokens', 'id (PK), userId (FK), token, expiresAt (7 days), isRevoked, deviceInfo.');
    addBullet('documents', 'id (PK), filename, sourceType, rawText, metadata (Mixed), ingestedAt (Compound text index).');
    addBullet('concepts', 'id (PK), documentId (FK), documentIds (Array FK), name, canonicalName (lowercase index), description.');
    addBullet('relationships', 'id (PK), fromConceptId (FK), toConceptId (FK), type (prerequisite | related-to | part-of).');
    addBullet('flashcards', 'id (PK), conceptId (FK), question, answer (Text index).');
    addBullet('summaries', 'id (PK), documentId (FK), summaryText.');
    addBullet('conceptembeddings', 'conceptId (PK, FK), embedding (128-element Float64 vector array).');

    // --- 4. API & CLI Usage Guide ---
    addHeader('4. API & CLI Parity Guide', 1);
    addParagraph('Complete parity between CLI commands and REST API endpoints:');
    addCodeBlock(
`# CLI Commands:
npm run cli -- ingest <filePath>
npm run cli -- list-topics
npm run cli -- export <topic> -f <json|csv>
npm run cli -- learning-path <topic> -f <text|json>

# REST API Endpoints:
POST /api/auth/signup       (User registration & OTP email)
POST /api/auth/login        (Credentials validation & JWT access + refresh tokens)
POST /api/auth/refresh      (Refresh token rotation)
POST /api/ingest            (Multipart file upload up to 50MB -> JSON pipeline response)
GET  /api/topics            (Returns list of distinct stored topic names)
GET  /api/topics/:topic     (Returns concepts, flashcards, summary, graph & learning path)`
    );

    // --- 5. Completed Features Summary ---
    addHeader('5. Features & Deliverables Summary', 1);
    addBullet('Multi-Source File Ingestion', 'Supports PDF, TXT, MD, VTT, SRT, and MP4/MP3/WAV files up to 50MB with Groq Whisper STT.');
    addBullet('Zod Auto-Repair Retry', 'Executes 1 targeted repair retry prompt upon receiving malformed LLM JSON responses.');
    addBullet('Cross-Doc Concept Deduplication', 'Merges synonymous concepts across files via MongoDB lowercased `canonicalName` matching.');
    addBullet('Flashcard Exports', 'Serializes study decks into formatted JSON and CSV files.');
    addBullet('Interactive SVG Knowledge Graph', 'React SVG canvas supporting pan, zoom, click-to-expand inspector, and colored edges.');
    addBullet('Topological Learning Paths', 'Computes prerequisite study sequences using Kahn\'s topological sort algorithm.');
    addBullet('Shimmer Skeleton UI Loaders', 'Smooth CSS shimmer Skeleton cards during data fetching in Dashboard, Insights, and Analytics tabs.');

    // Page Numbers Footer
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fillColor(MUTED_COLOR).fontSize(8).text(
        `SynthLearn Platform Documentation | Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 35,
        { align: 'center', width: 495 }
      );
    }

    doc.end();

    writeStream.on('finish', () => {
      // Also copy to project_documentation.pdf for exact filename match
      const lowercasePath = path.join(reportsDir, 'project_documentation.pdf');
      fs.copyFileSync(targetPath, lowercasePath);

      console.log(`Successfully generated documentation PDF at: ${targetPath}`);
      console.log(`Successfully generated documentation PDF at: ${lowercasePath}`);
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
