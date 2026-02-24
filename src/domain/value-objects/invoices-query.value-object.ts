import { z } from "zod";
import { ErrorCode } from "@/application/dtos";
import { DomainError } from "@/domain/errors";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const schema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional()
});

interface InvoicesQueryProps {
  clientNumber?: string;
  referenceMonth?: string;
}

export class InvoicesQuery {
  readonly clientNumber?: string;
  readonly referenceMonth?: string;

  private constructor(props: InvoicesQueryProps) {
    this.clientNumber = props.clientNumber;
    this.referenceMonth = props.referenceMonth;
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
