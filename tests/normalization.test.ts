import { runIngestionPipeline } from '../src/pipeline';

async function testPipeline() {
  console.log('Testing normalization and pipeline orchestrator...');

  // Test transcript file parsing & normalization
  const txtResult = await runIngestionPipeline('seed-data/transcripts/sample.txt');
  console.log('TXT Normalization Result:', {
    id: txtResult.document.id,
    filename: txtResult.document.filename,
    sourceType: txtResult.document.sourceType,
    ingestedAt: txtResult.document.ingestedAt,
    conceptsExtracted: txtResult.extraction.concepts.length,
  });

  if (txtResult.document.sourceType !== 'transcript') {
    throw new Error(`Expected sourceType 'transcript', got ${txtResult.document.sourceType}`);
  }

  // Test PDF file parsing & normalization
  const pdfResult = await runIngestionPipeline('seed-data/pdfs/sample.pdf');
  console.log('PDF Normalization Result:', {
    id: pdfResult.document.id,
    filename: pdfResult.document.filename,
    sourceType: pdfResult.document.sourceType,
    ingestedAt: pdfResult.document.ingestedAt,
    conceptsExtracted: pdfResult.extraction.concepts.length,
  });

  if (pdfResult.document.sourceType !== 'pdf') {
    throw new Error(`Expected sourceType 'pdf', got ${pdfResult.document.sourceType}`);
  }

  console.log('All normalization tests passed successfully!');
}

testPipeline().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
