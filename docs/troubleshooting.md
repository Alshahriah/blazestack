# Troubleshooting

### `DATABASE_URL is required`
Ensure `apps/api/.dev.vars` exists and contains `DATABASE_URL`. For `bun db:*` scripts, also set it in `packages/db/.env`.

### `BETTER_AUTH_SECRET` must be at least 32 characters
Generate one: `openssl rand -hex 32`

### `Invalid origin` error from Better Auth
Add your origin to `TRUSTED_ORIGINS` in `apps/api/src/index.ts`.

### tRPC `UNAUTHORIZED` errors
- The API CORS config includes your frontend origin
- `credentials: true` is set in the CORS config
- The auth client `baseURL` matches the actual API URL

### Mobile app can't reach the API
Use your LAN IP (`192.168.x.x:8787`) instead of `localhost` on physical devices.

### `bun db:generate` produces no changes
Expected on first run if the `drizzle/` folder is missing — it generates all tables from scratch.

### `Could not find module '@blazestack/...'`
Run `bun install` from the repo root to restore workspace symlinks.

### Cloudflare Worker `Cannot read properties of undefined` at startup
You have module-level code accessing `process.env` or performing I/O. Move `createDb()` and `createAuth()` inside the request handler or tRPC context factory.
