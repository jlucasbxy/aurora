import { z } from "zod";
import { InvalidDashboardQueryError } from "@/domain/errors";
import { ReferenceMonth } from "@/domain/value-objects/reference-month.value-object";
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

export class DashboardQuery {
  readonly clientNumber: string;
  readonly dateStart?: Date;
  readonly dateEnd?: Date;

  private constructor(clientNumber: string, dateStart?: Date, dateEnd?: Date) {
    this.clientNumber = clientNumber;
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
  }

  static create(props: DashboardQueryProps): DashboardQuery {
    const result = schema.safeParse(props);
    if (!result.success) {
      throw new InvalidDashboardQueryError(result.error.issues[0]?.message);
    }
    const { clientNumber, dateStart, dateEnd } = result.data;
    return new DashboardQuery(
      clientNumber,
      dateStart ? ReferenceMonth.create(dateStart).getValue() : undefined,
      dateEnd ? ReferenceMonth.create(dateEnd).getValue() : undefined
    );
  }
}
