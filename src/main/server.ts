import Fastify from "fastify";
import { env } from "@/infrastructure/config/env.config";
import { errorHandler } from "@/infrastructure/http/middlewares";

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
      : true
  });

  app.setErrorHandler(errorHandler);

  await app.register(async (_api) => {}, { prefix: "/api/v1" });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
