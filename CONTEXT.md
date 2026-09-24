# TaskFlow Lite

A task tracker for small teams. Everything lives inside a workspace, and nothing crosses a workspace boundary.

## Language

### People

**User**:
An account. Knows nothing about workspaces on its own.
_Avoid_: member (when you mean the account), person

**Member**:
A user inside one workspace, with exactly one role there: member, lead or admin. The same user can be a Member of several workspaces.
_Avoid_: user (when you mean someone inside a workspace), participant

**Lead**:
A Member with role `lead`. May assign and unassign tasks in that workspace.
_Avoid_: manager, owner

**Admin**:
A Member with role `admin`. Has every permission a Lead has.
_Avoid_: superuser, owner

### Work

**Workspace**:
One team's space. Owns its tasks and memberships.
_Avoid_: project, team space, org, board

**Task**:
One piece of work inside a workspace.
_Avoid_: ticket, issue, card, item

**Status**:
Where a task is: `todo`, `in_progress` or `done`.
_Avoid_: state, stage, column

**Assignee**:
The one Member responsible for a task. May be empty.
_Avoid_: owner, responsible, handler, assigned user

**Assignment**:
Setting or replacing the Assignee of a task. Unassignment empties it.
_Avoid_: delegation, allocation

**My tasks**:
The tasks in one workspace whose Assignee is the viewing Member.
_Avoid_: inbox, my work, todo list

### Record

**Activity**:
An append-only record of one change: who did what to which task, and when.
_Avoid_: audit log, history, event

## Relationships

- A **Workspace** has many **Members** and many **Tasks**
- A **Task** belongs to exactly one **Workspace**
- A **Task** has zero or one **Assignee**, who must be a **Member** of the task's **Workspace**
- Every change to a **Task** produces exactly one **Activity**

## Example dialogue

> **Dev:** "Beam is in Design and Finance. When Beam opens My tasks in Design, do we show the Finance ones too?"
> **Domain expert:** "No. My tasks is per workspace. Beam switches workspace to see the Finance ones."

## Flagged ambiguities

- "assign to someone" was used both for Assignment and for "share with someone outside the team".
  Resolved: only Assignment exists, and only to a Member of the same workspace. Sharing is out of scope.
