import type { ZodType } from "zod";

export interface LLMProvider {
  sendStructuredRequest<T>(document: Buffer, prompt: string, schema: ZodType<T>): Promise<T>;
}
