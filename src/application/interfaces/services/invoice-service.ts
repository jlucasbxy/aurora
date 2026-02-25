import type { Readable } from "node:stream";
import type { InvoiceDto, PaginatedResult, QueryInvoiceDto } from "@/application/dtos";

export interface InvoiceService {
  getAll(dto: QueryInvoiceDto): Promise<PaginatedResult<InvoiceDto>>;
  processAndSave(fileStream: Readable | undefined, mimetype: string | undefined): Promise<InvoiceDto>;
}
