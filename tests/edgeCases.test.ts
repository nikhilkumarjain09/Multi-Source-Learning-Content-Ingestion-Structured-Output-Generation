import { detectLanguage } from '../src/ingestion/language';
import { reconcileMultiChunkExtractions, mergeChunkExtractions } from '../src/extraction/mergeChunks';
import { ExtractionResult } from '../src/extraction/types';
import { LLMProvider } from '../src/extraction/providers';

async function runEdgeCaseTests() {
  console.log('Running Edge Case Hardening Tests...');

  // 1. Non-English Language Detection Test
  console.log('\n--- 1. Testing Non-English Content Detection ---');
  const englishText = 'Machine learning is a field of study in artificial intelligence.';
  const engResult = detectLanguage(englishText);
  if (!engResult.isSupported) {
    throw new Error('Test 1 Failed: English text falsely flagged as unsupported');
  }
  console.log('English text language check PASSED.');

  const nonEnglishText = '机器学习是人工智能的一个分支。深度学习和卷积神经网络在图像识别中起着至关重要的作用。神经网络通过多层神经元处理输入数据。';
  const nonEngResult = detectLanguage(nonEnglishText);
  if (nonEngResult.isSupported) {
    throw new Error('Test 1 Failed: Non-English text failed to be flagged as unsupported');
  }
  if (!nonEngResult.reason || !nonEngResult.reason.includes('Unsupported language')) {
    throw new Error('Test 1 Failed: Missing human-readable reason for unsupported language');
  }
  console.log('Non-English text detection PASSED: Clear error reason reported:');
  console.log(`  "${nonEngResult.reason}"`);

  // 2. Multi-Chunk Second-Pass Concept Reconciliation Test
  console.log('\n--- 2. Testing Multi-Chunk Concept Reconciliation ---');
  const chunk1: ExtractionResult = {
    concepts: [
      { name: 'ANN', description: 'Artificial neural network for pattern recognition.' },
      { name: 'Deep Learning', description: 'Machine learning subset.' },
    ],
    relationships: [
      { from: 'Deep Learning', to: 'ANN', type: 'part-of' },
    ],
    summary: 'Overview of neural networks.',
  };

  const chunk2: ExtractionResult = {
    concepts: [
      { name: 'Artificial Neural Network', description: 'Computing system inspired by biological neural networks.' },
      { name: 'Convolutional Neural Network', description: 'Neural network for image analysis.' },
    ],
    relationships: [
      { from: 'Convolutional Neural Network', to: 'Artificial Neural Network', type: 'part-of' },
    ],
    summary: 'Overview of CNN architectures.',
  };

  // Mock LLM Provider for second-pass reconciliation test
  const mockReconcileProvider: LLMProvider = {
    async complete(): Promise<string> {
      return JSON.stringify({
        concepts: [
          { name: 'Artificial Neural Network', description: 'Comprehensive computing system inspired by biological neural networks for pattern recognition.' },
          { name: 'Deep Learning', description: 'Machine learning subset.' },
          { name: 'Convolutional Neural Network', description: 'Neural network for image analysis.' },
        ],
        relationships: [
          { from: 'Deep Learning', to: 'Artificial Neural Network', type: 'part-of' },
          { from: 'Convolutional Neural Network', to: 'Artificial Neural Network', type: 'part-of' },
        ],
        summary: 'Unified overview of deep learning and neural network architectures.',
      });
    },
  };

  const reconciledResult = await reconcileMultiChunkExtractions([chunk1, chunk2], mockReconcileProvider);

  if (reconciledResult.concepts.length !== 3) {
    throw new Error(`Test 2 Failed: Expected 3 reconciled concepts, got ${reconciledResult.concepts.length}`);
  }
  if (!reconciledResult.summary.includes('Unified overview')) {
    throw new Error('Test 2 Failed: Multi-chunk summary reconciliation mismatch');
  }

  console.log('Multi-chunk second-pass concept reconciliation PASSED.');
  console.log(`  Reconciled ${reconciledResult.concepts.length} concepts and ${reconciledResult.relationships.length} relationships across chunk boundaries.`);

  console.log('\nAll Edge Case Hardening Tests PASSED Successfully!');
}

runEdgeCaseTests().catch(err => {
  console.error('Edge Case Test Failure:', err);
  process.exit(1);
});
