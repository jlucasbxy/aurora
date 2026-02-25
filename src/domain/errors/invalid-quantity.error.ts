import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidQuantityError extends DomainError {
  constructor(message = "Invalid quantity") {
    super(ErrorCode.VALIDATION_ERROR, message);
  }
}
