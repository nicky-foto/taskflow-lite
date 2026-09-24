import type { Role } from "../domain/types.js";
import type { Store } from "../store/memory-store.js";
import { ForbiddenError } from "./errors.js";
import { membershipOf } from "./task-service.js";

export interface MemberView {
  id: string;
  name: string;
  role: Role;
}

/** The Members of a workspace, for the assignee picker. Only Members of that workspace may see them. */
export function listMembers(store: Store, actorId: string, workspaceId: string): MemberView[] {
  if (!membershipOf(store, actorId, workspaceId)) throw new ForbiddenError();
  return store.memberships
    .filter((m) => m.workspaceId === workspaceId)
    .map((m) => ({
      id: m.userId,
      name: store.users.find((u) => u.id === m.userId)?.name ?? m.userId,
      role: m.role,
    }));
}
