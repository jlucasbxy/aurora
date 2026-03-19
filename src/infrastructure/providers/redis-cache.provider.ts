import type { Redis } from "ioredis";
import type { CacheProvider } from "@/application/interfaces/providers";

const TAG_KEY_PREFIX = "cache-tag:";

function buildTagKey(tag: string): string {
  return `${TAG_KEY_PREFIX}${tag}`;
}

export class RedisCacheProvider implements CacheProvider {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(
    key: string,
    value: string,
    expiresInSeconds?: number
  ): Promise<void> {
    if (expiresInSeconds == null) {
      await this.redis.set(key, value);
      return;
    }

    const results = await this.redis
      .multi()
      .set(key, value)
      .expire(key, expiresInSeconds)
      .exec();

    if (!results) {
      throw new Error("Redis transaction returned no results");
    }

    for (const [error] of results) {
      if (error) throw error;
    }
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
