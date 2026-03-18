export interface CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expiresInSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<void>;
  addTags(
    key: string,
    tags: string[],
    expiresInSeconds?: number
  ): Promise<void>;
  deleteByTag(tag: string): Promise<void>;
}
