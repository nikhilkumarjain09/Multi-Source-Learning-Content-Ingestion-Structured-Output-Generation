import { z } from 'zod';

export const ConceptSchema = z.object({
  name: z.string().min(1, 'Concept name cannot be empty'),
  description: z.string().default(''),
});

export const RelationshipTypeSchema = z.enum(['prerequisite', 'related-to', 'part-of']);

export const RelationshipSchema = z.object({
  from: z.string().min(1, 'Relationship from concept cannot be empty'),
  to: z.string().min(1, 'Relationship to concept cannot be empty'),
  type: RelationshipTypeSchema,
});

export const ExtractionResultSchema = z.object({
  concepts: z.array(ConceptSchema),
  relationships: z.array(RelationshipSchema),
  summary: z.string().default(''),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type ValidatedExtractionResult = ExtractionResult;

export function parseAndValidateJson(rawText: string): ExtractionResult {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr: any) {
    throw new Error(`Invalid JSON syntax: ${jsonErr.message}`);
  }

  const result = ExtractionResultSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  const errorMessages = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ');

  throw new Error(`Schema validation failed: ${errorMessages}`);
}
