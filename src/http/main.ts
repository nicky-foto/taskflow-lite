import { createServer } from "node:http";
import { seedStore } from "../store/seed.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
// The reset endpoint exists only for the Playwright tests (see playwright.config.ts).
const testMode = process.env.TASKFLOW_TEST === "1";

const server = createServer(createApp(seedStore(), testMode ? { resetStore: seedStore } : {}));
server.listen(port, () => {
  console.log(`TaskFlow Lite running at http://localhost:${port}${testMode ? " (test mode)" : ""}`);
});
