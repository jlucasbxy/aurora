import type { FastifyInstance, FastifyRequest, FastifySchema } from "fastify";
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
    {
      config: { rateLimit: RATE_LIMITS.DASHBOARD },
      schema: {
        tags: ["Dashboard"],
        summary: "Get energy dashboard",
        operationId: "getDashboardEnergy",
        response: {
          200: { $ref: "DashboardEnergy#" },
          400: { $ref: "ErrorResponse#" },
          404: { $ref: "ErrorResponse#" },
          429: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" }
        }
      } as FastifySchema
    },
    (req: FastifyRequest<DashboardParams>, reply) =>
      controller.energy(req, reply)
  );

  app.get<DashboardParams>(
    `${ROUTE_PREFIXES.DASHBOARD}/:clientNumber/financial`,
    {
      config: { rateLimit: RATE_LIMITS.DASHBOARD },
      schema: {
        tags: ["Dashboard"],
        summary: "Get financial dashboard",
        operationId: "getDashboardFinancial",
        response: {
          200: { $ref: "DashboardFinancial#" },
          400: { $ref: "ErrorResponse#" },
          404: { $ref: "ErrorResponse#" },
          429: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" }
        }
      } as FastifySchema
    },
    (req: FastifyRequest<DashboardParams>, reply) =>
      controller.financial(req, reply)
  );
}
