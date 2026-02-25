import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidDashboardQueryError extends DomainError {
  constructor(message = "Invalid query parameters") {
    super(ErrorCode.VALIDATION_ERROR, message);
  }
}
