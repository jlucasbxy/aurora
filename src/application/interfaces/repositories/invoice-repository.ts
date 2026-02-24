import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<Invoice>;
}
