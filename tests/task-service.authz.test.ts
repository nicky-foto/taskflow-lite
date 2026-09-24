import { describe, expect, it } from "vitest";
import { createStore } from "../src/store/memory-store.js";
import {
  createTask,
  deleteTask,
  ForbiddenError,
  listTasks,
  updateTaskStatus,
} from "../src/services/task-service.js";

// Written in Lab 6.3 (Break it on purpose): the original tests never proved that outsiders are rejected.
// Each test was checked by commenting out the membership check and watching it go red.
function seed() {
  const store = createStore({
    memberships: [
      { userId: "u1", workspaceId: "w1", role: "member" },
      { userId: "outsider", workspaceId: "w2", role: "lead" },
    ],
  });
  const task = createTask(store, "u1", "w1", { title: "private" });
  const activityBefore = store.activity.length;
  return { store, task, activityBefore };
}

describe("task-service authorization", () => {
  it("rejects a non-member creating a task, and nothing is written", () => {
    const { store, activityBefore } = seed();

    expect(() => createTask(store, "outsider", "w1", { title: "x" })).toThrow(ForbiddenError);
    expect(store.tasks).toHaveLength(1);
    expect(store.activity).toHaveLength(activityBefore);
  });

  it("rejects a non-member listing another workspace's tasks", () => {
    const { store } = seed();
    expect(() => listTasks(store, "outsider", "w1")).toThrow(ForbiddenError);
  });

  it("rejects a non-member changing status, and nothing changes", () => {
    const { store, task, activityBefore } = seed();

    expect(() => updateTaskStatus(store, "outsider", task.id, "done")).toThrow(ForbiddenError);
    expect(store.tasks[0].status).toBe("todo");
    expect(store.activity).toHaveLength(activityBefore);
  });

  it("rejects a non-member deleting a task, and nothing changes", () => {
    const { store, task, activityBefore } = seed();

    expect(() => deleteTask(store, "outsider", task.id)).toThrow(ForbiddenError);
    expect(store.tasks).toHaveLength(1);
    expect(store.activity).toHaveLength(activityBefore);
  });
});
