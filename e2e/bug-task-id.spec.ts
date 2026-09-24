import { expect, test } from "./fixtures.js";

// Journey-level regression for .scratch/inbox/issues/01 (the unit-level one is tests/task-id.regression.test.ts).
test("after deleting a task, a new task can be moved on and nothing else changes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Delete Write style guide" }).click();
  await expect(page.getByText("Write style guide")).toHaveCount(0);

  await page.getByLabel("New task").fill("Prepare demo");
  await page.getByRole("button", { name: "Add task" }).click();
  await page.getByLabel("Status of Prepare demo").selectOption("in_progress");

  await expect(page.getByRole("alert")).toBeHidden();
  await expect(page.getByLabel("Status of Prepare demo")).toHaveValue("in_progress");

  // The other workspace's task must be untouched.
  await page.getByLabel("Acting as").selectOption({ label: "Dao" });
  await expect(page.getByLabel("Status of Close Q3 payroll")).toHaveValue("todo");
});
