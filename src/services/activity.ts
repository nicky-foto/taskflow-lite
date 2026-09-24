import type { Store } from "../store/memory-store.js";

/** Every mutation MUST call this. See AGENTS.md. */
export function logActivity(
  store: Store,
  entry: {
    actorId: string;
    workspaceId: string;
    action: string;
    taskId: string;
    meta?: Record<string, string | null>;
  },
): void {
  store.activity.push({ at: new Date().toISOString(), ...entry });
}
