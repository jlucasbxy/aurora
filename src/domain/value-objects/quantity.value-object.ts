import { z } from "zod";
import { InvalidQuantityError } from "@/domain/errors";

const schema = z.number().int();

export class Quantity {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(raw: number): Quantity {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new InvalidQuantityError(result.error.issues[0]?.message);
    }
    return new Quantity(result.data);
  }

  static reconstitute(value: number): Quantity {
    return new Quantity(value);
  }

  getValue(): number {
    return this.value;
  }
}
