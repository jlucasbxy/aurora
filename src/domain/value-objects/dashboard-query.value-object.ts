import { z } from "zod";
import { InvalidDashboardQueryError } from "@/domain/errors";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const schema = z.object({
  clientNumber: clientNumberSchema.optional(),
  referenceMonth: referenceMonthSchema.optional()
});

export interface DashboardQueryProps {
  clientNumber?: string;
  referenceMonth?: string;
}

interface ParsedProps {
  clientNumber?: string;
  referenceMonth?: string;
}

export class DashboardQuery {
  readonly clientNumber?: string;
  readonly referenceMonth?: string;

  private constructor(props: ParsedProps) {
    this.clientNumber = props.clientNumber;
    this.referenceMonth = props.referenceMonth;
  }

  static create(props: DashboardQueryProps): DashboardQuery {
    const result = schema.safeParse(props);
    if (!result.success) {
      throw new InvalidDashboardQueryError(result.error.issues[0]?.message);
    }
    return new DashboardQuery(result.data);
  }
}
