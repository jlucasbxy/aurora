import { InvalidClientNumberError } from "@/domain/errors";
import { clientNumberSchema as schema } from "@/shared/schemas";

export class ClientNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ClientNumber {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new InvalidClientNumberError(result.error.issues[0]?.message);
    }
    return new ClientNumber(result.data);
  }

  static reconstitute(value: string): ClientNumber {
    return new ClientNumber(value);
  }

  getValue(): string {
    return this.value;
  }
}
