import { InvalidReferenceMonthError } from "@/domain/errors";
import { referenceMonthSchema as schema } from "@/shared/schemas";

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5,
  JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11
};
const MONTH_NAMES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

export class ReferenceMonth {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static create(raw: string): ReferenceMonth {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new InvalidReferenceMonthError(result.error.issues[0]?.message);
    }
    const [monthAbbr, yearStr] = result.data.split('/');
    const month = MONTH_MAP[monthAbbr!];
    const year = parseInt(yearStr!, 10);
    const date = new Date(Date.UTC(year, month!, 1));
    return new ReferenceMonth(date);
  }

  static reconstitute(value: Date): ReferenceMonth {
    return new ReferenceMonth(value);
  }

  getValue(): Date {
    return this.value;
  }

  toDisplay(): string {
    const month = MONTH_NAMES[this.value.getUTCMonth()]!;
    const year = this.value.getUTCFullYear();
    return `${month}/${year}`;
  }
}
