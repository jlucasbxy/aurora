import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceService {
  processAndSave(pdfBuffer: Buffer): Promise<Invoice>;
}
