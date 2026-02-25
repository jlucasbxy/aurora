import type {
  InvoiceDto,
  PaginatedResult,
  QueryInvoiceDto,
  UploadFileDto
} from "@/application/dtos";
import type { InvoiceService } from "@/application/interfaces/services";
import { ErrorCode } from "@/application/dtos";
import { DomainError } from "@/domain/errors";
import type {
  ExtractInvoiceDataUseCase,
  GetInvoicesUseCase,
  ProcessInvoiceDataUseCase,
  SaveInvoiceUseCase
} from "@/application/use-cases/invoices";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly extractInvoiceDataUseCase: ExtractInvoiceDataUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly processInvoiceDataUseCase: ProcessInvoiceDataUseCase,
    private readonly saveInvoiceUseCase: SaveInvoiceUseCase
  ) {}

  getAll(dto: QueryInvoiceDto): Promise<PaginatedResult<InvoiceDto>> {
    return this.getInvoicesUseCase.execute(dto);
  }

  async processAndSave({ fileStream }: UploadFileDto): Promise<InvoiceDto> {
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream!) {
      chunks.push(chunk);
    }

    if ((fileStream! as typeof fileStream & { truncated?: boolean }).truncated) {
      throw new DomainError(ErrorCode.FILE_TOO_LARGE, "File exceeds the 50 KB limit");
    }

    const pdfBuffer = Buffer.concat(chunks);
    const extracted = await this.extractInvoiceDataUseCase.execute(pdfBuffer);
    const processed = this.processInvoiceDataUseCase.execute(extracted);
    return this.saveInvoiceUseCase.execute(processed);
  }
}
