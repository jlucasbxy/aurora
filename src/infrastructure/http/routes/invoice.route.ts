import type { FastifyInstance } from "fastify";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { InvoiceController } from "@/infrastructure/http/controllers";

export function registerInvoiceRoutes(
  app: FastifyInstance,
  controller: InvoiceController
) {
  app.get(`${ROUTE_PREFIXES.INVOICES}`, (req, reply) =>
    controller.list(req, reply)
  );

  app.post(`${ROUTE_PREFIXES.INVOICES}/upload`, (req, reply) =>
    controller.upload(req, reply)
  );
}
