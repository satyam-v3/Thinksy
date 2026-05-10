# AI Learning Companion — Backend

Node.js + Express + TypeScript backend foundation.

> **Status:** Architecture scaffold only. No AI / PDF / quiz / analytics features implemented yet.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4
- **Language:** TypeScript 5 (strict mode)
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan + custom logger

## Project Structure

```
src/
├── server.ts              # HTTP bootstrap
├── app.ts                 # Express app factory
├── config/                # Typed env config (zod-validated)
├── middleware/            # Cross-cutting middleware
│   ├── errorHandler.ts    # Centralized error handling
│   ├── asyncHandler.ts    # Async route wrapper
│   ├── notFound.ts        # 404 handler
│   └── requestLogger.ts   # Request logging
├── routes/                # Route registration
│   ├── index.ts           # Mounts all API versions
│   └── v1/                # v1 namespace
│       ├── index.ts       # v1 router registry
│       └── health.routes.ts
├── controllers/           # HTTP layer (thin, no business logic)
├── services/              # Business logic / domain services
├── utils/                 # Shared utilities
│   ├── ApiError.ts        # Custom typed error class
│   ├── ApiResponse.ts     # Standard response envelope
│   └── logger.ts          # Logging facade
└── types/                 # Shared TypeScript types
    ├── index.ts
    └── express.d.ts       # Express Request augmentation
```

## Architectural Principles

1. **Layered architecture** — `routes → controllers → services → (future: repositories)`. Each layer has a single responsibility.
2. **Versioned API** — all endpoints live under `/api/v1`. New versions live alongside without breaking older clients.
3. **Centralized error handling** — controllers throw `ApiError`; a single middleware formats every error response.
4. **Async-safe routes** — `asyncHandler` wraps async controllers so rejections always reach the error middleware.
5. **Typed config** — `config/index.ts` parses `process.env` through Zod once at boot. The rest of the app imports a typed `config` object.
6. **Path aliases** — `@config/*`, `@services/*`, etc. are wired through `tsconfig.json` for clean imports.
7. **No framework lock-in in services** — services receive plain inputs and return plain outputs; controllers handle HTTP concerns.

## Getting Started

```bash
cd /app/server
cp .env.example .env
yarn install        # or npm install
yarn dev            # starts with tsx watcher
```

Health check:

```
GET http://localhost:4000/api/v1/health
```

## Adding a New Feature Module

1. Create `src/services/<feature>.service.ts` with pure business logic.
2. Create `src/controllers/<feature>.controller.ts` — thin layer that calls the service.
3. Create `src/routes/v1/<feature>.routes.ts` — wire endpoints and bind controllers via `asyncHandler`.
4. Register the router in `src/routes/v1/index.ts`.
5. Add domain types to `src/types/<feature>.types.ts`.

## Roadmap (deferred)

- AI chat module (provider-agnostic adapter layer)
- PDF upload + parsing pipeline
- Quiz generation & grading
- Weak-topic analytics
- Study roadmap engine
- Persistence layer (repository pattern)
- Authentication & rate limiting