# 03: A Lead clears the Assignee

**What to build:** a Lead or Admin sets a task back to Unassigned. The task shows no Assignee and the change is
recorded as Activity `task.unassigned` with the previous Assignee. Same permission rules as Assignment.

**Blocked by:** 01

**Status:** done

- [x] A Lead unassigns; `assigneeId` becomes null
- [x] Activity `task.unassigned` with `meta.previousAssigneeId`
- [x] A plain Member is refused (ForbiddenError / 403); nothing changes
- [x] Choosing "Unassigned" in the UI picker unassigns the task
