import { STATUSES, type Membership, type Status, type Task } from "../domain/types.js";
import type { Store } from "../store/memory-store.js";
import { logActivity } from "./activity.js";
import { ForbiddenError, NotFoundError, ValidationError } from "./errors.js";

export { ForbiddenError, NotFoundError, ValidationError };

/** The membership of a user in a workspace, or undefined if they are not a member. */
export function membershipOf(store: Store, userId: string, workspaceId: string): Membership | undefined {
  return store.memberships.find((m) => m.userId === userId && m.workspaceId === workspaceId);
}

function assertMember(store: Store, userId: string, workspaceId: string): void {
  const ok = store.memberships.some(
    (m) => m.userId === userId && m.workspaceId === workspaceId,
  );
  if (!ok) throw new ForbiddenError();
}

/** Find a task the actor is allowed to see. Unknown task -> NotFoundError. */
export function findTaskFor(store: Store, actorId: string, taskId: string): Task {
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundError("task");
  assertMember(store, actorId, task.workspaceId);
  return task;
}

export function createTask(
  store: Store,
  actorId: string,
  workspaceId: string,
  input: { title: string },
): Task {
  assertMember(store, actorId, workspaceId);
  const title = input.title.trim();
  if (title === "") throw new ValidationError("title must not be empty");

  const task: Task = {
    id: `t${store.nextTaskNumber++}`,
    workspaceId,
    title,
    status: "todo",
    assigneeId: null,
    createdBy: actorId,
  };
  store.tasks.push(task);
  logActivity(store, { actorId, workspaceId, action: "task.created", taskId: task.id });
  return task;
}

export function listTasks(store: Store, actorId: string, workspaceId: string): Task[] {
  assertMember(store, actorId, workspaceId);
  return store.tasks.filter((t) => t.workspaceId === workspaceId);
}

export function updateTaskStatus(store: Store, actorId: string, taskId: string, status: Status): Task {
  if (!STATUSES.includes(status)) throw new ValidationError(`unknown status: ${status}`);
  const task = findTaskFor(store, actorId, taskId);

  const previousStatus = task.status;
  task.status = status;
  logActivity(store, {
    actorId,
    workspaceId: task.workspaceId,
    action: "task.status_changed",
    taskId: task.id,
    meta: { status, previousStatus },
  });
  return task;
}

export function deleteTask(store: Store, actorId: string, taskId: string): void {
  const task = findTaskFor(store, actorId, taskId);

  store.tasks.splice(store.tasks.indexOf(task), 1);
  logActivity(store, {
    actorId,
    workspaceId: task.workspaceId,
    action: "task.deleted",
    taskId: task.id,
    meta: { title: task.title },
  });
}
