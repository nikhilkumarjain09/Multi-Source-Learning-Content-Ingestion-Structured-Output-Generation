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

export type ValidatedExtractionResult = z.infer<typeof ExtractionResultSchema>;

export function parseAndValidateJson(rawText: string): { success: true; data: ValidatedExtractionResult } | { success: false; error: string } {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr: any) {
    return { success: false, error: `Invalid JSON syntax: ${jsonErr.message}` };
  }

  const result = ExtractionResultSchema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errorMessages = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ');

  return { success: false, error: `Schema validation failed: ${errorMessages}` };
}
