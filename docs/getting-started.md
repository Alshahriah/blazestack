# Getting Started

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

## Setup

```bash
# 1. Scaffold a new project
npx create-blaze my-app
cd my-app

# 2. Install dependencies
bun install

# 3. Install git hooks
bunx lefthook install

# 4. Set up environment
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars — see Environment variables below

# 5. Create the database
bun db:setup

# 6. Run migrations
bun db:generate
bun db:migrate

# 7. Start the API (port 8787) — keep this running
bun dev:api

# 8. In another terminal, start the web app (port 5173)
bun dev:web

# 9. Optionally, start the mobile app
bun dev:mobile
```

Open [http://localhost:5173](http://localhost:5173) — sign up and start using the app.

## Environment Variables

### API (`apps/api/.dev.vars`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/blazestack_db` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -hex 32` | Random 32+ character secret |
| `BETTER_AUTH_URL` | Yes | `http://localhost:8787` | Base URL of the API |
| `NODE_ENV` | No | `development` | Defaults to `development` |

> Generate a secret:
> ```bash
> openssl rand -hex 32
> ```

### Web (`apps/web`)

Reads `API_URL` from `wrangler.jsonc`. Defaults to `http://localhost:8787` in dev. No separate `.env` needed.

### Mobile (`apps/mobile`)

API URL is set in `apps/mobile/lib/trpc.tsx` and `apps/mobile/lib/auth-client.ts`. Update the production URL before deploying.

### Database scripts (`packages/db`)

Create `packages/db/.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/blazestack_db
```

## Development

```bash
bun dev:api       # Hono API on http://localhost:8787  (start first)
bun dev:web       # React Router web on http://localhost:5173
bun dev:mobile    # Expo — press i (iOS), a (Android), w (web)
```

### Port Reference

| Service | URL |
|---|---|
| API (Hono) | http://localhost:8787 |
| Web (React Router) | http://localhost:5173 |
| Drizzle Studio | http://localhost:4983 |

### Mobile on a Physical Device

Update `API_URL` in both mobile files to your LAN IP:

```ts
const API_URL = __DEV__ ? "http://192.168.1.x:8787" : "https://your-api.workers.dev";
```
