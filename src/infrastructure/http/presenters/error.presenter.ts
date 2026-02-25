import { ErrorCode } from "@/application/dtos";

const STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.INVALID_FILE_TYPE]: 400,
  [ErrorCode.INVALID_MONEY]: 400,
  [ErrorCode.INVALID_QUANTITY]: 400,
  [ErrorCode.INVALID_REFERENCE_MONTH]: 400,
  [ErrorCode.INVALID_CLIENT_NUMBER]: 400,
  [ErrorCode.INVALID_DASHBOARD_QUERY]: 400,
  [ErrorCode.INVALID_INVOICES_QUERY]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413
};

export function httpStatusFor(code: ErrorCode): number {
  return STATUS_MAP[code];
}

export function toResponse(code: ErrorCode, message: string | string[]) {
  return {
    code,
    message
  };
}
