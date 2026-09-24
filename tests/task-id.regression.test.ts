import { describe, expect, it } from "vitest";
import { createStore } from "../src/store/memory-store.js";
import { createTask, deleteTask, listTasks, updateTaskStatus } from "../src/services/task-service.js";

// Regression for .scratch/inbox/issues/01-status-change-says-forbidden.md
// Root cause: task ids were `t${tasks.length + 1}`. After a delete, the next task reused the id
// of an existing task (possibly in another workspace), and lookups by id found the older one.
function seed() {
  return createStore({
    memberships: [
      { userId: "ann", workspaceId: "design", role: "lead" },
      { userId: "beam", workspaceId: "design", role: "member" },
      { userId: "beam", workspaceId: "finance", role: "member" },
      { userId: "dao", workspaceId: "finance", role: "lead" },
    ],
  });
}

describe("task ids after a delete", () => {
  it("a task created after a delete gets an id no other task has", () => {
    const store = seed();
    createTask(store, "ann", "design", { title: "A" });
    const b = createTask(store, "ann", "design", { title: "B" });
    createTask(store, "dao", "finance", { title: "Payroll" });

    deleteTask(store, "ann", b.id);
    createTask(store, "ann", "design", { title: "New" });

    const ids = store.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the reported symptom: the Lead can change the new task, and another workspace's task is untouched", () => {
    const store = seed();
    createTask(store, "ann", "design", { title: "Redesign login page" });
    const styleGuide = createTask(store, "ann", "design", { title: "Write style guide" });
    const payroll = createTask(store, "dao", "finance", { title: "Close Q3 payroll" });

    deleteTask(store, "ann", styleGuide.id);
    const demo = createTask(store, "ann", "design", { title: "Prepare demo" });
    updateTaskStatus(store, "ann", demo.id, "in_progress"); // used to throw ForbiddenError
    updateTaskStatus(store, "beam", demo.id, "done"); // used to change the Finance task

    expect(listTasks(store, "ann", "design").find((t) => t.title === "Prepare demo")?.status).toBe("done");
    expect(listTasks(store, "dao", "finance").find((t) => t.id === payroll.id)?.status).toBe("todo");
  });
});
