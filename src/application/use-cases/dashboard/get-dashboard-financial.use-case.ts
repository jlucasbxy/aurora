import type {
  DashboardFinancialDto,
  QueryDashboardDto
} from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceFinancialMapper } from "@/application/mappers";
import { ResourceNotFoundError } from "@/domain/errors";
import { DashboardQuery } from "@/domain/value-objects";

export class GetDashboardFinancialUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryDashboardDto): Promise<DashboardFinancialDto> {
    const query = DashboardQuery.create(dto);
    const readModel = await this.invoiceRepository.aggregateFinancial(query);
    if (!readModel)
      throw new ResourceNotFoundError(
        "No financial data found for the given query"
      );
    return InvoiceFinancialMapper.toDto(readModel);
  }
}
