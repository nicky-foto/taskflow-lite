#!/usr/bin/env node
// PreToolUse guard: blocks dangerous shell commands and reading secret files.
// Exit code 2 = block the tool call; the message on stderr is shown to the agent.
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const tool = input.tool_name ?? "";
const args = input.tool_input ?? {};

const BLOCKED_COMMANDS = [
  { re: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, why: "recursive force delete" },
  { re: /\bgit\s+push\b.*(--force|-f\b)/i, why: "force push rewrites shared history" },
  { re: /\b(db:migrate|migrate\s+deploy|prisma\s+migrate)\b/i, why: "migrations must be run by a human" },
  { re: /(^|[\s"'\/])\.env(?!\.example)(\.[\w-]+)?\b/, why: "secret files must not be read or printed" },
];

function block(reason) {
  process.stderr.write(`Blocked by guard hook: ${reason}\n`);
  process.exit(2);
}

if (tool === "Bash") {
  const cmd = String(args.command ?? "");
  for (const rule of BLOCKED_COMMANDS) {
    if (rule.re.test(cmd)) block(`${rule.why} -> ${cmd}`);
  }
}

if (tool === "Read" || tool === "Edit" || tool === "Write") {
  const path = String(args.file_path ?? "");
  if (/(^|[\\/])\.env(\.(?!example$)[\w-]+)?$/.test(path)) {
    block(`secret files must not be read or edited -> ${path}`);
  }
}

process.exit(0);
