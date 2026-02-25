import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorCode } from "@/application/dtos";
import type { InvoiceService } from "@/application/interfaces/services";
import { DomainError } from "@/domain/errors";

export class InvoiceController {
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
    const invoice = await this.invoiceService.processAndSave({
      fileStream: file?.file,
      mimetype: file?.mimetype
    });
    return reply.status(201).send(invoice);
  }
}
