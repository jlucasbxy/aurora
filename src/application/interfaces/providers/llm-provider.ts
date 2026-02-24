import type { InvoiceExtractionDto } from "@/application/dtos";

export interface LLMProvider {
  extractInvoiceData(pdfBuffer: Buffer): Promise<InvoiceExtractionDto>;
}
