import { describe, expect, it } from "vitest";
import { createStore } from "../src/store/memory-store.js";
import {
  createTask,
  deleteTask,
  listTasks,
  NotFoundError,
  updateTaskStatus,
  ValidationError,
} from "../src/services/task-service.js";

// NOTE (for the instructor): these tests cover the happy path only.
// There is deliberately NO test for "a non-member is rejected" by createTask.
// Lab 6.3 (Break it on purpose) asks learners to find out what that costs.

function seed() {
  return createStore({
    users: [{ id: "u1", name: "Aom" }],
    workspaces: [{ id: "w1", name: "Team" }],
    memberships: [{ userId: "u1", workspaceId: "w1", role: "lead" }],
  });
}

describe("task-service", () => {
  it("creates a task in todo status", () => {
    const store = seed();
    const task = createTask(store, "u1", "w1", { title: "Write spec" });
    expect(task.status).toBe("todo");
    expect(task.workspaceId).toBe("w1");
    expect(task.assigneeId).toBeNull();
  });

  it("rejects an empty title", () => {
    const store = seed();
    expect(() => createTask(store, "u1", "w1", { title: "   " })).toThrow(ValidationError);
  });

  it("lists tasks of the workspace", () => {
    const store = seed();
    createTask(store, "u1", "w1", { title: "A" });
    createTask(store, "u1", "w1", { title: "B" });
    expect(listTasks(store, "u1", "w1").map((t) => t.title)).toEqual(["A", "B"]);
  });

  it("records activity when a task is created", () => {
    const store = seed();
    createTask(store, "u1", "w1", { title: "A" });
    expect(store.activity).toHaveLength(1);
    expect(store.activity[0].action).toBe("task.created");
  });

  it("changes the status of a task and records it", () => {
    const store = seed();
    const task = createTask(store, "u1", "w1", { title: "A" });

    updateTaskStatus(store, "u1", task.id, "done");

    expect(listTasks(store, "u1", "w1")[0].status).toBe("done");
    expect(store.activity.at(-1)).toMatchObject({
      action: "task.status_changed",
      meta: { status: "done", previousStatus: "todo" },
    });
  });

  it("rejects an unknown status", () => {
    const store = seed();
    const task = createTask(store, "u1", "w1", { title: "A" });
    // @ts-expect-error: simulating bad input from the HTTP layer
    expect(() => updateTaskStatus(store, "u1", task.id, "archived")).toThrow(ValidationError);
  });

  it("deletes a task and records it", () => {
    const store = seed();
    const a = createTask(store, "u1", "w1", { title: "A" });
    createTask(store, "u1", "w1", { title: "B" });

    deleteTask(store, "u1", a.id);

    expect(listTasks(store, "u1", "w1").map((t) => t.title)).toEqual(["B"]);
    expect(store.activity.at(-1)?.action).toBe("task.deleted");
  });

  it("an unknown task id is NotFoundError", () => {
    const store = seed();
    expect(() => updateTaskStatus(store, "u1", "nope", "done")).toThrow(NotFoundError);
    expect(() => deleteTask(store, "u1", "nope")).toThrow(NotFoundError);
  });
});
