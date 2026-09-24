import { createTask } from "../services/task-service.js";
import { createStore, type Store } from "./memory-store.js";

/**
 * Demo data used by `npm run dev` and the Playwright tests.
 *
 *   Design workspace:  Ann (lead), Beam (member), Chai (member)
 *   Finance workspace: Dao (lead), Beam (member)
 *
 * Beam belongs to BOTH workspaces on purpose.
 */
export function seedStore(): Store {
  const store = createStore({
    users: [
      { id: "ann", name: "Ann" },
      { id: "beam", name: "Beam" },
      { id: "chai", name: "Chai" },
      { id: "dao", name: "Dao" },
    ],
    workspaces: [
      { id: "design", name: "Design" },
      { id: "finance", name: "Finance" },
    ],
    memberships: [
      { userId: "ann", workspaceId: "design", role: "lead" },
      { userId: "beam", workspaceId: "design", role: "member" },
      { userId: "chai", workspaceId: "design", role: "member" },
      { userId: "dao", workspaceId: "finance", role: "lead" },
      { userId: "beam", workspaceId: "finance", role: "member" },
    ],
  });

  createTask(store, "ann", "design", { title: "Redesign login page" });
  createTask(store, "ann", "design", { title: "Write style guide" });
  createTask(store, "chai", "design", { title: "Export icon set" });
  createTask(store, "dao", "finance", { title: "Close Q3 payroll" });
  return store;
}
