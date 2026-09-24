import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/http/app.js";
import { seedStore } from "../src/store/seed.js";

// HTTP seam for .scratch/task-assignment: routes and status codes. The rules are tested at the service seam.
let server: Server;
let base: string;

beforeEach(async () => {
  server = createServer(createApp(seedStore()));
  await new Promise<void>((resolve) => server.listen(0, resolve));
  base = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

function call(method: string, path: string, userId: string, body?: unknown) {
  return fetch(base + path, {
    method,
    headers: { "content-type": "application/json", "x-user-id": userId },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("assignment API", () => {
  it("PUT /api/tasks/:id/assignee assigns (200) and GET my-tasks shows it", async () => {
    const res = await call("PUT", "/api/tasks/t1/assignee", "ann", { assigneeId: "beam" });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: "t1", assigneeId: "beam" });

    const mine = await call("GET", "/api/workspaces/design/my-tasks", "beam");
    expect(((await mine.json()) as { id: string }[]).map((t) => t.id)).toEqual(["t1"]);
  });

  it("DELETE /api/tasks/:id/assignee unassigns (200)", async () => {
    await call("PUT", "/api/tasks/t1/assignee", "ann", { assigneeId: "beam" });
    const res = await call("DELETE", "/api/tasks/t1/assignee", "ann");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ assigneeId: null });
  });

  it("maps the rules to 403 / 400 / 404", async () => {
    expect((await call("PUT", "/api/tasks/t1/assignee", "beam", { assigneeId: "chai" })).status).toBe(403);
    expect((await call("PUT", "/api/tasks/t1/assignee", "ann", { assigneeId: "dao" })).status).toBe(400);
    expect((await call("PUT", "/api/tasks/nope/assignee", "ann", { assigneeId: "beam" })).status).toBe(404);
  });

  it("GET members lists the workspace's Members with roles", async () => {
    const res = await call("GET", "/api/workspaces/design/members", "ann");
    expect(await res.json()).toEqual([
      { id: "ann", name: "Ann", role: "lead" },
      { id: "beam", name: "Beam", role: "member" },
      { id: "chai", name: "Chai", role: "member" },
    ]);
  });
});
