import type { FastifyInstance } from "fastify";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { DashboardController } from "@/infrastructure/http/controllers";

export function registerDashboardRoutes(
  app: FastifyInstance,
  controller: DashboardController
) {
  app.get(`${ROUTE_PREFIXES.DASHBOARD}/energy`, (req, reply) =>
    controller.energy(req, reply)
  );

  app.get(`${ROUTE_PREFIXES.DASHBOARD}/financial`, (req, reply) =>
    controller.financial(req, reply)
  );
}
