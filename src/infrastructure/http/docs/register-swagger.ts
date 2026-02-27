import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { registerApiSchemas } from "@/infrastructure/http/docs/schemas/register-api-schemas";

type RegisterSwaggerOptions = {
  enabled: boolean;
  title: string;
  version: string;
  description?: string;
};

export async function registerSwagger(
  app: FastifyInstance,
  options: RegisterSwaggerOptions
) {
  registerApiSchemas(app);

  if (!options.enabled) {
    return;
  }

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: options.title,
        version: options.version,
        description: options.description
      }
    }
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    staticCSP: true,
    transformSpecificationClone: true
  });
}
