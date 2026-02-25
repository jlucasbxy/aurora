import { z } from "zod";
import { InvalidDashboardQueryError } from "@/domain/errors";
import { clientNumberSchema, referenceMonthSchema } from "@/shared/schemas";

const schema = z.object({
  clientNumber: clientNumberSchema,
  dateStart: referenceMonthSchema.optional(),
  dateEnd: referenceMonthSchema.optional()
});

export interface DashboardQueryProps {
  clientNumber: string;
  dateStart?: string;
  dateEnd?: string;
}

interface ParsedProps {
  clientNumber: string;
  dateStart?: string;
  dateEnd?: string;
}

export class DashboardQuery {
  readonly clientNumber: string;
  readonly dateStart?: string;
  readonly dateEnd?: string;

  private constructor(props: ParsedProps) {
    this.clientNumber = props.clientNumber;
    this.dateStart = props.dateStart;
    this.dateEnd = props.dateEnd;
  }

  static create(props: DashboardQueryProps): DashboardQuery {
    const result = schema.safeParse(props);
    if (!result.success) {
      throw new InvalidDashboardQueryError(result.error.issues[0]?.message);
    }
    return new DashboardQuery(result.data);
  }
}
