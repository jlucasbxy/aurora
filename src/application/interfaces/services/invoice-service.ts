import type { InvoiceDto, PaginatedResult, QueryInvoiceDto, UploadFileDto } from "@/application/dtos";

export interface InvoiceService {
  getAll(dto: QueryInvoiceDto): Promise<PaginatedResult<InvoiceDto>>;
  processAndSave(file: UploadFileDto): Promise<InvoiceDto>;
}
