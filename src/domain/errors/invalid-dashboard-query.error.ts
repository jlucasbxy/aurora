import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvalidDashboardQueryError extends DomainError {
  constructor(message = "Invalid query parameters") {
    super(ErrorCode.INVALID_DASHBOARD_QUERY, message);
  }
}
