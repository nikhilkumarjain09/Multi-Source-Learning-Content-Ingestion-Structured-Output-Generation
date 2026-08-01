import { LLMProvider } from '../src/extraction/providers';
import { validateAndRepairExtraction, ExtractionValidationError } from '../src/validation/validateExtraction';

class MockProvider implements LLMProvider {
  private responses: string[];
  public calls: Array<{ prompt: string; systemPrompt?: string }> = [];

  constructor(responses: string[]) {
    this.responses = [...responses];
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    this.calls.push({ prompt, systemPrompt });
    const nextResponse = this.responses.shift();
    if (nextResponse === undefined) {
      throw new Error('MockProvider out of responses');
    }
    return nextResponse;
  }
}

async function runSchemaValidationTests() {
  console.log('Running Schema Validation & Repair Retry Tests...');

  // Test 1: Valid LLM output passes directly on first attempt
  console.log('\n--- Test 1: Valid JSON Passes Directly ---');
  const validJson = JSON.stringify({
    concepts: [{ name: 'Machine Learning', description: 'Study of algorithms' }],
    relationships: [{ from: 'Statistics', to: 'Machine Learning', type: 'prerequisite' }],
    summary: 'Overview of Machine Learning fundamentals.',
  });

  // Provider returns valid JSON on first call -> no retry needed
  const provider1 = new MockProvider([validJson]);
  const result1 = await validateAndRepairExtraction('Extract concepts from text', 'system', provider1);

  if (result1.concepts.length !== 1 || result1.concepts[0].name !== 'Machine Learning') {
    throw new Error('Test 1 Failed: Concept extraction data mismatch');
  }
  if (provider1.calls.length !== 1) {
    throw new Error('Test 1 Failed: Provider should be called exactly once when initial output is valid');
  }
  console.log('Test 1 Passed: Valid output passed without retry.');

  // Test 2: Provider returns malformed JSON on first call, valid JSON on repair retry
  console.log('\n--- Test 2: Malformed JSON Triggers Repair Retry & Succeeds ---');
  const malformedJson = '{ concepts: [ { name: "Neural Networks" description: "Missing comma" } ] }';
  const repairedValidJson = JSON.stringify({
    concepts: [{ name: 'Neural Networks', description: 'Deep learning models' }],
    relationships: [],
    summary: 'Intro to Neural Networks.',
  });

  // First call returns malformed JSON, second call returns valid repaired JSON
  const provider2 = new MockProvider([malformedJson, repairedValidJson]);
  const result2 = await validateAndRepairExtraction('Extract concepts from text', 'system', provider2);

  if (result2.concepts[0].name !== 'Neural Networks') {
    throw new Error('Test 2 Failed: Repaired concept data mismatch');
  }
  if (provider2.calls.length !== 2) {
    throw new Error(`Test 2 Failed: Expected 2 provider calls (initial + repair retry), got ${provider2.calls.length}`);
  }
  if (!provider2.calls[1].prompt.includes('Your previous JSON response contained formatting or schema validation errors')) {
    throw new Error('Test 2 Failed: Repair prompt text missing expected failure context');
  }
  console.log('Test 2 Passed: Malformed JSON successfully repaired after 1 retry.');

  // Test 3: Provider returns malformed JSON on both calls -> typed error thrown
  console.log('\n--- Test 3: Still-Malformed JSON After Retry Throws Typed Error ---');
  const stillMalformedJson = 'NOT_JSON_AT_ALL';

  // First call returns malformed, second call also returns malformed
  const provider3 = new MockProvider([malformedJson, stillMalformedJson]);

  let caughtError: ExtractionValidationError | null = null;
  try {
    await validateAndRepairExtraction('Extract concepts from text', 'system', provider3);
  } catch (err: any) {
    if (err instanceof ExtractionValidationError) {
      caughtError = err;
    }
  }

  if (!caughtError) {
    throw new Error('Test 3 Failed: Expected ExtractionValidationError was not thrown');
  }
  if (provider3.calls.length !== 2) {
    throw new Error(`Test 3 Failed: Expected 2 provider calls before throwing, got ${provider3.calls.length}`);
  }
  console.log('Test 3 Passed: Typed ExtractionValidationError thrown on second failure.');
  console.log('Error message:', caughtError.message);

  console.log('\nAll Schema Validation & Repair Retry Tests PASSED!');
}

runSchemaValidationTests().catch(err => {
  console.error('Schema Validation Test Failure:', err);
  process.exit(1);
});
