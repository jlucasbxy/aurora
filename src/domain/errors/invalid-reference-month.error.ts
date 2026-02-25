import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidReferenceMonthError extends DomainError {
  constructor(message = "Invalid reference month") {
    super(ErrorCode.VALIDATION_ERROR, message);
  }
}
