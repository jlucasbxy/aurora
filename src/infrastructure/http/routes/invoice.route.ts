import type { FastifyInstance, FastifySchema } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { InvoiceController } from "@/infrastructure/http/controllers";

export function registerInvoiceRoutes(
  app: FastifyInstance,
  controller: InvoiceController
) {
  app.get(
    `${ROUTE_PREFIXES.INVOICES}`,
    {
      config: { rateLimit: RATE_LIMITS.INVOICE_LIST },
      schema: {
        tags: ["Invoices"],
        summary: "List invoices",
        operationId: "listInvoices",
        response: {
          200: { $ref: "InvoicePaginatedResult#" },
          400: { $ref: "ErrorResponse#" },
          429: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" }
        }
      } as FastifySchema
    },
    (req, reply) => controller.list(req, reply)
  );

  app.post(
    `${ROUTE_PREFIXES.INVOICES}/upload`,
    {
      config: { rateLimit: RATE_LIMITS.INVOICE_UPLOAD },
      schema: {
        tags: ["Invoices"],
        summary: "Upload an energy invoice PDF",
        operationId: "uploadInvoice",
        consumes: ["multipart/form-data"],
        response: {
          201: { $ref: "Invoice#" },
          400: { $ref: "ErrorResponse#" },
          413: { $ref: "ErrorResponse#" },
          415: { $ref: "ErrorResponse#" },
          429: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" }
        }
      } as FastifySchema
    },
    (req, reply) => controller.upload(req, reply)
  );
}
