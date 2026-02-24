import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";
import type { Invoice } from "@/domain/entities/invoice.entity";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  execute(clientNumber?: string): Promise<Invoice[]> {
    return this.invoiceRepository.findAll(clientNumber);
  }
}
