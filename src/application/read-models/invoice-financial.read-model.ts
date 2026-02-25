import type { Money } from "@/domain/value-objects";

export interface InvoiceFinancialReadModel {
  totalValueWithoutGD: Money;
  gdSavings: Money;
}
