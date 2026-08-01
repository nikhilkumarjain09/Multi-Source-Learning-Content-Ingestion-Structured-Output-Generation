export interface LLMProvider {
  complete(prompt: string, systemPrompt?: string): Promise<string>;
}
