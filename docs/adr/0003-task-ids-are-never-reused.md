# Task ids are never reused

Task ids come from a counter in the store that only goes up, not from the number of tasks.
Counting tasks meant that after a delete, a new task could get the id of a task that still existed, so a lookup by id
silently hit the wrong task, sometimes in another workspace. Activity also refers to tasks by id, so an id must keep
meaning the same task forever, even after that task is deleted.
