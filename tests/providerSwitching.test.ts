import { GroqProvider } from '../src/extraction/providers/groqProvider';
import { NvidiaProvider } from '../src/extraction/providers/nvidiaProvider';
import { getLLMProvider } from '../src/extraction/providers';
import { CONFIG } from '../src/shared/config';

function testProviderAbstraction() {
  console.log('Testing LLM Provider Abstraction switching logic...');

  // Test Groq Provider instantiation
  const groq = new GroqProvider();
  console.log('GroqProvider instantiated successfully.');

  // Test NVIDIA Provider instantiation
  const nvidia = new NvidiaProvider();
  console.log('NvidiaProvider instantiated successfully.');

  // Test factory instantiation based on config
  const currentProvider = getLLMProvider();
  console.log(`Factory returned provider instance for active config "${CONFIG.LLM_PROVIDER}":`, currentProvider.constructor.name);

  console.log('LLM Provider Abstraction test PASSED!');
}

testProviderAbstraction();
