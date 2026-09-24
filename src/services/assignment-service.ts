import type { Role, Task } from "../domain/types.js";
import type { Store } from "../store/memory-store.js";
import { logActivity } from "./activity.js";
import { ForbiddenError, NotFoundError, ValidationError } from "./errors.js";
import { membershipOf } from "./task-service.js";

const CAN_ASSIGN: ReadonlySet<Role> = new Set(["lead", "admin"]);

/** Only a Lead or Admin of the task's workspace may change its Assignee. */
function assertCanAssign(store: Store, actorId: string, workspaceId: string): void {
  const actor = membershipOf(store, actorId, workspaceId);
  if (!actor || !CAN_ASSIGN.has(actor.role)) throw new ForbiddenError();
}

/** Assign a task to a Member of the task's workspace. Lead or Admin only. */
export function assignTask(store: Store, actorId: string, taskId: string, assigneeId: string): Task {
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundError("task");

  assertCanAssign(store, actorId, task.workspaceId);

  if (!membershipOf(store, assigneeId, task.workspaceId)) {
    throw new ValidationError("assignee must be a member of the task's workspace");
  }

  const previousAssigneeId = task.assigneeId;
  task.assigneeId = assigneeId;
  logActivity(store, {
    actorId,
    workspaceId: task.workspaceId,
    action: "task.assigned",
    taskId: task.id,
    meta: { assigneeId, previousAssigneeId },
  });
  return task;
}

/** Clear the Assignee of a task. Lead or Admin only. */
export function unassignTask(store: Store, actorId: string, taskId: string): Task {
  const task = store.tasks.find((t) => t.id === taskId);
  if (!task) throw new NotFoundError("task");

  assertCanAssign(store, actorId, task.workspaceId);

  const previousAssigneeId = task.assigneeId;
  task.assigneeId = null;
  logActivity(store, {
    actorId,
    workspaceId: task.workspaceId,
    action: "task.unassigned",
    taskId: task.id,
    meta: { previousAssigneeId },
  });
  return task;
}

/** My tasks: tasks in this workspace whose Assignee is the actor. */
export function listMyTasks(store: Store, actorId: string, workspaceId: string): Task[] {
  if (!membershipOf(store, actorId, workspaceId)) throw new ForbiddenError();
  return store.tasks.filter((t) => t.workspaceId === workspaceId && t.assigneeId === actorId);
}
