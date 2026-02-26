import type {
  InvoiceEnergyReadModel,
  InvoiceFinancialReadModel
} from "@/application/read-models";
import type { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";

export interface InvoiceRepository {
  findAll(query: InvoicesQuery): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  aggregateEnergy(
    query: DashboardQuery
  ): Promise<InvoiceEnergyReadModel | null>;
  aggregateFinancial(
    query: DashboardQuery
  ): Promise<InvoiceFinancialReadModel | null>;
}
