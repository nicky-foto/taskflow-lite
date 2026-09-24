#!/usr/bin/env node
// Stop hook: the agent may only finish its turn when type check and tests pass.
// Exit code 2 = do not stop; stderr tells the agent what to fix.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
// Already continuing because of this hook once? Let the agent stop to avoid loops.
if (input.stop_hook_active) process.exit(0);

try {
  execSync("npm run check --silent", { stdio: "pipe" });
  execSync("npm test --silent", { stdio: "pipe" });
  process.exit(0);
} catch (err) {
  const out = `${err.stdout ?? ""}${err.stderr ?? ""}`.toString().slice(-2000);
  process.stderr.write(`Checks are failing. Fix the root cause (do not edit tests to pass):\n${out}\n`);
  process.exit(2);
}
