import { ExtractionResult } from '../../validation/schema';

export function buildExtractionPrompt(text: string): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are an expert educational content analyzer. Your task is to analyze the provided educational text and extract key concepts, relationships between concepts, and a concise summary.

Output format requirement:
You MUST respond with valid JSON ONLY. Do NOT include any intro text, markdown formatting blocks (like \`\`\`json), or trailing explanations outside the JSON body.

Strict JSON Schema:
{
  "concepts": [
    {
      "name": "Concept Name (short, title-cased)",
      "description": "Clear 1-2 sentence educational definition of the concept."
    }
  ],
  "relationships": [
    {
      "from": "Exact Concept Name A",
      "to": "Exact Concept Name B",
      "type": "prerequisite" | "related-to" | "part-of"
    }
  ],
  "summary": "Concise 2-4 sentence summary of the entire document content."
}

Rules:
1. "type" MUST be exactly one of: "prerequisite", "related-to", or "part-of".
2. "from" and "to" concept names MUST exactly match names present in the "concepts" array.
3. Keep descriptions factual, clear, and educational.`;

  const prompt = `Please extract concepts, relationships, and summary from the following text:\n\n${text}`;

  return { prompt, systemPrompt };
}

export function buildReconcileChunksPrompt(chunkResults: ExtractionResult[]): { prompt: string; systemPrompt: string } {
  const systemPrompt = `You are an expert knowledge graph consolidator. You will be provided with concept extractions from multiple chunks of a single long educational document.

Your task is to reconcile synonymous or duplicate concepts across chunk boundaries, merge their descriptions into clean comprehensive definitions, merge directed relationships without duplicates, and produce a unified summary.

Output format requirement:
You MUST respond with valid JSON ONLY. Do NOT include any markdown formatting or commentary outside the JSON body.

Strict JSON Schema:
{
  "concepts": [
    {
      "name": "Canonical Concept Name",
      "description": "Comprehensive merged educational definition."
    }
  ],
  "relationships": [
    {
      "from": "Canonical Concept Name A",
      "to": "Canonical Concept Name B",
      "type": "prerequisite" | "related-to" | "part-of"
    }
  ],
  "summary": "Unified 2-4 sentence summary of the full multi-chunk document."
}`;

  const prompt = `Please reconcile and consolidate the following preliminary extractions from multiple chunks:\n\n${JSON.stringify(chunkResults, null, 2)}`;

  return { prompt, systemPrompt };
}
