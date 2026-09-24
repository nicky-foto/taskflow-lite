# Spec: Task assignment

**Status:** ready-for-agent

## Problem Statement

A Lead has no way to say who is responsible for a task. Tasks pile up on the board and the team
asks in chat "who is doing this?". Members cannot see what they personally owe the team, and nobody
can tell afterwards who handed which task to whom.

## Solution

A Lead (or Admin) picks an Assignee for any task in their workspace, straight from the task list.
The Assignee must be a Member of that workspace. A Lead can also clear the Assignee. Every Member
can switch the list to My tasks to see only the tasks assigned to them in the current workspace.
Every Assignment and Unassignment is recorded as Activity.

## User Stories

1. As a Lead, I want to assign a task to a Member of my workspace, so that it is clear who is responsible.
2. As a Lead, I want to re-assign a task to a different Member, so that I can rebalance work.
3. As a Lead, I want to clear the Assignee of a task, so that it goes back to the unowned pool.
4. As an Admin, I want every permission a Lead has for Assignment, so that I can cover for a Lead.
5. As a Member, I want to see the Assignee of every task in the list, so that I know whom to ask.
6. As a Member, I want to switch to My tasks, so that I see only what I am responsible for.
7. As a Member of two workspaces, I want My tasks to show only the current workspace, so that teams' work stays separate.
8. As a plain Member, I must not be able to assign tasks, so that responsibility is decided by the Lead.
9. As a Lead of another workspace, I must not be able to assign tasks here, so that workspaces stay isolated.
10. As a Lead, I must not be able to assign a task to someone outside the workspace, so that tasks never leak to another team.
11. As a Lead, I want a clear error when an Assignment is rejected, so that I know why nothing changed.
12. As anyone reviewing history, I want each Assignment recorded with the actor, the new Assignee and the previous one, so that I can reconstruct what happened.
13. As anyone reviewing history, I want each Unassignment recorded, so that "nobody owns this" has a known cause.

## Implementation Decisions

- A new assignment service module owns the rules. The HTTP layer and the UI hold no rules (AGENTS.md).
- Interface of the assignment service:
  - `assignTask(store, actorId, taskId, assigneeId): Task`
  - `unassignTask(store, actorId, taskId): Task`
  - `listMyTasks(store, actorId, workspaceId): Task[]`
- Rules, in the order they are checked:
  1. Unknown task → `NotFoundError`.
  2. Actor is not a Lead or Admin of the task's workspace → `ForbiddenError`.
  3. Assignee is not a Member of the task's workspace → `ValidationError`.
  4. Any rejection changes nothing: no task field, no Activity.
- Activity actions: `task.assigned` with `meta: { assigneeId, previousAssigneeId }`, and `task.unassigned` with `meta: { previousAssigneeId }`.
- HTTP contract (identity from `x-user-id`, errors mapped as today: 403 / 404 / 400):
  - `PUT /api/tasks/:taskId/assignee` body `{ "assigneeId": "beam" }` → 200 with the task
  - `DELETE /api/tasks/:taskId/assignee` → 200 with the task
  - `GET /api/workspaces/:workspaceId/members` → the Members (id, name, role), for the assignee picker
  - `GET /api/workspaces/:workspaceId/my-tasks` → My tasks
- UI: each task row gets an "Assignee of <title>" picker (Unassigned + the workspace's Members) for Leads and Admins;
  others see the Assignee's name. A "My tasks" checkbox above the list switches the view.
- Assigning a task whose Status is `done` is allowed (product decision pending; see Further Notes).

## Testing Decisions

- A good test checks behaviour through a public interface, never internals. Expected values come from the spec, not from the code.
- Agreed seams (tests go here and nowhere else):
  1. **Service seam**: the three assignment-service functions, against an in-memory store. Every business rule and every "nothing changes on rejection" check lives here.
  2. **HTTP seam**: a real server on a random port with real `fetch` (prior art: `tests/http.test.ts`). Covers the routes and the error-to-status mapping, not the rules again.
- The UI is not tested test-first. Playwright journeys for Assignment are written after the behaviour works (Lab 8, prior art: `e2e/smoke.spec.ts`).

## Out of Scope

- Notifications (email, chat) when a task is assigned.
- More than one Assignee per task (ADR-0001).
- A My tasks view across workspaces (ADR-0002).
- Assigning to anyone outside the workspace, including "sharing" a task. Not "later": never.
- Removing a Member from a workspace and what happens to their tasks.

## Further Notes

- Open question for product: should a `done` task be assignable? Allowed for now; revisit with product.
