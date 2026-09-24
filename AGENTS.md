# TaskFlow Lite — notes for AI agents

## Commands
- Install: `npm install`
- Test: `npm test`            (runs Vitest once, no watch mode)
- Type check: `npm run check`

## Rules
- Every function that changes data MUST call `logActivity()` from `src/services/activity.ts`.
- Check workspace membership before reading or writing any task (see `assertMember` in `src/services/task-service.ts`).
- Write clean, readable code.
- Use TypeScript.
