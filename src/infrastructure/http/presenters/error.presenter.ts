import { ErrorCode } from "@/application/dtos";

const STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.INVALID_FILE_TYPE]: 400
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
