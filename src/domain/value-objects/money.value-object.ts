import { z } from "zod";
import { DomainError } from "@/domain/errors";
import { ErrorCode } from "@/application/dtos";

const schema = z.number().finite();

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

  getValue(): number {
    return this.value;
  }
}
