import Anthropic from "@anthropic-ai/sdk";
import type { InvoiceExtractionDto } from "@/application/dtos";
import type { LLMProvider } from "@/application/interfaces/providers";
import { env } from "@/infrastructure/config/env.config";

const EXTRACTION_PROMPT = `Extract the following fields from this energy bill PDF and return them as a JSON object with no additional text or markdown.

Required fields:
- clientNumber: the customer number (string)
- referenceMonth: the reference month in format "MMM/YYYY" e.g. "SET/2024" (string)
- electricEnergy: object with "qty" (kWh, number) and "value" (BRL, number)
- sceeEnergy: object with "qty" (kWh, number) and "value" (BRL, number)
- compensatedEnergyGDI: object with "qty" (kWh, number) and "value" (BRL, number, typically negative)
- publicLightingContrib: object with "value" (BRL, number)

Return only valid JSON, no explanation.`;

export class ClaudeLLMProvider implements LLMProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    const base64Pdf = pdfBuffer.toString("base64");

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-6",
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
      ]
    });

    const raw = (response.content[0] as { type: string; text: string }).text;
    const text = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
    return JSON.parse(text) as InvoiceExtractionDto;
  }
}
