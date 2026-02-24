import type { DashboardEnergyDto, QueryDashboardDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { DashboardQuery } from "@/domain/value-objects";

export class GetDashboardEnergyUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryDashboardDto): Promise<DashboardEnergyDto> {
    const query = DashboardQuery.create(dto);
    const result = await this.invoiceRepository.aggregateEnergy(query);
    return {
      electricEnergyConsumption: result.electricEnergyConsumption,
      compensatedEnergy: result.compensatedEnergy
    };
  }
}
