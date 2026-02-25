import { z } from "zod";
import { InvalidMoneyError } from "@/domain/errors";

const schema = z.number();

export class Money {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(raw: number): Money {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new InvalidMoneyError(result.error.issues[0]?.message);
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
