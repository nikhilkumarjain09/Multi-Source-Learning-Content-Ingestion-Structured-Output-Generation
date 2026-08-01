import path from 'path';
import { getParserForFile } from '../src/ingestion/registry';
import { videoParser } from '../src/ingestion/parsers/videoParser';

async function runVideoParserTests() {
  console.log('Running Video/Audio Parser Tests...');

  // Test 1: Supports check
  if (!videoParser.supports('test_video.mp4') || !videoParser.supports('subtitles.vtt')) {
    throw new Error('Test 1 Failed: videoParser should support .mp4 and .vtt extensions');
  }
  console.log('Test 1 Passed: videoParser supports expected extensions.');

  // Test 2: Registry lookup
  const registeredParser = getParserForFile('lecture.vtt');
  if (registeredParser !== videoParser) {
    throw new Error('Test 2 Failed: Registry failed to return videoParser for .vtt file');
  }
  console.log('Test 2 Passed: Registry correctly returns videoParser for .vtt extension.');

  // Test 3: Parse seed VTT file
  const seedVttPath = path.resolve(process.cwd(), 'seed-data/transcripts/lecture_video.vtt');
  const parsedDoc = await videoParser.parse(seedVttPath);

  if (!parsedDoc.rawText.includes('Deep Learning and Neural Networks')) {
    throw new Error('Test 3 Failed: Extracted raw text missing expected lecture title');
  }
  if (!parsedDoc.rawText.includes('backpropagation')) {
    throw new Error('Test 3 Failed: Extracted raw text missing cleaned subtitle line content');
  }
  console.log('Test 3 Passed: VTT subtitle cleaning and raw text extraction succeeded.');
  console.log('Extracted Text snippet:', parsedDoc.rawText);

  console.log('\nAll Video/Audio Parser Tests PASSED Successfully!');
}

runVideoParserTests().catch(err => {
  console.error('Video Parser Test Failure:', err);
  process.exit(1);
});
