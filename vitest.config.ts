import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

process.env.NODE_ENV ??= "test";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"]
  }
});
