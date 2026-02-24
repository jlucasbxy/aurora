import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
import { referenceMonthSchema as schema } from "@/shared/schemas";

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
