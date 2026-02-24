import type { InvoiceService } from "@/application/interfaces/services";
import type { Invoice } from "@/domain/entities/invoice.entity";
import type { ExtractInvoiceDataUseCase } from "@/application/use-cases";
import type { ProcessInvoiceDataUseCase } from "@/application/use-cases";
import type { SaveInvoiceUseCase } from "@/application/use-cases";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly extractInvoiceDataUseCase: ExtractInvoiceDataUseCase,
    private readonly processInvoiceDataUseCase: ProcessInvoiceDataUseCase,
    private readonly saveInvoiceUseCase: SaveInvoiceUseCase
  ) {}

  async processAndSave(pdfBuffer: Buffer): Promise<Invoice> {
    const extracted = await this.extractInvoiceDataUseCase.execute(pdfBuffer);
    const processed = this.processInvoiceDataUseCase.execute(extracted);
    return this.saveInvoiceUseCase.execute(processed);
  }
}
