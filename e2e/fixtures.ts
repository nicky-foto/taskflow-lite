import { test as base, expect } from "@playwright/test";

/**
 * Every test starts from the same seed data (see src/store/seed.ts),
 * so tests never depend on each other or on the order they run in.
 */
export const test = base.extend({
  page: async ({ page, request }, use) => {
    const res = await request.post("/api/test/reset");
    expect(res.status(), "reset endpoint (is TASKFLOW_TEST=1?)").toBe(204);
    await use(page);
  },
});

export { expect };
