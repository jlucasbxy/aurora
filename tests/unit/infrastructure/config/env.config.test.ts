import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = process.env;

function setRequiredEnv(overrides: Record<string, string> = {}) {
  process.env = {
    ...ORIGINAL_ENV,
    HOST: "0.0.0.0",
    PORT: "3000",
    DATABASE_URL: "https://example.com/db",
    REDIS_URL: "https://example.com/redis",
    ANTHROPIC_API_KEY: "test-key",
    ...overrides
  };
}

describe("env.config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("forces ENABLE_SWAGGER=false in production", async () => {
    setRequiredEnv({ NODE_ENV: "production", ENABLE_SWAGGER: "true" });

    const { env } = await import("@/infrastructure/config/env.config");

    expect(env.NODE_ENV).toBe("production");
    expect(env.ENABLE_SWAGGER).toBe(false);
  });

  it("respects ENABLE_SWAGGER outside production", async () => {
    setRequiredEnv({ NODE_ENV: "development", ENABLE_SWAGGER: "true" });

    const { env } = await import("@/infrastructure/config/env.config");

    expect(env.NODE_ENV).toBe("development");
    expect(env.ENABLE_SWAGGER).toBe(true);
  });
});
