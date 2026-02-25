import type { Quantity } from "@/domain/value-objects";

export interface InvoiceEnergyReadModel {
  electricEnergyConsumption: Quantity;
  compensatedEnergy: Quantity;
}
