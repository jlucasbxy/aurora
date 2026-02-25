import type { DashboardEnergyDto } from "@/application/dtos";
import type { InvoiceEnergyReadModel } from "@/application/read-models";

export class InvoiceEnergyMapper {
  static toDto(readModel: InvoiceEnergyReadModel): DashboardEnergyDto {
    return {
      electricEnergyConsumption: readModel.electricEnergyConsumption.getValue(),
      compensatedEnergy: readModel.compensatedEnergy.getValue()
    };
  }
}
