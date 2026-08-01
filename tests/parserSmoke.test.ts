import { getParserForFile } from '../src/ingestion/registry';

async function runParserSmokeTests() {
  console.log('Running Parser Smoke Tests...');

  // 1. Text Transcript Parser Test
  const txtPath = 'seed-data/transcripts/machine_learning_intro.txt';
  const txtParser = getParserForFile(txtPath);
  const txtResult = await txtParser.parse(txtPath);

  if (!txtResult.rawText || txtResult.rawText.trim().length === 0) {
    throw new Error('Text parser returned empty rawText');
  }
  if (!txtResult.rawText.includes('Machine Learning')) {
    throw new Error('Text parser rawText missing expected content');
  }
  console.log('Text Transcript Parser Smoke Test PASSED.');

  // 2. PDF Parser Test
  const pdfPath = 'seed-data/pdfs/neural_networks.pdf';
  const pdfParser = getParserForFile(pdfPath);
  const pdfResult = await pdfParser.parse(pdfPath);

  if (!pdfResult.rawText || pdfResult.rawText.trim().length === 0) {
    throw new Error('PDF parser returned empty rawText');
  }
  if (!pdfResult.rawText.includes('Neural Networks')) {
    throw new Error('PDF parser rawText missing expected content');
  }
  console.log('PDF Parser Smoke Test PASSED.');

  // 3. Video/Audio VTT Transcript Parser Test
  const vttPath = 'seed-data/transcripts/lecture_video.vtt';
  const videoParser = getParserForFile(vttPath);
  const videoResult = await videoParser.parse(vttPath);

  if (!videoResult.rawText || videoResult.rawText.trim().length === 0) {
    throw new Error('Video/Audio parser returned empty rawText');
  }
  if (!videoResult.rawText.includes('Deep Learning')) {
    throw new Error('Video/Audio parser rawText missing expected content');
  }
  console.log('Video/Audio Transcript Parser Smoke Test PASSED.');

  console.log('\nAll Parser Smoke Tests PASSED Successfully!');
}

runParserSmokeTests().catch(err => {
  console.error('Parser Smoke Test Failure:', err);
  process.exit(1);
});
