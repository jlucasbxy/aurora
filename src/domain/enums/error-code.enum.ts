export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE"
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
