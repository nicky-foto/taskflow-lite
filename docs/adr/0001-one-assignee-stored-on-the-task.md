# One Assignee per task, stored on the task

A task has at most one Assignee, kept in `Task.assigneeId`, not a separate assignment table.
We considered multiple assignees (pairing, reviews) and rejected it: one clearly responsible Member is the point of Assignment,
and "who did it before" is already answered by Activity. Moving to many assignees later means a data migration and changing every
view that shows the Assignee, so this is deliberately hard to reverse.
