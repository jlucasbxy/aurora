import type { InvoiceDto, QueryInvoiceDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";
import { InvoicesQuery } from "@/domain/value-objects";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(dto: QueryInvoiceDto): Promise<InvoiceDto[]> {
    const query = InvoicesQuery.create(dto);
    const invoices = await this.invoiceRepository.findAll(query);
    return invoices.map((invoice) => InvoiceMapper.toDto(invoice));
  }
}
