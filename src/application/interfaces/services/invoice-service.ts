import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceService {
  getAll(clientNumber?: string): Promise<Invoice[]>;
  processAndSave(pdfBuffer: Buffer): Promise<Invoice>;
}
