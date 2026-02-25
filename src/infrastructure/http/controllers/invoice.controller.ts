import type { FastifyReply, FastifyRequest } from "fastify";
import type { InvoiceService } from "@/application/interfaces/services";
import { UploadFileValidator } from "@/infrastructure/http/validators";

export class InvoiceController {
  private readonly uploadFileValidator = new UploadFileValidator();

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
    const dto = { fileStream: file?.file, mimetype: file?.mimetype };
    this.uploadFileValidator.validate(dto);
    const invoice = await this.invoiceService.processAndSave(dto);
    return reply.status(201).send(invoice);
  }
}
