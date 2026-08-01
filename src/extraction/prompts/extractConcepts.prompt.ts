export const EXTRACT_CONCEPTS_SYSTEM_PROMPT = `
You are an expert educational content analyzer. Extract key concepts, relationships, and a concise summary from the text.
Respond strictly in JSON matching the defined schema.
`;

export function buildExtractConceptsPrompt(text: string): string {
  return `Analyze the following learning text:\n\n${text}`;
}
