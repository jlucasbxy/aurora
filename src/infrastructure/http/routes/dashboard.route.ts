import type { FastifyInstance, FastifyRequest, FastifySchema } from "fastify";
import { RATE_LIMITS } from "@/infrastructure/config/rate-limit.config";
import { ROUTE_PREFIXES } from "@/infrastructure/config/routes.config";
import type { DashboardController } from "@/infrastructure/http/controllers";

type DashboardParams = { Params: { clientNumber: string } };

const CLIENT_NUMBER_PATTERN = "^\\d{10}$";
const REFERENCE_MONTH_PATTERN =
  "^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\\/\\d{4}$";

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
        params: {
          type: "object",
          required: ["clientNumber"],
          properties: {
            clientNumber: {
              type: "string",
              pattern: CLIENT_NUMBER_PATTERN,
              description: "Client number with exactly 10 digits"
            }
          }
        },
        querystring: {
          type: "object",
          properties: {
            dateStart: {
              type: "string",
              pattern: REFERENCE_MONTH_PATTERN
            },
            dateEnd: {
              type: "string",
              pattern: REFERENCE_MONTH_PATTERN
            }
          }
        },
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
        params: {
          type: "object",
          required: ["clientNumber"],
          properties: {
            clientNumber: {
              type: "string",
              pattern: CLIENT_NUMBER_PATTERN,
              description: "Client number with exactly 10 digits"
            }
          }
        },
        querystring: {
          type: "object",
          properties: {
            dateStart: {
              type: "string",
              pattern: REFERENCE_MONTH_PATTERN
            },
            dateEnd: {
              type: "string",
              pattern: REFERENCE_MONTH_PATTERN
            }
          }
        },
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
