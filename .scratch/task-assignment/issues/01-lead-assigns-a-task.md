# 01: A Lead assigns a task to a Member

**What to build:** a Lead or Admin picks a Member of the same workspace as the Assignee of a task from the task list,
and the list shows the Assignee. Re-assigning replaces the Assignee. Each Assignment is recorded as Activity
`task.assigned` with the new and previous Assignee. A plain Member or anyone outside the workspace is refused and nothing changes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A Lead assigns a task to a Member of the same workspace; the task shows that Assignee
- [ ] Re-assigning records `previousAssigneeId` in the Activity
- [ ] An Admin can assign like a Lead
- [ ] A plain Member is refused (ForbiddenError / 403); task and Activity unchanged
- [ ] A Lead of another workspace is refused (ForbiddenError / 403); task and Activity unchanged
- [ ] Unknown task → NotFoundError / 404
- [ ] The UI shows an "Assignee of <title>" picker to Leads and Admins, and the Assignee's name to everyone else
