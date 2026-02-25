import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidClientNumberError extends DomainError {
  constructor(message = "Invalid client number") {
    super(ErrorCode.VALIDATION_ERROR, message);
  }
}
