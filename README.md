# TaskFlow Lite

Example repo for the workshop **"SDLC ครบ loop กับ AI Coding Agent ด้วย mattpocock/skills"**.

A tiny task tracker for small teams: services in TypeScript, an in-memory store, a thin HTTP API
(`node:http`) and a plain-JavaScript UI. Small enough to read in five minutes, real enough to run
the whole loop on: plan → spec → tickets → implement (TDD) → review → bug fix → automation test.

## Start

```bash
node -v                        # v20.9 or newer
npm install
npx playwright install chromium
cp .env.example .env           # fake value, used to test the guard hook
npm run check && npm test      # type check + unit/API tests (Vitest)
npm run e2e                    # browser tests (Playwright)
npm run dev                    # http://localhost:3000
```

In the UI, **Acting as** picks who you are (a workshop shortcut instead of real login),
so you can try permissions quickly. Seed data: Design = Ann (lead), Beam, Chai; Finance = Dao (lead), Beam.

## Branches: one checkpoint per stage of the loop

Fell behind? Jump to the checkpoint for the lab you are about to start:

```bash
git stash
git switch checkpoint/05-implement
git switch -c my-work-05
```

| Branch | State: everything up to the end of… |
|---|---|
| `main` | Starting point |
| `checkpoint/01-foundation` | Lab 1: tighter AGENTS.md, hooks enabled |
| `checkpoint/02-setup` | Lab 2: `/setup-matt-pocock-skills` done (local markdown tracker) |
| `checkpoint/03-grill` | Lab 3: `/grill-with-docs` done: CONTEXT.md + ADR |
| `checkpoint/04-tickets` | Lab 4: `/to-spec` + `/to-tickets` done: spec and 4 tickets in `.scratch/task-assignment/` |
| `checkpoint/05-implement` | Lab 5: all 4 tickets implemented test-first |
| `checkpoint/06-review` | Lab 6: review findings fixed, authz tests added |
| `checkpoint/07-bugfix` | Lab 7: inbox bug diagnosed and fixed with a regression test |
| `solution/final` | Lab 8: Playwright e2e for the critical journeys, e2e in CI |

Skill output is not deterministic: your spec and tickets will not match the checkpoints word for word.
That is fine. The checkpoints are a reference and a way back in, not an answer key.

## Structure

```
src/domain/     types only
src/services/   business rules (task-service, activity, errors)
src/store/      in-memory store + seed data
src/http/       thin HTTP layer: parse -> call service -> map errors
public/         the UI (no build step)
tests/          Vitest: services + HTTP API
e2e/            Playwright: user journeys in a real browser
.scratch/       local issue tracker (mattpocock/skills convention)
.claude/        hooks (guard, verify) and a read-only security reviewer
```

The workshop commands for every lab are in [WORKSHOP-COMMANDS.md](WORKSHOP-COMMANDS.md).
