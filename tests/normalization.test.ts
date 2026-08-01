import { runIngestionPipeline } from '../src/pipeline';

async function testPipeline() {
  console.log('Testing normalization and pipeline orchestrator...');

  // Test transcript file parsing & normalization
  const txtResult = await runIngestionPipeline('seed-data/transcripts/sample.txt');
  console.log('TXT Normalization Result:', {
    id: txtResult.id,
    filename: txtResult.filename,
    sourceType: txtResult.sourceType,
    ingestedAt: txtResult.ingestedAt,
  });

  if (txtResult.sourceType !== 'transcript') {
    throw new Error(`Expected sourceType 'transcript', got ${txtResult.sourceType}`);
  }

  // Test PDF file parsing & normalization
  const pdfResult = await runIngestionPipeline('seed-data/pdfs/sample.pdf');
  console.log('PDF Normalization Result:', {
    id: pdfResult.id,
    filename: pdfResult.filename,
    sourceType: pdfResult.sourceType,
    ingestedAt: pdfResult.ingestedAt,
  });

  if (pdfResult.sourceType !== 'pdf') {
    throw new Error(`Expected sourceType 'pdf', got ${pdfResult.sourceType}`);
  }

  console.log('All normalization tests passed successfully!');
}

testPipeline().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
