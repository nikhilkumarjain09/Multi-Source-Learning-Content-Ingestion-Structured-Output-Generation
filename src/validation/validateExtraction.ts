import { LLMProvider } from '../extraction/providers/types';
import { EXTRACT_CONCEPTS_SYSTEM_PROMPT } from '../extraction/prompts/extractConcepts.prompt';
import { ExtractionResult } from '../shared/types';
import { parseAndValidateJson } from './schema';

export class ExtractionValidationError extends Error {
  public readonly initialOutput: string;
  public readonly initialError: string;
  public readonly repairOutput?: string;
  public readonly repairError?: string;

  constructor(
    message: string,
    initialOutput: string,
    initialError: string,
    repairOutput?: string,
    repairError?: string
  ) {
    super(message);
    this.name = 'ExtractionValidationError';
    this.initialOutput = initialOutput;
    this.initialError = initialError;
    this.repairOutput = repairOutput;
    this.repairError = repairError;
  }
}

export function buildRepairPrompt(originalPrompt: string, invalidOutput: string, validationError: string): string {
  return `Your previous JSON output failed validation.

Original Task Prompt:
${originalPrompt}

Your Previous Invalid Output:
${invalidOutput}

Validation Errors Encountered:
${validationError}

CORRECTION INSTRUCTIONS:
- Fix the JSON structure so it strictly conforms to the expected schema.
- Return ONLY valid raw JSON object matching {"concepts": [...], "relationships": [...], "summary": "..."}.
- Do NOT include markdown blocks (\`\`\`json) or any preamble text outside the JSON object.`;
}

/**
 * Validates raw LLM output against the ExtractionResult Zod schema.
 * On failure, constructs a repair prompt and retries the LLM call exactly once (FR2.3).
 * Throws a typed ExtractionValidationError on second failure.
 */
export async function validateAndRepairExtraction(
  rawOutput: string,
  userPrompt: string,
  provider: LLMProvider
): Promise<ExtractionResult> {
  // Attempt 1: Validate initial LLM response
  const attempt1 = parseAndValidateJson(rawOutput);
  if (attempt1.success) {
    return attempt1.data;
  }

  const firstError = attempt1.error;
  console.warn(`Extraction validation attempt 1 failed: ${firstError}. Triggering repair retry...`);

  // Construct repair prompt
  const repairPrompt = buildRepairPrompt(userPrompt, rawOutput, firstError);

  // Attempt 2: Single repair retry
  let repairOutput: string;
  try {
    repairOutput = await provider.complete(repairPrompt, EXTRACT_CONCEPTS_SYSTEM_PROMPT);
  } catch (err: any) {
    throw new ExtractionValidationError(
      `Extraction repair LLM request failed: ${err.message}`,
      rawOutput,
      firstError
    );
  }

  const attempt2 = parseAndValidateJson(repairOutput);
  if (attempt2.success) {
    console.log('Extraction validation repair retry succeeded!');
    return attempt2.data;
  }

  const secondError = attempt2.error;
  console.error(`Extraction validation repair attempt 2 failed: ${secondError}`);

  throw new ExtractionValidationError(
    `Failed concept extraction after 1 repair retry. Initial error: "${firstError}". Repair error: "${secondError}".`,
    rawOutput,
    firstError,
    repairOutput,
    secondError
  );
}
