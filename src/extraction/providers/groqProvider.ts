import { CONFIG } from '../../shared/config';
import { LLMProvider } from './types';

export class GroqProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string;

  constructor() {
    this.apiKey = CONFIG.GROQ_API_KEY;
    this.model = CONFIG.GROQ_MODEL;
    this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API Key is missing. Please set GROQ_API_KEY in your .env file.');
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;

      if (content === undefined || content === null) {
        throw new Error('Groq API returned an empty or invalid completion response.');
      }

      return content;
    } catch (error: any) {
      throw new Error(`Groq LLM Provider failure: ${error.message || String(error)}`);
    }
  }
}
