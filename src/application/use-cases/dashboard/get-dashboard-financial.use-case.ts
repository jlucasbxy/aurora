import type { DashboardFinancialDto, QueryDashboardDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceFinancialMapper } from "@/application/mappers";
import { DashboardQuery } from "@/domain/value-objects";

export class GetDashboardFinancialUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryDashboardDto): Promise<DashboardFinancialDto> {
    const query = DashboardQuery.create(dto);
    const readModel = await this.invoiceRepository.aggregateFinancial(query);
    return InvoiceFinancialMapper.toDto(readModel);
  }
}
