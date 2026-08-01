import { LLMProvider } from '../extraction/providers';
import { ExtractionResult, parseAndValidateJson } from './schema';

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

/**
 * Builds a repair prompt when initial LLM response fails Zod schema validation.
 */
function buildRepairPrompt(originalPrompt: string, rawOutput: string, errorMessage: string): string {
  return `Your previous JSON response contained formatting or schema validation errors.

ValidationError Details:
${errorMessage}

Previous Raw Output:
${rawOutput}

Original Instruction:
${originalPrompt}

Please fix the error and output valid JSON ONLY adhering strictly to the JSON schema.`;
}

/**
 * Validates raw LLM response against Zod ExtractionResult schema.
 * On failure, executes a single repair retry prompt.
 * On second failure, throws a typed ExtractionValidationError.
 */
export async function validateAndRepairExtraction(
  prompt: string,
  systemPrompt: string,
  provider: LLMProvider
): Promise<ExtractionResult> {
  const attempt1Output = await provider.complete(prompt, systemPrompt);

  try {
    return parseAndValidateJson(attempt1Output);
  } catch (attempt1Err: any) {
    const error1Msg = attempt1Err.message || String(attempt1Err);
    console.warn(`Extraction validation attempt 1 failed: ${error1Msg}. Triggering repair retry...`);

    const repairPrompt = buildRepairPrompt(prompt, attempt1Output, error1Msg);
    const attempt2Output = await provider.complete(repairPrompt, systemPrompt);

    try {
      const repairedResult = parseAndValidateJson(attempt2Output);
      console.log('Extraction validation repair retry succeeded!');
      return repairedResult;
    } catch (attempt2Err: any) {
      const error2Msg = attempt2Err.message || String(attempt2Err);
      console.error(`Extraction validation repair attempt 2 failed: ${error2Msg}`);

      throw new ExtractionValidationError(
        `Failed concept extraction after 1 repair retry. Initial error: "${error1Msg}". Repair error: "${error2Msg}".`,
        attempt1Output,
        error1Msg,
        attempt2Output,
        error2Msg
      );
    }
  }
}
