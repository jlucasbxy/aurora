import Redis from "ioredis";
import { env } from "@/infrastructure/config/env.config";
import { singleton } from "@/main/factories/singleton.util";

export const makeRedisClient = singleton(() => new Redis(env.REDIS_URL));
