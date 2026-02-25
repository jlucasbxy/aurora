import type { FastifyReply, FastifyRequest } from "fastify";
import type { InvoiceService } from "@/application/interfaces/services";
import {
  InvoiceQueryParser,
  MultipartFileParser
} from "@/infrastructure/http/parsers";

export class InvoiceController {
  private readonly multipartFileParser = new MultipartFileParser();
  private readonly invoiceQueryParser = new InvoiceQueryParser();

  constructor(private readonly invoiceService: InvoiceService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = this.invoiceQueryParser.parse(request.query);
    const result = await this.invoiceService.getAll(query);
    return reply.status(200).send(result);
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const file = await request.file();
    const chunks = await this.multipartFileParser.parse(file!);
    const pdfBuffer = Buffer.concat(chunks);
    const invoice = await this.invoiceService.processAndSave(pdfBuffer);
    return reply.status(201).send(invoice);
  }
}
