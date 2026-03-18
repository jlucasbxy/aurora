import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ZodType } from "zod";
import type { LLMProvider } from "@/application/interfaces/providers";
import { LlmError } from "@/application/interfaces/providers";

const MAX_ATTEMPTS = 2;

function isRetryable(error: unknown): boolean {
  return (
    error instanceof Anthropic.APIConnectionError ||
    error instanceof Anthropic.InternalServerError
  );
}

export class ClaudeLLMProvider implements LLMProvider {
  constructor(private readonly client: Anthropic) {}

  async sendStructuredRequest<T>(
    document: Buffer,
    prompt: string,
    schema: ZodType<T>
  ): Promise<T> {
    const base64Doc = document.toString("base64");
    let lastError: Error = new Error("Unknown extraction error");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await this.client.messages.parse({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Doc
                  }
                },
                {
                  type: "text",
                  text: prompt
                }
              ]
            }
          ],
          output_config: {
            format: zodOutputFormat(schema)
          }
        });

        if (!response.parsed_output) {
          lastError = new Error("Model returned no structured output");
          continue;
        }

        return response.parsed_output as T;
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          throw new LlmError("RATE_LIMITED", "LLM rate limit exceeded");
        }

        if (!isRetryable(error)) {
          throw new LlmError(
            "EXTRACTION_FAILED",
            "Failed to extract data from document"
          );
        }

        lastError = error as Error;
      }
    }

    throw new LlmError(
      "EXTRACTION_FAILED",
      `Failed to extract data from document after ${MAX_ATTEMPTS} attempts: ${lastError.message}`
    );
  }
}
