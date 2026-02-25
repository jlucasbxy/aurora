import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { InvoiceExtractionDto } from "@/application/dtos";
import type { LLMProvider } from "@/application/interfaces/providers";
import { env } from "@/infrastructure/config/env.config";

const EXTRACTION_PROMPT = `Extract the following fields from this energy bill PDF.

Required fields:
- clientNumber: the customer number (string)
- referenceMonth: the reference month in format "MMM/YYYY" e.g. "SET/2024" (string)
- electricEnergy: object with "qty" (kWh, number) and "value" (BRL, number)
- sceeEnergy: object with "qty" (kWh, number) and "value" (BRL, number)
- compensatedEnergyGDI: object with "qty" (kWh, number) and "value" (BRL, number, typically negative)
- publicLightingContrib: object with "value" (BRL, number)`;

const EnergyItemSchema = z.object({
  qty: z.number(),
  value: z.number(),
});

const InvoiceExtractionSchema = z.object({
  clientNumber: z.string(),
  referenceMonth: z.string(),
  electricEnergy: EnergyItemSchema,
  sceeEnergy: EnergyItemSchema,
  compensatedEnergyGDI: EnergyItemSchema,
  publicLightingContrib: z.object({ value: z.number() }),
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
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
      output_config: {
        format: zodOutputFormat(InvoiceExtractionSchema, "invoice_extraction"),
      },
    });

    return response.parsed_output;
  }
}
