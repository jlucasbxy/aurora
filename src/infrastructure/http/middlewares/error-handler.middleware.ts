import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { ErrorCode } from "@/application/dtos";
import { DomainError } from "@/domain/errors";
import { HttpError } from "@/infrastructure/http/errors";
import { httpStatusFor, toResponse } from "@/infrastructure/http/presenters";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if ("statusCode" in error && error.statusCode === 413) {
    const body = toResponse(
      ErrorCode.FILE_TOO_LARGE,
      "File or request body exceeds the 50 KB limit"
    );
    return reply.status(413).send(body);
  }

  if (error instanceof HttpError) {
    return reply
      .status(error.statusCode)
      .send({ code: error.code, message: error.message });
  }

  if (error instanceof DomainError) {
    const statusCode = httpStatusFor(error.code);
    const body = toResponse(error.code, error.message);
    return reply.status(statusCode).send(body);
  }

  if (error instanceof ZodError) {
    const messages = error.issues.map((issue) => issue.message);
    const body = toResponse(ErrorCode.VALIDATION_ERROR, messages);
    return reply.status(400).send(body);
  }

  request.log.error(error);
  const body = toResponse(
    ErrorCode.INTERNAL_SERVER_ERROR,
    "Internal Server Error"
  );
  return reply.status(500).send(body);
}
