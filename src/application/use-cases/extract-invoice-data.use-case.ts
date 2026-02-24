import type {
  InvoiceExtractionResult,
  LLMProvider
} from "@/application/interfaces/providers";

export class ExtractInvoiceDataUseCase {
  constructor(private readonly llmProvider: LLMProvider) {}

  execute(pdfBuffer: Buffer): Promise<InvoiceExtractionResult> {
    return this.llmProvider.extractInvoiceData(pdfBuffer);
  }
}
