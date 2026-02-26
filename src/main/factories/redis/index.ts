import Redis from "ioredis";
import { env } from "@/infrastructure/config/env.config";
import { singleton } from "@/main/factories/singleton.util";

export const makeRedisClient = singleton(() => {
  const url = new URL(env.REDIS_URL);
  return new Redis({
    host: url.hostname,
    port: Number(url.port),
    password: env.REDIS_PASSWORD
  });
});
