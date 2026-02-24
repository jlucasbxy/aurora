import type { InvoiceDto, QueryInvoiceDto } from "@/application/dtos";

export interface InvoiceService {
  getAll(dto: QueryInvoiceDto): Promise<InvoiceDto[]>;
  processAndSave(pdfBuffer: Buffer): Promise<InvoiceDto>;
}
