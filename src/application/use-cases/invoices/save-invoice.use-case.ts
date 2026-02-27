import type { InvoiceDto } from "@/application/dtos";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import { InvoiceMapper } from "@/application/mappers";
import type { Invoice } from "@/domain/entities/invoice.entity";

export class SaveInvoiceUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(invoice: Invoice): Promise<InvoiceDto> {
    const saved = await this.invoiceRepository.save(invoice);
    return InvoiceMapper.toDto(saved);
  }
}
