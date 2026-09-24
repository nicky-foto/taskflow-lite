import { expect, test } from "./fixtures.js";

// Smoke test: proves the app starts and Playwright is wired up.
// Real user journeys are written in Lab 8.
test("the app loads with Ann's Design tasks", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Acting as")).toHaveValue("ann");
  await expect(page.getByLabel("Workspace")).toHaveValue("design");
  await expect(page.getByRole("list", { name: "Tasks" }).getByRole("listitem")).toHaveCount(3);
});

test("a member can add a task", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("New task").fill("Prepare demo");
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(page.getByRole("listitem").filter({ hasText: "Prepare demo" })).toBeVisible();
});
