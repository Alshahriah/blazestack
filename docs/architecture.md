# Architecture

## Structure

```
blazestack/
├── apps/
│   ├── api/          Hono server — Cloudflare Workers
│   │                 Better Auth + tRPC endpoints
│   ├── web/          React Router v7 SSR — Cloudflare Workers
│   │                 Full-stack web app with auth + notes demo
│   └── mobile/       Expo SDK 55 (React Native 0.84)
│                     iOS + Android app with auth + notes demo
├── packages/
│   ├── auth/         Better Auth factory (server + vanilla client)
│   ├── db/           Drizzle ORM schema, migrations, seed
│   ├── env/          T3 env — Zod-validated environment variables
│   ├── trpc/         tRPC v11 router — shared across API consumers
│   └── ui/           Shared components: web (Tailwind) + native (StyleSheet)
├── .github/
│   ├── ISSUE_TEMPLATE/           Bug report + feature request templates
│   └── pull_request_template.md
├── biome.json        Formatter + linter config
├── lefthook.yml      Git hooks: format on commit, typecheck on push
├── turbo.json        Task pipeline with caching
└── tsconfig.base.json
```

## Request Flow

```
Browser / Mobile app
  │
  ├── Auth requests  →  POST /api/auth/**  →  Better Auth  →  PostgreSQL
  │
  └── Data requests  →  POST /trpc/*      →  tRPC router  →  Drizzle  →  PostgreSQL
```

- The **API** (`apps/api`) runs on Cloudflare Workers. It handles all auth and data requests.
- The **web app** (`apps/web`) is a separate Cloudflare Worker that serves SSR pages. It talks to the API over HTTP via tRPC and Better Auth clients.
- The **mobile app** (`apps/mobile`) talks directly to the API over HTTP.
- All three share types from `packages/trpc` — no codegen needed.

## Key Patterns

### DB client per-request

`createDb(url)` must be called per-request, not at module level. Cloudflare Workers share module-level state across requests.

```ts
createContext: async (_opts, c) => {
  const db = createDb(c.env.DATABASE_URL); // fresh per request
  ...
}
```

### Protected procedures

`protectedProcedure` throws `UNAUTHORIZED` if `ctx.session` is null.

```ts
type Context = {
  db: DB;
  session: Session | null;
};
```
