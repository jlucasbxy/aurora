import { z } from "zod";
import type { InvoiceExtractionDto } from "@/application/dtos";
import type { LLMProvider } from "@/application/interfaces/providers";
import { LlmError } from "@/application/interfaces/providers";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const EXTRACTION_PROMPT = `You are a data extraction assistant. Extract the following fields from the provided energy bill PDF.

IMPORTANT RULES:
- Extract ONLY information explicitly present in the document
- Do NOT infer, calculate, or estimate any values
- If a field cannot be found, return null for that field
- Return ONLY a valid JSON object with no additional text or explanation

Required fields:
- clientNumber: the customer number (string)
- referenceMonth: reference month in format "MMM/YYYY" e.g. "JAN/2024" (string)
- electricEnergyQty: electric energy quantity in kWh (integer)
- electricEnergyValue: electric energy value in BRL (number)
- sceeEnergyQty: SCEE ICMS energy quantity in kWh (integer)
- sceeEnergyValue: SCEE ICMS energy value in BRL (number)
- compensatedEnergyQty: compensated GDI energy quantity in kWh (integer)
- compensatedEnergyValue: compensated GDI energy value in BRL, usually negative (number)
- publicLightingContrib: public lighting contribution in BRL (number)`;

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

export class ExtractInvoiceDataUseCase {
  constructor(private readonly llmProvider: LLMProvider) {}

  async execute(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    try {
      return await this.llmProvider.sendStructuredRequest(
        pdfBuffer,
        EXTRACTION_PROMPT,
        InvoiceExtractionSchema
      );
    } catch (error) {
      if (error instanceof LlmError) {
        const code =
          error.code === "RATE_LIMITED"
            ? ErrorCode.RATE_LIMIT_EXCEEDED
            : ErrorCode.INTERNAL_SERVER_ERROR;
        throw new DomainError(code, error.message);
      }
      throw error;
    }
  }
}
