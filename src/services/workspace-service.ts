import type { Role } from "../domain/types.js";
import type { Store } from "../store/memory-store.js";

export interface MemberView {
  id: string;
  name: string;
  role: Role;
}

/** The Members of a workspace, for the assignee picker. */
export function listMembers(store: Store, workspaceId: string): MemberView[] {
  return store.memberships
    .filter((m) => m.workspaceId === workspaceId)
    .map((m) => ({
      id: m.userId,
      name: store.users.find((u) => u.id === m.userId)?.name ?? m.userId,
      role: m.role,
    }));
}
