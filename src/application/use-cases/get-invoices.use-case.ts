import type { InvoiceListItem } from "@/application/read-models";
import type { InvoiceRepository } from "@/application/interfaces/repositories/invoice-repository";

export class GetInvoicesUseCase {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  execute(clientNumber?: string): Promise<InvoiceListItem[]> {
    return this.invoiceRepository.findAll(clientNumber);
  }
}
