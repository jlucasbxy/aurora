import type { Invoice } from "@/domain/entities/invoice.entity";
import type { DashboardQuery, InvoicesQuery } from "@/domain/value-objects";

export interface InvoiceEnergyResult {
  electricEnergyConsumption: number;
  compensatedEnergy: number;
}

export interface InvoiceFinancialResult {
  totalValueWithoutGD: number;
  gdSavings: number;
}

export interface InvoiceRepository {
  findAll(query: InvoicesQuery): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
  aggregateEnergy(query: DashboardQuery): Promise<InvoiceEnergyResult>;
  aggregateFinancial(query: DashboardQuery): Promise<InvoiceFinancialResult>;
}
