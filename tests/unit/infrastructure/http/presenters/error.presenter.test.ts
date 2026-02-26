import { describe, expect, it } from "vitest";
import { ErrorCode } from "@/application/dtos";
import { httpStatusFor, toResponse } from "@/infrastructure/http/presenters";

describe("error.presenter", () => {
  it("maps ErrorCode to HTTP status", () => {
    expect(httpStatusFor(ErrorCode.VALIDATION_ERROR)).toBe(400);
    expect(httpStatusFor(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(429);
    expect(httpStatusFor(ErrorCode.RESOURCE_NOT_FOUND)).toBe(404);
  });

  it("creates response payload", () => {
    expect(toResponse(ErrorCode.INVALID_FILE_TYPE, "Bad file")).toEqual({
      code: ErrorCode.INVALID_FILE_TYPE,
      message: "Bad file"
    });
  });
});
