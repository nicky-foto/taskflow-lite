import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/http/app.js";
import { seedStore } from "../src/store/seed.js";

// The HTTP seam: real server on a random port, real fetch. No mocks.
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

function call(method: string, path: string, userId: string | null, body?: unknown) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (userId) headers["x-user-id"] = userId;
  return fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

describe("HTTP API", () => {
  it("serves the UI", async () => {
    const res = await fetch(base + "/");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("TaskFlow Lite");
  });

  it("lists the tasks of a workspace", async () => {
    const res = await call("GET", "/api/workspaces/design/tasks", "ann");
    expect(res.status).toBe(200);
    const tasks = (await res.json()) as { title: string }[];
    expect(tasks.map((t) => t.title)).toEqual(["Redesign login page", "Write style guide", "Export icon set"]);
  });

  it("creates a task", async () => {
    const res = await call("POST", "/api/workspaces/design/tasks", "ann", { title: "New one" });
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ title: "New one", status: "todo" });
  });

  it("requires the x-user-id header", async () => {
    const res = await call("GET", "/api/workspaces/design/tasks", null);
    expect(res.status).toBe(401);
  });

  it("maps NotFoundError to 404 and ValidationError to 400", async () => {
    expect((await call("PATCH", "/api/tasks/nope", "ann", { status: "done" })).status).toBe(404);
    expect((await call("POST", "/api/workspaces/design/tasks", "ann", { title: "" })).status).toBe(400);
  });
});
