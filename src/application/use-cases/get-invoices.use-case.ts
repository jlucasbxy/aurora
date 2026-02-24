import type { InvoiceDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(clientNumber?: string): Promise<InvoiceDto[]> {
    const invoices = await this.invoiceRepository.findAll(clientNumber);
    return invoices.map((invoice) => InvoiceMapper.toDto(invoice));
  }
}
