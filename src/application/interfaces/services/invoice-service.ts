import type { InvoiceDto } from "@/application/dtos";

export interface InvoiceService {
  getAll(clientNumber?: string): Promise<InvoiceDto[]>;
  processAndSave(pdfBuffer: Buffer): Promise<InvoiceDto>;
}
