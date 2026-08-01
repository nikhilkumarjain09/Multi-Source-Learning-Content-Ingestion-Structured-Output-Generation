import { z } from 'zod';

export const ConceptSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

export const RelationshipTypeSchema = z.enum(['prerequisite', 'related-to', 'part-of']);

export const RelationshipSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: RelationshipTypeSchema,
});

export const ExtractionResultSchema = z.object({
  concepts: z.array(ConceptSchema),
  relationships: z.array(RelationshipSchema),
  summary: z.string(),
});

export type ExtractionResultInput = z.infer<typeof ExtractionResultSchema>;
