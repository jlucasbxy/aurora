import type { FastifyInstance, FastifyRequest } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { DashboardController } from "@/infrastructure/http/controllers";

type DashboardParams = { Params: { clientNumber: string } };

export function registerDashboardRoutes(
  app: FastifyInstance,
  controller: DashboardController
) {
  app.get<DashboardParams>(
    `${ROUTE_PREFIXES.DASHBOARD}/:clientNumber/energy`,
    { config: { rateLimit: RATE_LIMITS.DASHBOARD } },
    (req: FastifyRequest<DashboardParams>, reply) => controller.energy(req, reply)
  );

  app.get<DashboardParams>(
    `${ROUTE_PREFIXES.DASHBOARD}/:clientNumber/financial`,
    { config: { rateLimit: RATE_LIMITS.DASHBOARD } },
    (req: FastifyRequest<DashboardParams>, reply) => controller.financial(req, reply)
  );
}
