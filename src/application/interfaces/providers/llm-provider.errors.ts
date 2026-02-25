export type LlmErrorCode = "RATE_LIMITED" | "EXTRACTION_FAILED";

export class LlmError extends Error {
  constructor(
    public readonly code: LlmErrorCode,
    message: string
  ) {
    super(message);
    this.name = "LlmError";
  }
}
