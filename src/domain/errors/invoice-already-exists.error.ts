import { ErrorCode } from "@/domain/enums";
import { DomainError } from "@/domain/errors/domain.error";

export class InvoiceAlreadyExistsError extends DomainError {
  constructor(message = "Invoice already exists for this client and reference month") {
    super(ErrorCode.INVOICE_ALREADY_EXISTS, message);
  }
}
