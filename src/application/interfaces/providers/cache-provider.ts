export interface CacheProvider {
  hget(key: string, field: string): Promise<string | null>;
  hset(
    key: string,
    field: string,
    value: string,
    expiresInSeconds?: number
  ): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<void>;
}
