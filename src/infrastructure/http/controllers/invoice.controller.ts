import type { FastifyReply, FastifyRequest } from "fastify";
import { ErrorCode } from "@/application/dtos";
import type { InvoiceService } from "@/application/interfaces/services";
import { DomainError } from "@/domain/errors";

export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  async upload(request: FastifyRequest, reply: FastifyReply) {
    const file = await request.file();

    if (!file || file.mimetype !== "application/pdf") {
      throw new DomainError(
        ErrorCode.INVALID_FILE_TYPE,
        "Only PDF files are accepted"
      );
    }

    const chunks: Buffer[] = [];
    for await (const chunk of file.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const result = await this.invoiceService.extractData(buffer);
    return reply.status(200).send(result);
  }
}
