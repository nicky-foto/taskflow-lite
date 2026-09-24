import { defineConfig } from "vitest/config";

// Vitest runs the fast tests only. Browser tests live in e2e/ and run with `npm run e2e`.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
