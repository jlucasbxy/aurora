import { z } from "zod";
import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";

const schema = z.number().int();

export class Quantity {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(raw: number): Quantity {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? "Invalid quantity"
      );
    }
    return new Quantity(result.data);
  }

  getValue(): number {
    return this.value;
  }
}
