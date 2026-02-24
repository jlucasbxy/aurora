import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors";
import { clientNumberSchema as schema } from "@/shared/schemas";

export class ClientNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): ClientNumber {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        result.error.issues[0]?.message ?? "Invalid client number"
      );
    }
    return new ClientNumber(result.data);
  }

  getValue(): string {
    return this.value;
  }
}
