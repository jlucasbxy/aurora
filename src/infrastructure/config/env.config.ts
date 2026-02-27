import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.ipv4().default("0.0.0.0"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ANTHROPIC_API_KEY: z.string(),
  ENABLE_SWAGGER: z.coerce.boolean().default(false)
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  ENABLE_SWAGGER:
    parsedEnv.NODE_ENV === "development" ? false : parsedEnv.ENABLE_SWAGGER
};
