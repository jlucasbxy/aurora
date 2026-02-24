import type { Invoice } from "@/domain/entities/invoice.entity";
import type { InvoicesQuery } from "@/domain/value-objects";

export interface InvoiceRepository {
  findAll(query: InvoicesQuery): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
}
