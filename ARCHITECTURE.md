# Thinksy Architecture Scaffold

This repository currently contains folder and file scaffolds only.
No business logic has been implemented yet.

## Frontend

- `src/app/router`: route tree and route guards
- `src/app/layouts`: dashboard/chat/quiz layouts
- `src/features`: domain-based feature modules
- `src/shared`: reusable UI and cross-feature utilities

## Backend

- `server/src/modules`: auth/chat/pdf/quiz/analytics/roadmap modules
- `server/src/shared/middleware`: auth, validation, and error middleware placeholders
- `server/src/jobs`: async job placeholders for heavy workflows

## Next Step

Implement route wiring in `src/app/router/index.tsx` and `server/src/app.ts` first.
