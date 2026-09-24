# 04: My tasks

**What to build:** any Member switches the task list to My tasks and sees only the tasks in the current workspace
whose Assignee is themselves. A Member of two workspaces never sees the other workspace's tasks there (ADR-0002).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] My tasks returns only tasks in that workspace assigned to the actor
- [ ] A Member of two workspaces sees only the current workspace's tasks
- [ ] A non-member asking for My tasks of a workspace → ForbiddenError / 403
- [ ] A "My tasks" checkbox in the UI switches the list
