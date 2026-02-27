import type { FastifyInstance } from "fastify";

export function registerHealthRoute(app: FastifyInstance) {
  app.get("/health", {
    schema: {
      tags: ["Health"],
      summary: "Healthcheck",
      operationId: "healthcheck",
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["ok"] }
          }
        }
      }
    },
    handler: async () => ({ status: "ok" })
  });
}
