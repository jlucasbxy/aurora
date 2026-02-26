import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.ipv4().default("0.0.0.0"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  REDIS_PASSWORD: z.string(),
  ANTHROPIC_API_KEY: z.string()
});

export const env = envSchema.parse(process.env);
