import { z } from "zod";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";

const schema = z.number();

export class Money {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(raw: number): Money {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? "Invalid money value"
      );
    }
    return new Money(result.data);
  }

  static reconstitute(value: number): Money {
    return new Money(value);
  }

  getValue(): number {
    return this.value;
  }
}
