import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { InvoiceExtractionDto } from "@/application/dtos";
import type { LLMProvider } from "@/application/interfaces/providers";
import { env } from "@/infrastructure/config/env.config";

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
  clientNumber: z.string(),
  referenceMonth: z.string(),
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
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    const base64Pdf = pdfBuffer.toString("base64");

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
      throw new Error(
        "Failed to extract invoice data: model returned no structured output"
      );
    }
    return response.parsed_output;
  }
}
