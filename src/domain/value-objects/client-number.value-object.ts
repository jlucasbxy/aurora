import { z } from "zod";
import { DomainError } from "@/domain/errors";
import { ErrorCode } from "@/application/dtos";

const schema = z.string().regex(/^\d{10}$/, "Client number must be exactly 10 digits");

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
