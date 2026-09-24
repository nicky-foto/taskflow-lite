import { readFile } from "node:fs/promises";
import type { IncomingMessage, RequestListener, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import type { Store } from "../store/memory-store.js";
import {
  createTask,
  deleteTask,
  ForbiddenError,
  listTasks,
  NotFoundError,
  updateTaskStatus,
  ValidationError,
} from "../services/task-service.js";
import type { Status } from "../domain/types.js";

const PUBLIC_DIR = fileURLToPath(new URL("../../public/", import.meta.url));
const STATIC_FILES: Record<string, { file: string; type: string }> = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
  "/style.css": { file: "style.css", type: "text/css; charset=utf-8" },
};

export interface AppOptions {
  /** Called by POST /api/test/reset. Only wired up when running the Playwright tests. */
  resetStore?: () => Store;
}

type Handler = (ctx: {
  store: Store;
  actorId: string;
  params: Record<string, string>;
  body: Record<string, unknown>;
}) => { status: number; json?: unknown };

interface Route {
  method: string;
  pattern: RegExp;
  keys: string[];
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  const keys: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/:(\w+)/g, (_, key: string) => (keys.push(key), "([^/]+)")) + "$",
  );
  return { method, pattern, keys, handler };
}

const routes: Route[] = [
  route("GET", "/api/users", ({ store }) => ({ status: 200, json: store.users })),

  route("GET", "/api/me/workspaces", ({ store, actorId }) => {
    const ids = new Set(store.memberships.filter((m) => m.userId === actorId).map((m) => m.workspaceId));
    return { status: 200, json: store.workspaces.filter((w) => ids.has(w.id)) };
  }),

  route("GET", "/api/workspaces/:workspaceId/tasks", ({ store, actorId, params }) => ({
    status: 200,
    json: listTasks(store, actorId, params.workspaceId),
  })),

  route("POST", "/api/workspaces/:workspaceId/tasks", ({ store, actorId, params, body }) => ({
    status: 201,
    json: createTask(store, actorId, params.workspaceId, { title: String(body.title ?? "") }),
  })),

  route("PATCH", "/api/tasks/:taskId", ({ store, actorId, params, body }) => ({
    status: 200,
    json: updateTaskStatus(store, actorId, params.taskId, body.status as Status),
  })),

  route("DELETE", "/api/tasks/:taskId", ({ store, actorId, params }) => {
    deleteTask(store, actorId, params.taskId);
    return { status: 204 };
  }),
];

function send(res: ServerResponse, status: number, json?: unknown): void {
  if (json === undefined) {
    res.writeHead(status).end();
    return;
  }
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" }).end(JSON.stringify(json));
}

async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
}

function errorStatus(err: unknown): number {
  if (err instanceof ForbiddenError) return 403;
  if (err instanceof NotFoundError) return 404;
  if (err instanceof ValidationError || err instanceof SyntaxError) return 400;
  return 500;
}

/**
 * The HTTP layer. Thin on purpose: parse the request, call a service, map errors to status codes.
 *
 * Identity is the `x-user-id` header. This is a WORKSHOP SHORTCUT, not authentication:
 * the UI lets you pick who you are acting as, so you can test permissions quickly.
 */
export function createApp(initialStore: Store, options: AppOptions = {}): RequestListener {
  let store = initialStore;

  return async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      const file = req.method === "GET" ? STATIC_FILES[url.pathname] : undefined;
      if (file) {
        const content = await readFile(PUBLIC_DIR + file.file);
        res.writeHead(200, { "content-type": file.type }).end(content);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/test/reset" && options.resetStore) {
        store = options.resetStore();
        send(res, 204);
        return;
      }

      for (const r of routes) {
        const match = req.method === r.method ? r.pattern.exec(url.pathname) : null;
        if (!match) continue;

        const actorId = req.headers["x-user-id"];
        if (typeof actorId !== "string" || actorId === "") {
          send(res, 401, { error: "missing x-user-id header" });
          return;
        }
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
        const body = req.method === "GET" || req.method === "DELETE" ? {} : await readBody(req);
        const result = r.handler({ store, actorId, params, body });
        send(res, result.status, result.json);
        return;
      }

      send(res, 404, { error: "not found" });
    } catch (err) {
      const status = errorStatus(err);
      const message = status === 500 ? "internal error" : (err as Error).message;
      if (status === 500) console.error(err);
      send(res, status, { error: message });
    }
  };
}
