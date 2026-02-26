import type { MultipartFile } from "@fastify/multipart";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { QueryInvoiceDto } from "@/application/dtos/query-invoice.dto";
import type { InvoiceService } from "@/application/interfaces/services";
import type { Parser } from "@/infrastructure/http/parsers";

export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceQueryParser: Parser<QueryInvoiceDto>,
    private readonly multipartFileParser: Parser<
      Promise<Buffer[]>,
      MultipartFile | undefined
    >
  ) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = this.invoiceQueryParser.parse(request.query);
    const result = await this.invoiceService.getAll(query);
    return reply.status(200).send(result);
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const file = await request.file();
    const chunks = await this.multipartFileParser.parse(file);
    const pdfBuffer = Buffer.concat(chunks);
    const invoice = await this.invoiceService.processAndSave(pdfBuffer);
    return reply.status(201).send(invoice);
  }
}
