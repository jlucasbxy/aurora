import type { InvoiceDto, PaginatedResult, QueryInvoiceDto } from "@/application/dtos";

export interface InvoiceService {
  getAll(dto: QueryInvoiceDto): Promise<PaginatedResult<InvoiceDto>>;
  processAndSave(pdfBuffer: Buffer): Promise<InvoiceDto>;
}
