import { describe, expect, it } from "vitest";
import { createStore } from "../src/store/memory-store.js";
import { createTask, ForbiddenError, NotFoundError, ValidationError } from "../src/services/task-service.js";
import { assignTask, listMyTasks, unassignTask } from "../src/services/assignment-service.js";

// Service seam for .scratch/task-assignment (tickets 01-04).
function seed() {
  const store = createStore({
    memberships: [
      { userId: "lead1", workspaceId: "w1", role: "lead" },
      { userId: "admin1", workspaceId: "w1", role: "admin" },
      { userId: "mem1", workspaceId: "w1", role: "member" },
      { userId: "mem2", workspaceId: "w1", role: "member" },
      { userId: "mem1", workspaceId: "w2", role: "member" },
      { userId: "outsider", workspaceId: "w2", role: "lead" },
    ],
  });
  const task = createTask(store, "lead1", "w1", { title: "Write spec" });
  const other = createTask(store, "outsider", "w2", { title: "Other team's task" });
  store.activity.length = 0; // only look at activity produced by assignment
  return { store, task, other };
}

const assigneeOf = (store: ReturnType<typeof seed>["store"], id: string) =>
  store.tasks.find((t) => t.id === id)?.assigneeId;

describe("assignTask (01)", () => {
  it("a Lead assigns a task to a Member of the same workspace", () => {
    const { store, task } = seed();

    const updated = assignTask(store, "lead1", task.id, "mem1");

    expect(updated.assigneeId).toBe("mem1");
    expect(assigneeOf(store, task.id)).toBe("mem1");
    expect(store.activity).toEqual([
      expect.objectContaining({
        actorId: "lead1",
        workspaceId: "w1",
        action: "task.assigned",
        taskId: task.id,
        meta: { assigneeId: "mem1", previousAssigneeId: null },
      }),
    ]);
  });

  it("re-assigning records the previous Assignee", () => {
    const { store, task } = seed();
    assignTask(store, "lead1", task.id, "mem1");

    assignTask(store, "lead1", task.id, "mem2");

    expect(store.activity.at(-1)?.meta).toEqual({ assigneeId: "mem2", previousAssigneeId: "mem1" });
  });

  it("an Admin can assign like a Lead", () => {
    const { store, task } = seed();
    expect(assignTask(store, "admin1", task.id, "mem2").assigneeId).toBe("mem2");
  });

  it("a plain Member is refused, and nothing changes", () => {
    const { store, task } = seed();

    expect(() => assignTask(store, "mem1", task.id, "mem2")).toThrow(ForbiddenError);
    expect(assigneeOf(store, task.id)).toBeNull();
    expect(store.activity).toHaveLength(0);
  });

  it("a Lead of another workspace is refused, and nothing changes", () => {
    const { store, task } = seed();

    expect(() => assignTask(store, "outsider", task.id, "mem1")).toThrow(ForbiddenError);
    expect(assigneeOf(store, task.id)).toBeNull();
    expect(store.activity).toHaveLength(0);
  });

  it("an unknown task is NotFoundError", () => {
    const { store } = seed();
    expect(() => assignTask(store, "lead1", "nope", "mem1")).toThrow(NotFoundError);
  });
});

describe("assignee outside the workspace (02)", () => {
  it("is a ValidationError, and nothing changes", () => {
    const { store, task } = seed();

    expect(() => assignTask(store, "lead1", task.id, "outsider")).toThrow(ValidationError);
    expect(assigneeOf(store, task.id)).toBeNull();
    expect(store.activity).toHaveLength(0);
  });
});

describe("unassignTask (03)", () => {
  it("a Lead clears the Assignee and it is recorded", () => {
    const { store, task } = seed();
    assignTask(store, "lead1", task.id, "mem1");

    const updated = unassignTask(store, "lead1", task.id);

    expect(updated.assigneeId).toBeNull();
    expect(store.activity.at(-1)).toMatchObject({
      action: "task.unassigned",
      meta: { previousAssigneeId: "mem1" },
    });
  });

  it("a plain Member is refused, and nothing changes", () => {
    const { store, task } = seed();
    assignTask(store, "lead1", task.id, "mem1");

    expect(() => unassignTask(store, "mem2", task.id)).toThrow(ForbiddenError);
    expect(assigneeOf(store, task.id)).toBe("mem1");
    expect(store.activity).toHaveLength(1);
  });
});

describe("listMyTasks (04)", () => {
  it("returns only this workspace's tasks assigned to the actor", () => {
    const { store, task, other } = seed();
    const unassigned = createTask(store, "lead1", "w1", { title: "Nobody's" });
    assignTask(store, "lead1", task.id, "mem1");
    assignTask(store, "outsider", other.id, "mem1"); // mem1 is also in w2

    expect(listMyTasks(store, "mem1", "w1").map((t) => t.id)).toEqual([task.id]);
    expect(listMyTasks(store, "mem1", "w2").map((t) => t.id)).toEqual([other.id]);
    expect(listMyTasks(store, "mem1", "w1")).not.toContainEqual(expect.objectContaining({ id: unassigned.id }));
  });

  it("a non-member is refused", () => {
    const { store } = seed();
    expect(() => listMyTasks(store, "outsider", "w1")).toThrow(ForbiddenError);
  });
});
