import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidMoneyError extends DomainError {
  constructor(message = "Invalid money value") {
    super(ErrorCode.INVALID_MONEY, message);
  }
}
