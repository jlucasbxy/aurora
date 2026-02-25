import type { FastifyReply, FastifyRequest } from "fastify";
import type { InvoiceService } from "@/application/interfaces/services";
import { MultipartFileParser } from "@/infrastructure/http/parsers";

export class InvoiceController {
  private readonly multipartFileParser = new MultipartFileParser();

  constructor(private readonly invoiceService: InvoiceService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { clientNumber, referenceMonth, cursor, limit } = request.query as {
      clientNumber?: string;
      referenceMonth?: string;
      cursor?: string;
      limit?: string;
    };
    const result = await this.invoiceService.getAll({
      clientNumber,
      referenceMonth,
      cursor,
      limit
    });
    return reply.status(200).send(result);
  }

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const file = await request.file();
    const chunks = await this.multipartFileParser.validate(file!);
    const pdfBuffer = Buffer.concat(chunks);
    const invoice = await this.invoiceService.processAndSave(pdfBuffer);
    return reply.status(201).send(invoice);
  }
}
