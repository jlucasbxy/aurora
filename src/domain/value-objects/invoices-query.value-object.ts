import { z } from "zod";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
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
  limit?: string;
}

interface ParsedProps {
  clientNumber?: string;
  referenceMonth?: string;
  cursor?: string;
  limit: number;
}

export class InvoicesQuery {
  readonly clientNumber?: string;
  readonly referenceMonth?: string;
  readonly cursor?: string;
  readonly limit: number;

  private constructor(props: ParsedProps) {
    this.clientNumber = props.clientNumber;
    this.referenceMonth = props.referenceMonth;
    this.cursor = props.cursor;
    this.limit = props.limit;
  }

  static create(props: InvoicesQueryProps): InvoicesQuery {
    const result = schema.safeParse(props);
    if (!result.success) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? "Invalid query parameters"
      );
    }
    return new InvoicesQuery(result.data);
  }
}
