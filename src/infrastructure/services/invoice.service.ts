import type { InvoiceDto, QueryInvoiceDto } from "@/application/dtos";
import type { InvoiceService } from "@/application/interfaces/services";
import type {
  ExtractInvoiceDataUseCase,
  GetInvoicesUseCase,
  ProcessInvoiceDataUseCase,
  SaveInvoiceUseCase
} from "@/application/use-cases";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly extractInvoiceDataUseCase: ExtractInvoiceDataUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly processInvoiceDataUseCase: ProcessInvoiceDataUseCase,
    private readonly saveInvoiceUseCase: SaveInvoiceUseCase
  ) {}

  getAll(dto: QueryInvoiceDto): Promise<InvoiceDto[]> {
    return this.getInvoicesUseCase.execute(dto);
  }

  async processAndSave(pdfBuffer: Buffer): Promise<InvoiceDto> {
    const extracted = await this.extractInvoiceDataUseCase.execute(pdfBuffer);
    const processed = this.processInvoiceDataUseCase.execute(extracted);
    return this.saveInvoiceUseCase.execute(processed);
  }
}
