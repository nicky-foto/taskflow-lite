export type Role = "member" | "lead" | "admin";
export type Status = "todo" | "in_progress" | "done";

export const STATUSES: readonly Status[] = ["todo", "in_progress", "done"];

export interface User {
  id: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Membership {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  status: Status;
  assigneeId: string | null;
  createdBy: string;
}

export interface ActivityEntry {
  at: string;
  actorId: string;
  workspaceId: string;
  action: string;
  taskId: string;
  /** Extra facts about the change, e.g. { status: "done" } */
  meta?: Record<string, string | null>;
}
