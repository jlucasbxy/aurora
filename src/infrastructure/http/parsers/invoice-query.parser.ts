import { z } from "zod";
import { HttpError } from "@/infrastructure/http/errors";
import { clientNumberSchema, referenceMonthSchema, uuidV7Schema } from "@/shared/schemas";
import type { QueryInvoiceDto } from "@/application/dtos/query-invoice.dto";

const invoiceQuerySchema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional(),
  cursor: uuidV7Schema.optional(),
  limit: z.string().optional(),
});

export class InvoiceQueryParser {
  parse(query: unknown): QueryInvoiceDto {
    const result = invoiceQuerySchema.safeParse(query);

    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new HttpError(400, "INVALID_QUERY_PARAMS", message);
    }

    return result.data;
  }
}
