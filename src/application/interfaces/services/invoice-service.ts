import type { InvoiceExtractionResult } from "@/application/interfaces/providers";

export interface InvoiceService {
  extractData(pdfBuffer: Buffer): Promise<InvoiceExtractionResult>;
}
