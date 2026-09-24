import type { ActivityEntry, Membership, Task, User, Workspace } from "../domain/types.js";

/** In-memory store. No database on purpose: the workshop is about the agent, not the stack. */
export interface Store {
  users: User[];
  workspaces: Workspace[];
  memberships: Membership[];
  tasks: Task[];
  activity: ActivityEntry[];
  /** Next number for a task id. Only ever goes up, so an id is never reused (see ADR-0003). */
  nextTaskNumber: number;
}

export function createStore(seed: Partial<Store> = {}): Store {
  return {
    users: seed.users ?? [],
    workspaces: seed.workspaces ?? [],
    memberships: seed.memberships ?? [],
    tasks: seed.tasks ?? [],
    activity: seed.activity ?? [],
    nextTaskNumber: seed.nextTaskNumber ?? 1,
  };
}
