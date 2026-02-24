import type { InvoiceDto, PaginatedResult, QueryInvoiceDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";
import { InvoicesQuery } from "@/domain/value-objects";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryInvoiceDto): Promise<PaginatedResult<InvoiceDto>> {
    const query = InvoicesQuery.create(dto);
    const invoices = await this.invoiceRepository.findAll(query);

    const hasNextPage = invoices.length > query.limit;
    const items = hasNextPage ? invoices.slice(0, query.limit) : invoices;
    const nextCursor = hasNextPage ? (items[items.length - 1]?.id ?? null) : null;

    return {
      data: items.map((invoice) => InvoiceMapper.toDto(invoice)),
      nextCursor,
      hasNextPage
    };
  }
}
