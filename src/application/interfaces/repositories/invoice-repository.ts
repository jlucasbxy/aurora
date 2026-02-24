import type { InvoiceListItem } from "@/application/read-models";
import type { Invoice } from "@/domain/entities/invoice.entity";

export interface InvoiceRepository {
  findAll(clientNumber?: string): Promise<InvoiceListItem[]>;
  save(invoice: Invoice): Promise<Invoice>;
}
