import type { InvoiceExtractionDto } from "@/application/dtos";
import type { LLMProvider } from "@/application/interfaces/providers";

export class ExtractInvoiceDataUseCase {
  constructor(private readonly llmProvider: LLMProvider) {}

  execute(pdfBuffer: Buffer): Promise<InvoiceExtractionDto> {
    return this.llmProvider.extractInvoiceData(pdfBuffer);
  }
}
