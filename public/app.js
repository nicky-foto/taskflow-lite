// TaskFlow Lite UI. Plain JavaScript, no build step.
// Every request sends `x-user-id` = the person picked in "Acting as" (a workshop shortcut, not auth).

const $ = (sel) => document.querySelector(sel);
const state = { actorId: "ann", workspaceId: null, members: [], myTasksOnly: false };

const canAssign = () => {
  const me = state.members.find((m) => m.id === state.actorId);
  return me?.role === "lead" || me?.role === "admin";
};
const nameOf = (userId) => state.members.find((m) => m.id === userId)?.name ?? userId;

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json", "x-user-id": state.actorId },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function showError(message) {
  const el = $("#error");
  el.textContent = message;
  el.hidden = !message;
}

function option(value, label, selected) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  o.selected = selected;
  return o;
}

async function loadUsers() {
  const users = await api("GET", "/api/users");
  $("#actor").replaceChildren(...users.map((u) => option(u.id, u.name, u.id === state.actorId)));
}

async function loadWorkspaces() {
  const workspaces = await api("GET", "/api/me/workspaces");
  if (!workspaces.some((w) => w.id === state.workspaceId)) state.workspaceId = workspaces[0]?.id ?? null;
  $("#workspace").replaceChildren(
    ...workspaces.map((w) => option(w.id, w.name, w.id === state.workspaceId)),
  );
}

function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.taskId = task.id;

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title;

  const id = document.createElement("span");
  id.className = "id";
  id.textContent = task.id;

  const status = document.createElement("select");
  status.setAttribute("aria-label", `Status of ${task.title}`);
  for (const s of ["todo", "in_progress", "done"]) status.append(option(s, s, s === task.status));
  status.addEventListener("change", () =>
    run(() => api("PATCH", `/api/tasks/${task.id}`, { status: status.value })),
  );

  const del = document.createElement("button");
  del.type = "button";
  del.textContent = "Delete";
  del.setAttribute("aria-label", `Delete ${task.title}`);
  del.addEventListener("click", () => run(() => api("DELETE", `/api/tasks/${task.id}`)));

  let assignee;
  if (canAssign()) {
    assignee = document.createElement("select");
    assignee.setAttribute("aria-label", `Assignee of ${task.title}`);
    assignee.append(option("", "Unassigned", task.assigneeId === null));
    for (const m of state.members) assignee.append(option(m.id, m.name, m.id === task.assigneeId));
    assignee.addEventListener("change", () =>
      run(() =>
        assignee.value === ""
          ? api("DELETE", `/api/tasks/${task.id}/assignee`)
          : api("PUT", `/api/tasks/${task.id}/assignee`, { assigneeId: assignee.value }),
      ),
    );
  } else {
    assignee = document.createElement("span");
    assignee.className = "assignee";
    assignee.textContent = task.assigneeId ? `Assignee: ${nameOf(task.assigneeId)}` : "Unassigned";
  }

  li.append(title, id, assignee, status, del);
  return li;
}

async function loadTasks() {
  if (!state.workspaceId) {
    $("#tasks").replaceChildren();
    $("#empty").hidden = false;
    return;
  }
  state.members = await api("GET", `/api/workspaces/${state.workspaceId}/members`);
  const path = state.myTasksOnly ? "my-tasks" : "tasks";
  const tasks = await api("GET", `/api/workspaces/${state.workspaceId}/${path}`);
  $("#tasks").replaceChildren(...tasks.map(renderTask));
  $("#empty").hidden = tasks.length > 0;
}

/** Run an action, then reload the list. Errors are shown, not swallowed. */
async function run(action) {
  try {
    showError("");
    await action();
  } catch (err) {
    showError(err.message);
  }
  await loadTasks().catch((err) => showError(err.message));
}

$("#actor").addEventListener("change", async (e) => {
  state.actorId = e.target.value;
  await loadWorkspaces();
  await run(async () => {});
});

$("#workspace").addEventListener("change", (e) => {
  state.workspaceId = e.target.value;
  run(async () => {});
});

$("#my-tasks").addEventListener("change", (e) => {
  state.myTasksOnly = e.target.checked;
  run(async () => {});
});

$("#new-task").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.elements.title;
  const title = input.value;
  run(async () => {
    await api("POST", `/api/workspaces/${state.workspaceId}/tasks`, { title });
    input.value = "";
  });
});

await loadUsers();
await loadWorkspaces();
await run(async () => {});
