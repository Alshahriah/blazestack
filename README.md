<div align="center">

<img src="./assets/logo.png" alt="blazestack" width="200" />

<p><strong>Blazing fast full-stack apps.</strong><br/>Ship web, API, and mobile from a single repo — end-to-end type safe, Cloudflare-ready.</p>

[![npm version](https://img.shields.io/npm/v/create-blaze?style=for-the-badge&logo=npm&logoColor=white&color=f97316&label=create-blaze)](https://www.npmjs.com/package/create-blaze)
[![npm downloads](https://img.shields.io/npm/dm/create-blaze?style=for-the-badge&logo=npm&logoColor=white&color=f97316)](https://www.npmjs.com/package/create-blaze)
[![License](https://img.shields.io/github/license/Alshahriah/blazestack?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=22c55e)](./LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.1+-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

```bash
npx create-blaze my-app
```

[Getting Started](docs/getting-started.md) · [Architecture](docs/architecture.md) · [Packages](docs/packages.md) · [Deploying](docs/deploying.md) · [Troubleshooting](docs/troubleshooting.md)

</div>

---

## What is blazestack?

blazestack is a production-ready Bun monorepo template. One command gives you a fully wired full-stack app with auth, a database, and type-safe API — ready to deploy on Cloudflare Workers.

```
my-app/
├── apps/
│   ├── api/       Hono — auth + tRPC on Cloudflare Workers
│   ├── web/       React Router v7 SSR on Cloudflare Workers
│   └── mobile/    Expo SDK 55 — iOS + Android
└── packages/
    ├── auth/      Better Auth (server + client)
    ├── db/        Drizzle ORM + PostgreSQL
    ├── env/       Zod-validated environment variables
    ├── trpc/      Shared tRPC v11 router — no codegen
    └── ui/        Shared components (web + native)
```

---

## Stack

<table>
  <tr>
    <td><img src="https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white" /></td>
    <td>Runtime & package manager</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white" /></td>
    <td>API server on Cloudflare Workers</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/React_Router_v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white" /></td>
    <td>SSR web app on Cloudflare Workers</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" /></td>
    <td>iOS + Android (SDK 55 / RN 0.84)</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Better_Auth-000000?style=flat-square&logo=auth0&logoColor=white" /></td>
    <td>Authentication & sessions</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black" /></td>
    <td>PostgreSQL ORM + migrations</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/tRPC_v11-2596BE?style=flat-square&logo=trpc&logoColor=white" /></td>
    <td>End-to-end type-safe API — no codegen</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white" /></td>
    <td>Deploy target for API + web</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Biome-60A5FA?style=flat-square&logo=biome&logoColor=white" /></td>
    <td>Linter + formatter (replaces ESLint + Prettier)</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Turbo-000000?style=flat-square&logo=turborepo&logoColor=white" /></td>
    <td>Monorepo task runner with caching</td>
  </tr>
</table>

---

## Quick Start

```bash
# Scaffold
npx create-blaze my-app
cd my-app

# Install
bun install

# Environment
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

# Database
bun db:setup && bun db:generate && bun db:migrate

# Dev
bun dev:api   # → http://localhost:8787
bun dev:web   # → http://localhost:5173
```

→ Full guide in [docs/getting-started.md](docs/getting-started.md)

---

## Documentation

| | |
|---|---|
| [Getting Started](docs/getting-started.md) | Setup, env vars, dev commands |
| [Architecture](docs/architecture.md) | Request flow, key patterns |
| [Packages](docs/packages.md) | `@blazestack/*` API reference |
| [Authentication](docs/authentication.md) | Sessions, OAuth, trusted origins |
| [Adding Features](docs/adding-features.md) | tRPC, DB tables, routes, screens |
| [Deploying](docs/deploying.md) | Cloudflare Workers, EAS, Hyperdrive |
| [Troubleshooting](docs/troubleshooting.md) | Common errors and fixes |

---

## Contributing

PRs and issues are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
