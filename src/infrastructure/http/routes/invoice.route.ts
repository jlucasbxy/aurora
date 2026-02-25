import type { FastifyInstance } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { InvoiceController } from "@/infrastructure/http/controllers";

export function registerInvoiceRoutes(
  app: FastifyInstance,
  controller: InvoiceController
) {
  app.get(
    `${ROUTE_PREFIXES.INVOICES}`,
    { config: { rateLimit: RATE_LIMITS.INVOICE_LIST } },
    (req, reply) => controller.list(req, reply)
  );

  app.post(
    `${ROUTE_PREFIXES.INVOICES}/upload`,
    { config: { rateLimit: RATE_LIMITS.INVOICE_UPLOAD } },
    (req, reply) => controller.upload(req, reply)
  );
}
