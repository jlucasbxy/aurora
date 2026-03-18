import type { Redis } from "ioredis";
import type { CacheProvider } from "@/application/interfaces/providers";

export class RedisCacheProvider implements CacheProvider {
  constructor(private readonly redis: Redis) {}

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hset(
    key: string,
    field: string,
    value: string,
    expiresInSeconds?: number
  ): Promise<void> {
    if (expiresInSeconds == null) {
      await this.redis.hset(key, field, value);
      return;
    }

    const results = await this.redis
      .multi()
      .hset(key, field, value)
      .expire(key, expiresInSeconds)
      .exec();

    if (!results) {
      throw new Error("Redis transaction returned no results");
    }

    for (const [error] of results) {
      if (error) throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.unlink(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    let cursor = "0";
    const pattern = `${prefix}*`;
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redis.unlink(...keys);
      }
    } while (cursor !== "0");
  }
}
