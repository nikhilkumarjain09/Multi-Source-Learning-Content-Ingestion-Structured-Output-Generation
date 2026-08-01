import { ExtractionResultSchema } from './schema';
import { ExtractionResult } from '../shared/types';

export function validateExtraction(data: unknown): { success: true; data: ExtractionResult } | { success: false; error: string } {
  const result = ExtractionResultSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as ExtractionResult };
  }
  return { success: false, error: result.error.message };
}
