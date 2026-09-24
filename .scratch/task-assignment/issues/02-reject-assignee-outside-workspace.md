# 02: Assigning to someone outside the workspace is rejected

**What to build:** when a Lead tries to assign a task to a user who is not a Member of the task's workspace,
the Assignment is rejected with a clear message and nothing changes. The UI shows the message.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Assignee not a Member of the task's workspace → ValidationError / 400
- [ ] Task and Activity unchanged after the rejection
- [ ] The error message is shown in the UI's alert area
