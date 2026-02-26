import { z } from "zod";
import { InvalidInvoicesQueryError } from "@/domain/errors";
import { ReferenceMonth } from "@/domain/value-objects/reference-month.value-object";
import {
  clientNumberSchema,
  limitSchema,
  referenceMonthSchema,
  uuidV7Schema
} from "@/shared/schemas";

const schema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional(),
  cursor: uuidV7Schema.optional(),
  limit: limitSchema.default(10)
});

export interface InvoicesQueryProps {
  clientNumber?: string;
  referenceMonth?: string;
  cursor?: string;
  limit?: number;
}

export class InvoicesQuery {
  readonly clientNumber?: string;
  readonly referenceMonth?: Date;
  readonly cursor?: string;
  readonly limit: number;

  private constructor(clientNumber?: string, referenceMonth?: Date, cursor?: string, limit: number = 10) {
    this.clientNumber = clientNumber;
    this.referenceMonth = referenceMonth;
    this.cursor = cursor;
    this.limit = limit;
  }

  static create(props: InvoicesQueryProps): InvoicesQuery {
    const result = schema.safeParse(props);
    if (!result.success) {
      throw new InvalidInvoicesQueryError(result.error.issues[0]?.message);
    }
    const { clientNumber, referenceMonth, cursor, limit } = result.data;
    return new InvoicesQuery(
      clientNumber,
      referenceMonth ? ReferenceMonth.create(referenceMonth).getValue() : undefined,
      cursor,
      limit
    );
  }
}
