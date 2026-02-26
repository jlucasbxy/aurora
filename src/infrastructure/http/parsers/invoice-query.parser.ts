import { z } from "zod";
import type { QueryInvoiceDto } from "@/application/dtos/query-invoice.dto";
import { HttpError } from "@/infrastructure/http/errors";
import type { Parser } from "@/infrastructure/http/parsers";
import {
  clientNumberSchema,
  limitSchema,
  referenceMonthSchema,
  uuidV7Schema
} from "@/shared/schemas";

const invoiceQuerySchema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional(),
  cursor: uuidV7Schema.optional(),
  limit: z.coerce.number().pipe(limitSchema).optional()
});

export class InvoiceQueryParser implements Parser<QueryInvoiceDto> {
  parse(query: unknown): QueryInvoiceDto {
    const result = invoiceQuerySchema.safeParse(query);

    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new HttpError(400, "INVALID_QUERY_PARAMS", message);
    }

    return result.data;
  }
}
