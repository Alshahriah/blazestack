<div align="center">
  <img src="./assets/logo.png" alt="blazestack" width="180" />

  <h3>blazestack</h3>
  <p>Blazing fast full-stack apps. Ship web, API, and mobile from one repo.</p>

  <p>
    <a href="https://www.npmjs.com/package/create-blaze">
      <img src="https://img.shields.io/npm/v/create-blaze?style=flat-square&color=f97316&label=create-blaze" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/create-blaze">
      <img src="https://img.shields.io/npm/dm/create-blaze?style=flat-square&color=f97316" alt="npm downloads" />
    </a>
    <a href="https://bun.sh">
      <img src="https://img.shields.io/badge/powered%20by-bun-f9f1e1?style=flat-square&logo=bun" alt="Bun" />
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/github/license/Alshahriah/blazestack?style=flat-square&color=gray" alt="License" />
    </a>
  </p>

  <p>
    <a href="docs/getting-started.md">Getting Started</a>
    &nbsp;·&nbsp;
    <a href="docs/architecture.md">Architecture</a>
    &nbsp;·&nbsp;
    <a href="docs/packages.md">Packages</a>
    &nbsp;·&nbsp;
    <a href="docs/deploying.md">Deploying</a>
    &nbsp;·&nbsp;
    <a href="docs/troubleshooting.md">Troubleshooting</a>
  </p>
</div>

---

## What is blazestack?

blazestack is a full-stack Bun monorepo template with end-to-end type safety across web, API, and mobile — ready to deploy on Cloudflare Workers.

Scaffold a new project in seconds:

```bash
npx create-blaze my-app
```

---

## Stack

| Layer | Tech |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| API | [Hono](https://hono.dev) on [Cloudflare Workers](https://workers.cloudflare.com) |
| Web | [React Router v7](https://reactrouter.com) SSR on Cloudflare Workers |
| Mobile | [Expo SDK 55](https://expo.dev) / React Native 0.84 |
| Auth | [Better Auth](https://www.better-auth.com) |
| Database | [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL |
| RPC | [tRPC v11](https://trpc.io) — no codegen |
| Lint / Format | [Biome](https://biomejs.dev) |
| Monorepo | Bun workspaces + [Turbo](https://turbo.build) |

---

## Quick Start

```bash
# 1. Scaffold
npx create-blaze my-app
cd my-app

# 2. Install
bun install

# 3. Set up environment
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Add DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

# 4. Set up database
bun db:setup && bun db:generate && bun db:migrate

# 5. Start
bun dev:api   # terminal 1 — http://localhost:8787
bun dev:web   # terminal 2 — http://localhost:5173
```

→ Full setup guide in [docs/getting-started.md](docs/getting-started.md)

---

## Project Structure

```
my-app/
├── apps/
│   ├── api/       Hono API — auth + tRPC (Cloudflare Workers)
│   ├── web/       React Router v7 SSR (Cloudflare Workers)
│   └── mobile/    Expo — iOS + Android
└── packages/
    ├── auth/      Better Auth factory
    ├── db/        Drizzle schema + migrations
    ├── env/       Zod-validated env vars
    ├── trpc/      Shared tRPC router
    └── ui/        Shared components (web + native)
```

---

## Documentation

- [Getting Started](docs/getting-started.md) — setup, env vars, dev commands
- [Architecture](docs/architecture.md) — request flow, patterns
- [Packages](docs/packages.md) — `@blazestack/*` reference
- [Authentication](docs/authentication.md) — Better Auth, sessions, OAuth
- [Adding Features](docs/adding-features.md) — tRPC, DB tables, routes, screens
- [Deploying](docs/deploying.md) — Cloudflare Workers, EAS mobile builds
- [Troubleshooting](docs/troubleshooting.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
</div>
