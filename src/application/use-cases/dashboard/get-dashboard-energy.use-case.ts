import type { DashboardEnergyDto, QueryDashboardDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceEnergyMapper } from "@/application/mappers";
import { DashboardQuery } from "@/domain/value-objects";

export class GetDashboardEnergyUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryDashboardDto): Promise<DashboardEnergyDto> {
    const query = DashboardQuery.create(dto);
    const readModel = await this.invoiceRepository.aggregateEnergy(query);
    return InvoiceEnergyMapper.toDto(readModel);
  }
}
