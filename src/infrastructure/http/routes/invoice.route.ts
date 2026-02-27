import type { FastifyInstance, FastifySchema } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { InvoiceController } from "@/infrastructure/http/controllers";

const CLIENT_NUMBER_PATTERN = "^\\d{10}$";
const REFERENCE_MONTH_PATTERN =
  "^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\\/\\d{4}$";
const UUID_V7_PATTERN =
  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";

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
        querystring: {
          type: "object",
          properties: {
            clientNumber: {
              type: "string",
              pattern: CLIENT_NUMBER_PATTERN,
              description: "Client number with exactly 10 digits"
            },
            referenceMonth: {
              type: "string",
              pattern: REFERENCE_MONTH_PATTERN,
              description: "Reference month in MMM/YYYY format"
            },
            cursor: {
              type: "string",
              pattern: UUID_V7_PATTERN,
              description: "Pagination cursor (UUID v7)"
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Page size"
            }
          }
        },
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
      validatorCompiler: ({ httpPart }) => {
        if (httpPart === "body") return () => true;
        return undefined as never;
      },
      schema: {
        tags: ["Invoices"],
        summary: "Upload an energy invoice PDF",
        operationId: "uploadInvoice",
        consumes: ["multipart/form-data"],
        body: {
          type: "object",
          required: ["file"],
          properties: {
            file: {
              type: "string",
              format: "binary",
              description: "Invoice file (PDF, max 50 KB)"
            }
          }
        },
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
