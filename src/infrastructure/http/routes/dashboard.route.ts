import type { FastifyInstance } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { DashboardController } from "@/infrastructure/http/controllers";

export function registerDashboardRoutes(
  app: FastifyInstance,
  controller: DashboardController
) {
  app.get(
    `${ROUTE_PREFIXES.DASHBOARD}/energy`,
    { config: { rateLimit: RATE_LIMITS.DASHBOARD } },
    (req, reply) => controller.energy(req, reply)
  );

  app.get(
    `${ROUTE_PREFIXES.DASHBOARD}/financial`,
    { config: { rateLimit: RATE_LIMITS.DASHBOARD } },
    (req, reply) => controller.financial(req, reply)
  );
}
