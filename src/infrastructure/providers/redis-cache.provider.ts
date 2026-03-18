import type { Redis } from "ioredis";
import type { CacheProvider } from "@/application/interfaces/providers";

const TAG_KEY_PREFIX = "cache-tag:";

function buildTagKey(tag: string): string {
  return `${TAG_KEY_PREFIX}${tag}`;
}

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

  async addTags(
    key: string,
    tags: string[],
    expiresInSeconds?: number
  ): Promise<void> {
    if (tags.length === 0) return;

    const pipeline = this.redis.multi();
    for (const tag of tags) {
      const tagKey = buildTagKey(tag);
      pipeline.sadd(tagKey, key);
      if (expiresInSeconds != null) {
        pipeline.expire(tagKey, expiresInSeconds);
      }
    }

    const results = await pipeline.exec();
    if (!results) {
      throw new Error("Redis transaction returned no results");
    }

    for (const [error] of results) {
      if (error) throw error;
    }
  }

  async deleteByTag(tag: string): Promise<void> {
    const tagKey = buildTagKey(tag);
    const keys = await this.redis.smembers(tagKey);

    if (keys.length > 0) {
      await this.redis.unlink(...keys);
    }

    await this.redis.unlink(tagKey);
  }
}
