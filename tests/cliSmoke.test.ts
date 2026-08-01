import fs from 'fs';
import path from 'path';
import { runIngestionPipeline } from '../src/pipeline';
import { getDocumentById } from '../src/storage/documentRepository';
import { getConceptsByDocumentId } from '../src/storage/conceptRepository';
import { getSummaryByDocumentId } from '../src/storage/summaryRepository';
import { getArtifactsByTopic } from '../src/retrieval/getArtifactsByTopic';
import { exportFlashcardsJSON, exportFlashcardsCSV } from '../src/outputs/flashcardExport';
import { CONFIG } from '../src/shared/config';

async function runCliEndToEndSmokeTest() {
  console.log('Running CLI End-to-End Ingestion Smoke Tests against Seed Data...');

  const hasApiKey = (CONFIG.LLM_PROVIDER === 'groq' && CONFIG.GROQ_API_KEY) ||
                    (CONFIG.LLM_PROVIDER === 'nvidia' && CONFIG.NVIDIA_API_KEY);

  const txtPath = 'seed-data/transcripts/machine_learning_intro.txt';
  const pdfPath = 'seed-data/pdfs/neural_networks.pdf';

  try {
    if (!hasApiKey) {
      console.log(`\nNote: ${CONFIG.LLM_PROVIDER.toUpperCase()} API key not configured. Testing pipeline error handling...`);
      try {
        await runIngestionPipeline(txtPath);
        throw new Error('Expected pipeline to fail when API key is missing');
      } catch (err: any) {
        if (err.message.includes('API Key is missing')) {
          console.log('Pipeline error handling verified: Clear human-readable error reported when API key missing.');
        } else {
          throw err;
        }
      }
      console.log('\nCLI End-to-End Smoke Test (Offline Mode) PASSED!');
      return;
    }

    // 1. Ingest Seed Transcript
    console.log(`\n--- 1. Ingesting Transcript Seed File: ${txtPath} ---`);
    const txtResult = await runIngestionPipeline(txtPath);
    console.log('Transcript Pipeline Result:', {
      docId: txtResult.document.id,
      concepts: txtResult.extraction.concepts.length,
    });

    // 2. Ingest Seed PDF
    console.log(`\n--- 2. Ingesting PDF Seed File: ${pdfPath} ---`);
    const pdfResult = await runIngestionPipeline(pdfPath);
    console.log('PDF Pipeline Result:', {
      docId: pdfResult.document.id,
      concepts: pdfResult.extraction.concepts.length,
    });

    console.log('\nCLI End-to-End Smoke Test (Live API Mode) PASSED Successfully!');
  } finally {
    const { disconnectDB } = await import('../src/storage/db');
    await disconnectDB();
  }
}

runCliEndToEndSmokeTest().catch(err => {
  console.error('CLI Smoke Test Failure:', err);
  process.exit(1);
});
