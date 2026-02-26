import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class ResourceNotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super(ErrorCode.RESOURCE_NOT_FOUND, message);
  }
}
