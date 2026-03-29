# blazestack

A full-stack Bun monorepo template with end-to-end type safety across web, API, and mobile.

**Stack:** Expo SDK 55 · React Router v7 (Cloudflare) · Hono (Cloudflare Workers) · tRPC v11 · Drizzle ORM · PostgreSQL · Better Auth · Biome · Turbo

---

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Development](#development)
- [Authentication](#authentication)
- [tRPC](#trpc)
- [Adding features](#adding-features)
- [Packages](#packages)
- [Code quality](#code-quality)
- [Deploying](#deploying)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## Architecture

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

### Request flow

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

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| [Bun](https://bun.sh) | >= 1.1 | `curl -fsSL https://bun.sh/install \| bash` |
| [PostgreSQL](https://www.postgresql.org) | >= 14 | Homebrew, Docker, or cloud |
| [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) | >= 3 | `bun add -g wrangler` |
| Cloudflare account | — | [dash.cloudflare.com](https://dash.cloudflare.com) (for deploy only) |

> **PostgreSQL via Docker** — quickest option:
> ```bash
> docker run -d --name blazestack-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
> ```
> Then set `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blazestack_db`.

---

## Getting started

```bash
# 1. Clone
git clone https://github.com/your-org/blazestack.git
cd blazestack

# 2. Install all dependencies (all workspaces)
bun install

# 3. Install git hooks
bunx lefthook install

# 4. Set up environment
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars — see Environment variables below

# 5. Create the database (if it doesn't already exist)
bun db:setup

# 6. Generate + run migrations
bun db:generate
bun db:migrate

# 7. Start the API (port 8787) — keep this running
bun dev:api

# 8. In another terminal, start the web app (port 5173)
bun dev:web

# 9. Optionally, start the mobile app
bun dev:mobile
```

Open [http://localhost:5173](http://localhost:5173) — sign up for an account and start using the app.

---

## Environment variables

### API (`apps/api/.dev.vars`)

Copy from the example:
```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/blazestack_db` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -hex 32` | Random 32+ character secret for signing sessions |
| `BETTER_AUTH_URL` | Yes | `http://localhost:8787` | Base URL of the API (used by Better Auth for callbacks) |
| `NODE_ENV` | No | `development` | Defaults to `development` |

> **Generating a secret:**
> ```bash
> openssl rand -hex 32
> # or
> bun -e "console.log(crypto.randomUUID().replace(/-/g,'') + crypto.randomUUID().replace(/-/g,''))"
> ```

### Web (`apps/web`)

The web app reads `API_URL` from `wrangler.jsonc` vars. For local dev it defaults to `http://localhost:8787`. No separate `.env` file needed.

### Mobile (`apps/mobile`)

The API URL is set in `apps/mobile/lib/trpc.tsx` and `apps/mobile/lib/auth-client.ts`. In dev it points to `http://localhost:8787`. Update the production URL before deploying.

### Database scripts (`packages/db`)

The `bun db:*` scripts automatically load `packages/db/.env` via `dotenv`. Create it:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/blazestack_db
```
This file is gitignored. Alternatively, export `DATABASE_URL` in your shell before running the scripts.

---

## Database

All DB code lives in `packages/db/src/`.

### Schema

- `schema/auth.ts` — Better Auth tables: `user`, `session`, `account`, `verification`
- `schema/notes.ts` — Demo notes table
- `schema/index.ts` — Re-exports all tables

> **Do not rename the auth tables.** Better Auth requires `user`, `session`, `account`, and `verification` exactly.

### Commands

```bash
bun db:setup      # Create the database if it doesn't exist
bun db:generate   # Generate SQL migrations from schema changes
bun db:migrate    # Apply pending migrations to DATABASE_URL
bun db:seed       # Seed demo notes (requires SEED_USER_ID env var)
bun db:studio     # Open Drizzle Studio at http://localhost:4983
```

### Migrations workflow

When you change the schema:

```bash
# 1. Edit packages/db/src/schema/*.ts
# 2. Generate migration SQL
bun db:generate
# 3. Review packages/db/drizzle/*.sql
# 4. Apply
bun db:migrate
```

### Seeding

Users must be created via the sign-up endpoint — not inserted directly into the DB. Direct inserts bypass Better Auth and produce no `account`/password row, so those users cannot sign in.

```bash
# 1. Create a user via the API
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# 2. Seed demo notes using the returned user ID
SEED_USER_ID=<user-id> bun db:seed
```

### DB client pattern

`createDb(url)` must be called **per-request**, not at module level. Cloudflare Workers share module-level state across requests, so creating the connection at module load would reuse a single connection across all requests.

```ts
// Correct — in tRPC context factory (apps/api/src/index.ts)
createContext: async (_opts, c) => {
  const db = createDb(c.env.DATABASE_URL); // fresh per request
  ...
}
```

---

## Development

### Running services

```bash
bun dev:api       # Hono API on http://localhost:8787  (start this first)
bun dev:web       # React Router web on http://localhost:5173
bun dev:mobile    # Expo — press i (iOS), a (Android), w (web)
```

Both the web and mobile apps call the API at `http://localhost:8787`. Start the API first.

### Mobile on a physical device

Expo Go works over LAN. Update the `API_URL` in both mobile files to your machine's LAN IP:

```ts
// apps/mobile/lib/trpc.tsx
// apps/mobile/lib/auth-client.ts
const API_URL = __DEV__ ? "http://192.168.1.x:8787" : "https://blazestack-api.your-subdomain.workers.dev";
```

### Port reference

| Service | URL |
|---|---|
| API (Hono) | http://localhost:8787 |
| Web (React Router) | http://localhost:5173 |
| Drizzle Studio | http://localhost:4983 |

---

## Authentication

Auth is handled by [Better Auth](https://www.better-auth.com) on the Hono API at `/api/auth/**`.

### How it works

1. **Sign up / sign in** — clients POST to `/api/auth/sign-up/email` or `/api/auth/sign-in/email`
2. **Session cookie** — Better Auth sets a `better-auth.session_token` cookie on the response
3. **tRPC context** — each tRPC request calls `auth.api.getSession()` to extract the session from the cookie
4. **Protected procedures** — `protectedProcedure` throws `UNAUTHORIZED` if `ctx.session` is null
5. **Email verification** — disabled (`requireEmailVerification: false`). To enable, configure an email provider in `packages/auth/src/server.ts`.

### Web

```ts
import { signIn, signUp, signOut, useSession } from "~/lib/auth-client";

const { data: session } = useSession(); // { user, session } | null
await signIn.email({ email, password });
await signOut();
```

### Mobile

```ts
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";

const { data: session } = useSession();
await signIn.email({ email, password });
await signOut();
```

The `AuthGate` in `apps/mobile/app/_layout.tsx` automatically redirects unauthenticated users to `/sign-in` and authenticated users away from auth screens.

### Adding a production origin

Add your deployed frontend URL to `TRUSTED_ORIGINS` in `apps/api/src/index.ts`:
```ts
const TRUSTED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8081",
  "https://your-web-app.pages.dev", // add here
];
```

### Adding OAuth (e.g. GitHub)

1. Update `packages/auth/src/server.ts`:
```ts
socialProviders: {
  github: {
    clientId: options.githubClientId,
    clientSecret: options.githubClientSecret,
  },
},
```
2. Pass the credentials through `createAuth(db, { ..., githubClientId, githubClientSecret })`
3. Set secrets: `wrangler secret put GITHUB_CLIENT_ID --cwd apps/api`

---

## tRPC

tRPC procedures live in `packages/trpc/src/routers/`. Types are shared automatically — no codegen.

### Procedure types

```ts
import { publicProcedure, protectedProcedure, router } from "../trpc";

// Public — no auth required
export const myRouter = router({
  hello: publicProcedure.query(() => "world"),

  // Protected — throws UNAUTHORIZED if not signed in
  // ctx.session is guaranteed non-null here
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.db.select().from(user).where(eq(user.id, ctx.session.userId));
  }),
});
```

### Context

```ts
type Context = {
  db: DB;              // Drizzle instance
  session: Session | null; // null for public procedures
};

type Session = {
  userId: string;
  email: string;
};
```

### Using tRPC in web

```ts
import { trpc } from "~/lib/trpc";

// Query
const { data: notes } = trpc.notes.list.useQuery();

// Mutation
const utils = trpc.useUtils();
const createNote = trpc.notes.create.useMutation({
  onSuccess: () => utils.notes.list.invalidate(),
});
createNote.mutate({ title: "Hello", body: "World" });
```

### Using tRPC in mobile

```ts
import { trpc } from "../lib/trpc";

// Identical API to web
const { data: notes } = trpc.notes.list.useQuery();
```

### Adding a new procedure

1. Add to an existing router or create a new file in `packages/trpc/src/routers/`
2. Register in `packages/trpc/src/root.ts`
3. Use immediately in web and mobile — types flow automatically

```ts
// packages/trpc/src/routers/posts.ts
export const postsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.select().from(posts).where(eq(posts.userId, ctx.session.userId))
  ),
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db.insert(posts).values({ id: createId(), userId: ctx.session.userId, ...input }).returning()
    ),
});

// packages/trpc/src/root.ts
export const appRouter = router({
  notes: notesRouter,
  posts: postsRouter, // add here
});
```

---

## Adding features

### Adding a DB table

1. Create `packages/db/src/schema/posts.ts`
2. Export from `packages/db/src/schema/index.ts`
3. Run `bun db:generate` then `bun db:migrate`

### Adding a web route

1. Create `apps/web/app/routes/posts.tsx`
2. Register in `apps/web/app/routes.ts`:
```ts
route("posts", "routes/posts.tsx"),
```

### Adding a mobile screen

1. Create `apps/mobile/app/(tabs)/posts.tsx`
2. Add a `<Tabs.Screen name="posts" ... />` entry in `apps/mobile/app/(tabs)/_layout.tsx`
3. Add an icon mapping in `apps/mobile/components/ui/icon-symbol.tsx` if needed

### Adding a shared UI component

- Web: `packages/ui/src/web/my-component.tsx` + export from `packages/ui/src/web/index.ts`
- Native: `packages/ui/src/native/my-component.tsx` + export from `packages/ui/src/native/index.ts`

---

## Packages

### `@blazestack/db`

Drizzle ORM schema and database client.

```ts
import { createDb, notes, user } from "@blazestack/db";

const db = createDb(process.env.DATABASE_URL);
const rows = await db.select().from(notes);
```

### `@blazestack/trpc`

tRPC router, types, and utilities.

```ts
import { appRouter, type AppRouter } from "@blazestack/trpc";
import { createId } from "@blazestack/trpc/utils"; // tiny collision-resistant ID — used for generating note/record IDs
```

`createId()` generates a sortable, URL-safe ID from `Date.now() + Math.random()`. Suitable for low-throughput apps. Replace with `nanoid` or `uuidv7` for high-concurrency scenarios.

### `@blazestack/auth`

Better Auth factory.

```ts
import { createAuth } from "@blazestack/auth/server";
import { createClient } from "@blazestack/auth"; // vanilla client for non-React contexts
```

### `@blazestack/env`

T3-style Zod-validated env. Throws at startup if required vars are missing.

```ts
import { dbEnv } from "@blazestack/env";        // DATABASE_URL
import { createApiEnv } from "@blazestack/env"; // Cloudflare Workers (pass c.env)
import { webEnv } from "@blazestack/env";       // Vite/web
```

### `@blazestack/ui`

Shared components.

```ts
import { Button, Input, Card } from "@blazestack/ui/web";    // React + Tailwind
import { Button, Input, Card } from "@blazestack/ui/native"; // React Native
```

---

## Code quality

### Commands

```bash
bun lint          # biome ci — check only (used in CI)
bun lint:fix      # biome check --write — auto-fix and format
```

### Git hooks (lefthook)

Installed automatically via `bun install` (`prepare` script). Runs:

- **pre-commit** — Biome format + lint on staged `.ts/.tsx/.js/.json` files (auto-fixes and re-stages)
- **pre-push** — full typecheck across all packages

To skip hooks in an emergency:
```bash
git commit --no-verify
git push --no-verify
```

### Biome config

Biome replaces ESLint + Prettier. Config in `biome.json`:
- 2-space indent, 100-char line width, double quotes, trailing commas
- `noUnusedImports` and `noUnusedVariables` as warnings
- Mobile files excluded (Expo has its own config via `eslint.config.js`)

---

## Deploying

### API

```bash
# Set secrets (one-time)
wrangler secret put DATABASE_URL --cwd apps/api
wrangler secret put BETTER_AUTH_SECRET --cwd apps/api

# Update BETTER_AUTH_URL and BETTER_AUTH_SECRET in apps/api/wrangler.toml
# to your actual Workers subdomain, then deploy:
bun build:api
# or directly:
bun run --cwd apps/api deploy
```

### Web

```bash
# Update API_URL in apps/web/wrangler.jsonc to your deployed API URL
bun build:web
# or directly:
bun run --cwd apps/web deploy
```

### Mobile

Build with EAS:
```bash
bun add -g eas-cli
cd apps/mobile
eas build --platform ios     # or android, or all
eas submit                   # submit to App Store / Play Store
```

Before building for production, update the API URLs in:
- `apps/mobile/lib/trpc.tsx`
- `apps/mobile/lib/auth-client.ts`

### Cloudflare Hyperdrive (recommended for production)

Cloudflare Workers have a short-lived execution model. For PostgreSQL, use [Hyperdrive](https://developers.cloudflare.com/hyperdrive/) to pool and cache connections:

1. Create a Hyperdrive config in the Cloudflare dashboard
2. Uncomment the `[[hyperdrive]]` block in `apps/api/wrangler.toml`
3. In `apps/api/src/index.ts`, pass `c.env.HYPERDRIVE.connectionString` to `createDb()` instead of `c.env.DATABASE_URL`

---

## CI/CD

No CI/CD workflow is included in this template. Deploy manually using the commands in the [Deploying](#deploying) section.

If you want to add GitHub Actions, create `.github/workflows/ci.yml` with your own pipeline. A minimal setup would:

1. Run `bun install`
2. Run `bun lint` (Biome)
3. Run `tsc --noEmit` across packages
4. Deploy via `wrangler deploy` using a `CLOUDFLARE_API_TOKEN` secret

---

## Troubleshooting

### `DATABASE_URL is required`
Ensure `apps/api/.dev.vars` exists and contains `DATABASE_URL`. For `bun db:*` scripts, also set it in `packages/db/.env` or your shell.

### `BETTER_AUTH_SECRET` must be at least 32 characters
Generate one: `openssl rand -hex 32`

### `Invalid origin` error from Better Auth
Better Auth rejects requests from origins not in its `trustedOrigins` list. The dev origins (`http://localhost:5173`, `http://localhost:8081`) are already included. For production or custom ports, add your origin to `TRUSTED_ORIGINS` in `apps/api/src/index.ts`.

### tRPC `UNAUTHORIZED` errors
The session cookie must be sent with requests. Ensure:
- The API CORS config in `apps/api/src/index.ts` includes your frontend origin
- `credentials: true` is set in the CORS config
- The auth client `baseURL` matches the actual API URL

### Mobile app can't reach the API
On a physical device or simulator, `localhost` doesn't resolve to your dev machine. Use your LAN IP (`192.168.x.x:8787`) in the mobile API_URL.

### `bun db:generate` produces no changes
Drizzle compares against the last generated migration. If the `drizzle/` folder is missing, it will generate all tables from scratch — this is expected on first run.

### `Could not find module '@blazestack/...'`
Run `bun install` from the repo root. Bun workspaces symlink packages into `node_modules` — if the symlinks are missing, reinstalling fixes it.

### Cloudflare Worker `Cannot read properties of undefined` at startup
You have module-level code that accesses `process.env` or performs I/O. All such code must be inside request handlers. The `createDb()` and `createAuth()` calls must happen inside the `fetch` handler or tRPC context factory, not at module level.

---

## License

MIT — see [LICENSE](./LICENSE).
