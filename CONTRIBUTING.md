# Contributing to erh-cf

Thank you for your interest in contributing.

## Prerequisites

- [Bun](https://bun.sh) >= 1.1
- PostgreSQL >= 14 (or Docker)
- See [README.md](./README.md) for full setup instructions

## Setup

```bash
git clone https://github.com/your-org/erh-cf.git
cd erh-cf
bun install
bunx lefthook install
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Edit apps/api/.dev.vars with your local DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
bun db:setup
bun db:generate
bun db:migrate
```

## Development

```bash
bun dev:api      # Hono API on :8787  (start first)
bun dev:web      # React Router web on :5173
bun dev:mobile   # Expo mobile
```

## Code quality

This project uses [Biome](https://biomejs.dev) for formatting and linting, replacing ESLint + Prettier.

```bash
bun lint          # check only (used in CI)
bun lint:fix      # auto-fix and format
```

Git hooks via [lefthook](https://github.com/evilmartians/lefthook) run automatically:
- **pre-commit** — Biome on staged files (auto-fixes and re-stages)
- **pre-push** — typecheck across all packages

To skip in an emergency: `git commit --no-verify`

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, deploys automatically |
| `dev` | Integration — PRs target here |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Tooling, deps, docs |

## Pull requests

1. Fork the repo and create your branch from `dev`
2. Make your changes
3. Ensure `bun lint` passes
4. Ensure no TypeScript errors (`cd <package> && bunx tsc --noEmit`)
5. Open a PR against `dev` with a clear description

Use the pull request template — it includes a checklist.

## Adding a feature end-to-end

Typical flow for a new resource (e.g. `posts`):

1. **Schema** — `packages/db/src/schema/posts.ts`, export from `schema/index.ts`, run `bun db:generate && bun db:migrate`
2. **tRPC router** — `packages/trpc/src/routers/posts.ts`, register in `root.ts`
3. **Web route** — `apps/web/app/routes/posts.tsx`, register in `routes.ts`
4. **Mobile screen** — `apps/mobile/app/(tabs)/posts.tsx`, add tab in `_layout.tsx`

See the [README](./README.md#adding-features) for detailed instructions.

## Package structure

| Package | Purpose |
|---|---|
| `packages/db` | Drizzle schema, migrations, seed |
| `packages/trpc` | tRPC router — add new procedures here |
| `packages/auth` | Better Auth config (server + client) |
| `packages/env` | Env validation (T3 env + Zod) |
| `packages/ui` | Shared UI components (web + native) |
| `apps/api` | Hono Cloudflare Worker |
| `apps/web` | React Router v7 SSR Cloudflare Worker |
| `apps/mobile` | Expo SDK 55 (React Native 0.84) |

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Bun version (`bun --version`)
- Which app (`api` / `web` / `mobile`)
- Steps to reproduce
- Expected vs actual behavior
