import { CONFIG } from '../../shared/config';
import { GroqProvider } from './groqProvider';
import { NvidiaProvider } from './nvidiaProvider';
import { LLMProvider } from './types';

export * from './types';

export function getLLMProvider(): LLMProvider {
  const provider = CONFIG.LLM_PROVIDER.toLowerCase();

  switch (provider) {
    case 'groq':
      return new GroqProvider();
    case 'nvidia':
      return new NvidiaProvider();
    default:
      throw new Error(`Unsupported LLM_PROVIDER: "${CONFIG.LLM_PROVIDER}". Supported providers are "groq" and "nvidia".`);
  }
}
