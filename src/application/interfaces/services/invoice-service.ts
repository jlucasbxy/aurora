import type { InvoiceListItem } from "@/application/read-models";
import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceService {
  getAll(clientNumber?: string): Promise<InvoiceListItem[]>;
  processAndSave(pdfBuffer: Buffer): Promise<Invoice>;
}
