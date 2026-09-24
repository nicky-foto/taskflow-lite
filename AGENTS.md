# TaskFlow Lite — notes for AI agents

## Commands
- Install: `npm install`
- Type check: `npm run check`
- Unit + API tests: `npm test`        (Vitest, runs once, no watch mode)
- Browser tests: `npm run e2e`        (Playwright; starts its own server on port 3100)
- Run the app: `npm run dev`          (http://localhost:3000)
- Before you say a task is done, run `npm run check` and `npm test` and show the output.

## Structure
- `src/domain/types.ts`  — domain types only, no logic
- `src/services/`        — business rules; the HTTP layer and the UI never hold rules
- `src/http/app.ts`      — thin: parse request -> call a service -> map errors to status codes
- `public/`              — plain JavaScript UI, no build step
- `tests/`               — Vitest, at the service seam and the HTTP seam
- `e2e/`                 — Playwright, user journeys only; every test starts from the seed (`e2e/fixtures.ts`)

## Rules
- Every function that changes data MUST call `logActivity()` from `src/services/activity.ts`.
- Check workspace membership before reading or writing any task (see `assertMember` in `src/services/task-service.ts`).
- Throw the existing error classes in `src/services/errors.ts`; never return null or error strings.
- Write the failing test first for business rules, at the service or HTTP seam.
- Playwright tests are written AFTER the behaviour works, never test-first (too slow for red -> green).
- In Playwright use `getByRole` / `getByLabel` and web-first assertions. Never `waitForTimeout`.

## Red lines (ask first, never do alone)
- Never read or print `.env` files.
- Never `git push --force`.
- Never edit a test just to make it pass. Fix the cause, or explain why the test is wrong.
