import type { FastifyInstance } from "fastify";
import type { InvoiceController } from "@/infrastructure/http/controllers";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";

export function registerInvoiceRoutes(
  app: FastifyInstance,
  controller: InvoiceController
) {
  app.post(`${ROUTE_PREFIXES.INVOICES}/upload`, (req, reply) =>
    controller.upload(req, reply)
  );
}
