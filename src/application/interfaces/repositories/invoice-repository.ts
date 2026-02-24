import type { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";

export interface InvoiceAggregateResult {
  electricEnergyConsumption: number;
  compensatedEnergy: number;
  totalValueWithoutGD: number;
  gdSavings: number;
}

export interface InvoiceRepository {
  findAll(query: InvoicesQuery): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  aggregate(query: DashboardQuery): Promise<InvoiceAggregateResult>;
}
