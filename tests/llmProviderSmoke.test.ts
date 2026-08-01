import { getLLMProvider } from '../src/extraction/providers';
import { CONFIG } from '../src/shared/config';

async function runSmokeTest() {
  console.log(`Testing LLM Provider Abstraction (Active Provider: "${CONFIG.LLM_PROVIDER}")`);

  try {
    const provider = getLLMProvider();
    const prompt = 'Respond with exact text: "LLM Provider connection successful."';
    const response = await provider.complete(prompt);

    console.log('Provider Response:');
    console.log(response);

    if (response && response.length > 0) {
      console.log('LLM Provider smoke check PASSED!');
    } else {
      console.error('LLM Provider smoke check FAILED: Empty response.');
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`LLM Provider smoke check FAILED: ${error.message}`);
    process.exit(1);
  }
}

runSmokeTest();
