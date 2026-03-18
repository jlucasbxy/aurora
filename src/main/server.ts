import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { env } from "@/infrastructure/config/env.config";
import { registerSwagger } from "@/infrastructure/http/docs";
import { errorHandler } from "@/infrastructure/http/middlewares";
import {
  registerDashboardRoutes,
  registerHealthRoute,
  registerInvoiceRoutes
} from "@/infrastructure/http/routes";
import {
  makeDashboardController,
  makeInvoiceController
} from "@/main/factories/controllers";
import { makeRedisClient } from "@/main/factories/redis";

export async function start() {
  const isDev = env.NODE_ENV !== "production";
  const app = Fastify({
    logger: isDev
      ? {
          transport: {
            target: "pino-pretty",
            options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" }
          }
        }
      : true,
    bodyLimit: 1_048_576
  });

  app.setErrorHandler(errorHandler);

  await app.register(fastifyHelmet);
  await app.register(fastifyCors, { origin: false });

  await app.register(fastifyRateLimit, {
    redis: makeRedisClient(),
    nameSpace: "rl:",
    errorResponseBuilder: (_req, ctx) => ({
      code: "RATE_LIMIT_EXCEEDED",
      message: `Too many requests. Retry in ${ctx.after}.`
    })
  });

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE_KB * 1024
    }
  });

  await registerSwagger(app, {
    enabled: env.ENABLE_SWAGGER,
    title: "Aurora Energia API",
    version: "1.0.0",
    description: "API for energy invoice upload, listing, and dashboards."
  });

  registerHealthRoute(app);

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
