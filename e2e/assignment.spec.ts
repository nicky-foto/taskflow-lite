import { expect, test } from "./fixtures.js";

// User journeys for .scratch/task-assignment. Written AFTER the behaviour worked (AGENTS.md).
// The rules themselves (who may assign, outsiders rejected, Activity) are proven at the service
// and HTTP seams; these tests prove the pieces are wired together in a real browser.

test("a Lead assigns a task and the Member finds it in My tasks", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Assignee of Redesign login page").selectOption({ label: "Beam" });
  await expect(page.getByLabel("Assignee of Redesign login page")).toHaveValue("beam");

  await page.getByLabel("Acting as").selectOption({ label: "Beam" });
  await page.getByLabel("My tasks").check();

  const tasks = page.getByRole("list", { name: "Tasks" }).getByRole("listitem");
  await expect(tasks).toHaveCount(1);
  await expect(tasks.first()).toContainText("Redesign login page");
});

test("a plain Member sees who is assigned but cannot change it", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Assignee of Write style guide").selectOption({ label: "Chai" });

  await page.getByLabel("Acting as").selectOption({ label: "Beam" });

  const row = page.getByRole("listitem").filter({ hasText: "Write style guide" });
  await expect(row).toContainText("Assignee: Chai");
  await expect(page.getByLabel("Assignee of Write style guide")).toHaveCount(0);
});

test("a Lead unassigns and the task leaves the Member's My tasks", async ({ page }) => {
  await page.goto("/");
  const picker = page.getByLabel("Assignee of Export icon set");
  await picker.selectOption({ label: "Chai" });
  await expect(picker).toHaveValue("chai");

  await picker.selectOption({ label: "Unassigned" });
  await expect(picker).toHaveValue("");

  await page.getByLabel("Acting as").selectOption({ label: "Chai" });
  await page.getByLabel("My tasks").check();
  await expect(page.getByText("No tasks yet.")).toBeVisible();
});

test("My tasks never shows another workspace's tasks", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Assignee of Redesign login page").selectOption({ label: "Beam" });
  await expect(page.getByLabel("Assignee of Redesign login page")).toHaveValue("beam");

  await page.getByLabel("Acting as").selectOption({ label: "Beam" });
  await page.getByLabel("Workspace").selectOption({ label: "Finance" });
  await page.getByLabel("My tasks").check();

  await expect(page.getByText("No tasks yet.")).toBeVisible();
});
