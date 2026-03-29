# Packages

## `@blazestack/db`

Drizzle ORM schema and database client.

```ts
import { createDb, notes, user } from "@blazestack/db";

const db = createDb(process.env.DATABASE_URL);
const rows = await db.select().from(notes);
```

## `@blazestack/trpc`

tRPC v11 router, types, and utilities.

```ts
import { appRouter, type AppRouter } from "@blazestack/trpc";
import { createId } from "@blazestack/trpc/utils";
```

`createId()` generates a sortable, URL-safe ID from `Date.now() + Math.random()`. Replace with `nanoid` or `uuidv7` for high-concurrency scenarios.

## `@blazestack/auth`

Better Auth factory.

```ts
import { createAuth } from "@blazestack/auth/server";
import { createClient } from "@blazestack/auth"; // vanilla client
```

## `@blazestack/env`

T3-style Zod-validated env. Throws at startup if required vars are missing.

```ts
import { dbEnv } from "@blazestack/env";        // DATABASE_URL
import { createApiEnv } from "@blazestack/env"; // Cloudflare Workers
import { webEnv } from "@blazestack/env";       // Vite/web
```

## `@blazestack/ui`

Shared components for web and native.

```ts
import { Button, Input, Card } from "@blazestack/ui/web";    // React + Tailwind
import { Button, Input, Card } from "@blazestack/ui/native"; // React Native
```

## Database

### Schema

- `schema/auth.ts` — Better Auth tables: `user`, `session`, `account`, `verification`
- `schema/notes.ts` — Demo notes table

> Do not rename the auth tables. Better Auth requires exact names.

### Commands

```bash
bun db:setup      # Create the database
bun db:generate   # Generate SQL migrations from schema changes
bun db:migrate    # Apply pending migrations
bun db:seed       # Seed demo notes (requires SEED_USER_ID env var)
bun db:studio     # Open Drizzle Studio at http://localhost:4983
```

### Seeding

Users must be created via the sign-up endpoint — not inserted directly.

```bash
curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

SEED_USER_ID=<user-id> bun db:seed
```
