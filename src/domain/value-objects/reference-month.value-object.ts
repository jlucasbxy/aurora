import { z } from "zod";
import { DomainError } from "@/domain/errors";
import { ErrorCode } from "@/application/dtos";

const schema = z
  .string()
  .regex(
    /^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}$/,
    "Reference month must be in MMM/YYYY format (e.g. JAN/2024)"
  );

export class ReferenceMonth {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ReferenceMonth {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? "Invalid reference month"
      );
    }
    return new ReferenceMonth(result.data);
  }

  getValue(): string {
    return this.value;
  }
}
