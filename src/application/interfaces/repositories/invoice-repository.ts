import type { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";
import type { InvoiceEnergyReadModel, InvoiceFinancialReadModel } from "@/application/read-models";

export interface InvoiceRepository {
  findAll(query: InvoicesQuery): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  aggregateEnergy(query: DashboardQuery): Promise<InvoiceEnergyReadModel>;
  aggregateFinancial(query: DashboardQuery): Promise<InvoiceFinancialReadModel>;
}
