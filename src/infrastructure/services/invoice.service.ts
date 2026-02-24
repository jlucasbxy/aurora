import type { InvoiceService } from "@/application/interfaces/services";
import type { InvoiceExtractionResult } from "@/application/interfaces/providers";
import type { ExtractInvoiceDataUseCase } from "@/application/use-cases";

export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    private readonly extractInvoiceDataUseCase: ExtractInvoiceDataUseCase
  ) {}

  extractData(pdfBuffer: Buffer): Promise<InvoiceExtractionResult> {
    return this.extractInvoiceDataUseCase.execute(pdfBuffer);
  }
}
