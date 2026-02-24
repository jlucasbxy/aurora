import type { InvoiceService } from "@/application/interfaces/services";
import type {
  ExtractInvoiceDataUseCase,
  GetInvoicesUseCase,
  ProcessInvoiceDataUseCase,
  SaveInvoiceUseCase
} from "@/application/use-cases";
import type { Invoice } from "@/domain/entities/invoice.entity";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly extractInvoiceDataUseCase: ExtractInvoiceDataUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly processInvoiceDataUseCase: ProcessInvoiceDataUseCase,
    private readonly saveInvoiceUseCase: SaveInvoiceUseCase
  ) {}

  getAll(clientNumber?: string): Promise<Invoice[]> {
    return this.getInvoicesUseCase.execute(clientNumber);
  }

  async processAndSave(pdfBuffer: Buffer): Promise<Invoice> {
    const extracted = await this.extractInvoiceDataUseCase.execute(pdfBuffer);
    const processed = this.processInvoiceDataUseCase.execute(extracted);
    return this.saveInvoiceUseCase.execute(processed);
  }
}
