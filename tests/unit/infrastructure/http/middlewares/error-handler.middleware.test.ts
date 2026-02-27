import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError, ZodIssueCode } from "zod";
import { ErrorCode } from "@/application/dtos";
import { DomainError } from "@/domain/errors";
import { HttpError } from "@/infrastructure/http/errors";
import { errorHandler } from "@/infrastructure/http/middlewares/error-handler.middleware";

function createMockReply() {
  const reply: Record<string, unknown> = {};
  reply.status = vi.fn().mockReturnValue(reply);
  reply.send = vi.fn().mockReturnValue(reply);
  return reply as unknown as {
    status: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };
}

function createMockRequest() {
  return { log: { error: vi.fn() } } as unknown as Parameters<
    typeof errorHandler
  >[1];
}

describe("errorHandler", () => {
  let reply: ReturnType<typeof createMockReply>;
  let request: ReturnType<typeof createMockRequest>;

  beforeEach(() => {
    reply = createMockReply();
    request = createMockRequest();
  });

  it("maps 413 statusCode to FILE_TOO_LARGE", () => {
    const error = { statusCode: 413, message: "Payload too large" } as never;

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(413);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCode.FILE_TOO_LARGE })
    );
  });

  it("maps HttpError to its statusCode and code", () => {
    const error = new HttpError(422, "CUSTOM_CODE", "Custom message");

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(422);
    expect(reply.send).toHaveBeenCalledWith({
      code: "CUSTOM_CODE",
      message: "Custom message"
    });
  });

  it("maps DomainError VALIDATION_ERROR to 400", () => {
    const error = new DomainError(ErrorCode.VALIDATION_ERROR, "Invalid input");

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCode.VALIDATION_ERROR })
    );
  });

  it("maps DomainError RESOURCE_NOT_FOUND to 404", () => {
    const error = new DomainError(
      ErrorCode.RESOURCE_NOT_FOUND,
      "Not found"
    );

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(404);
  });

  it("maps DomainError INVOICE_ALREADY_EXISTS to 409", () => {
    const error = new DomainError(
      ErrorCode.INVOICE_ALREADY_EXISTS,
      "Duplicate"
    );

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(409);
  });

  it("maps DomainError RATE_LIMIT_EXCEEDED to 429", () => {
    const error = new DomainError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      "Too many requests"
    );

    errorHandler(error, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(429);
  });

  it("maps ZodError to 400 with validation messages", () => {
    const zodError = new ZodError([
      {
        code: ZodIssueCode.invalid_type,
        expected: "string",
        path: ["field"],
        message: "Expected string, received number"
      }
    ]);

    errorHandler(zodError as never, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: ["Expected string, received number"]
      })
    );
  });

  it("maps unknown errors to 500 and logs them", () => {
    const error = new Error("Unexpected failure");

    errorHandler(error as never, request, reply as never);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCode.INTERNAL_SERVER_ERROR })
    );
    expect((request.log as unknown as { error: ReturnType<typeof vi.fn> }).error).toHaveBeenCalledWith(error);
  });
});
