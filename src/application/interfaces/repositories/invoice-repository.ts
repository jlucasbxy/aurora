import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceRepository {
  findAll(clientNumber?: string): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
}
