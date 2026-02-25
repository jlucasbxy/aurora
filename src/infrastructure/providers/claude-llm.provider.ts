import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { InvoiceExtractionDto } from "@/application/dtos";
import { LlmError } from "@/application/interfaces/providers";
import type { LLMProvider } from "@/application/interfaces/providers";
import { env } from "@/infrastructure/config/env.config";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const MAX_ATTEMPTS = 2;

function isRetryable(error: unknown): boolean {
  return (
    error instanceof Anthropic.APIConnectionError ||
    error instanceof Anthropic.InternalServerError
  );
}

const EXTRACTION_PROMPT = `Extract the following fields from this energy bill PDF.

Required fields:
- clientNumber: the customer number (string)
- referenceMonth: the reference month in format "MMM/YYYY" e.g. "JAN/2024" (string)
- electricEnergyQty: electric energy quantity in kWh (number)
- electricEnergyValue: electric energy value in BRL (number)
- sceeEnergyQty: SCEE energy quantity in kWh (number)
- sceeEnergyValue: SCEE energy value in BRL (number)
- compensatedEnergyQty: compensated GDI energy quantity in kWh (number)
- compensatedEnergyValue: compensated GDI energy value in BRL, typically negative (number)
- publicLightingContrib: public lighting contribution value in BRL (number)`;

const InvoiceExtractionSchema = z.object({
  clientNumber: clientNumberSchema,
  referenceMonth: referenceMonthSchema,
  electricEnergyQty: z.number().int(),
  electricEnergyValue: z.number(),
  sceeEnergyQty: z.number().int(),
  sceeEnergyValue: z.number(),
  compensatedEnergyQty: z.number().int(),
  compensatedEnergyValue: z.number(),
  publicLightingContrib: z.number()
});

export class ClaudeLLMProvider implements LLMProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      maxRetries: 0
    });
  }

  async extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    const base64Pdf = pdfBuffer.toString("base64");
    let lastError: unknown;

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
                    data: base64Pdf
                  }
                },
                {
                  type: "text",
                  text: EXTRACTION_PROMPT
                }
              ]
            }
          ],
          output_config: {
            format: zodOutputFormat(InvoiceExtractionSchema)
          }
        });

        if (!response.parsed_output) {
          lastError = new Error("Model returned no structured output");
          continue;
        }

        return response.parsed_output;
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          throw new LlmError("RATE_LIMITED", "LLM rate limit exceeded");
        }

        if (!isRetryable(error)) {
          throw new LlmError("EXTRACTION_FAILED", "Failed to extract invoice data");
        }

        lastError = error;
      }
    }

    throw new LlmError(
      "EXTRACTION_FAILED",
      `Failed to extract invoice data after ${MAX_ATTEMPTS} attempts`
    );
  }
}
