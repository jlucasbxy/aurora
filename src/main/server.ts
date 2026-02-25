import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { env } from "@/infrastructure/config/env.config";
import { errorHandler } from "@/infrastructure/http/middlewares";
import {
  registerDashboardRoutes,
  registerInvoiceRoutes
} from "@/infrastructure/http/routes";
import {
  makeDashboardController,
  makeInvoiceController
} from "@/main/factories/controllers";
import { makeRedisClient } from "@/main/factories/redis";

export async function start() {
  const isDev = process.env.NODE_ENV !== "production";
  const app = Fastify({
    logger: isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" }
          }
        }
      : true,
    bodyLimit: 50 * 1024 // 50 KB
  });

  app.setErrorHandler(errorHandler);

  await app.register(fastifyRateLimit, {
    redis: makeRedisClient(),
    nameSpace: "rl:",
    errorResponseBuilder: (_req, ctx) => ({
      code: "RATE_LIMIT_EXCEEDED",
      message: `Too many requests. Retry in ${ctx.after}.`,
    }),
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 // 50 KB per file
    }
  });

  await app.register(
    async (api) => {
      registerInvoiceRoutes(api, makeInvoiceController());
      registerDashboardRoutes(api, makeDashboardController());
    },
    { prefix: "/api/v1" }
  );

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
