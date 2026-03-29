<div align="center">

<img src="https://s6.imgcdn.dev/Y2Bbiu.png" alt="blazestack" width="200" />

<h3>create-blaze</h3>
<p>Scaffold a new <a href="https://github.com/Alshahriah/blazestack">blazestack</a> project in seconds.</p>

[![npm version](https://img.shields.io/npm/v/create-blaze?style=for-the-badge&logo=npm&logoColor=white&color=f97316)](https://www.npmjs.com/package/create-blaze)
[![npm downloads](https://img.shields.io/npm/dm/create-blaze?style=for-the-badge&logo=npm&logoColor=white&color=f97316)](https://www.npmjs.com/package/create-blaze)
[![License](https://img.shields.io/github/license/Alshahriah/blazestack?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=22c55e)](https://github.com/Alshahriah/blazestack/blob/main/LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.1+-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

```bash
npx create-blaze my-app
```

</div>

---

## Usage

```bash
# With a name
npx create-blaze my-app

# Without a name — defaults to my-blazestack-app
# Auto-increments if the directory already exists
npx create-blaze
```

## What it does

1. Downloads the latest blazestack template from GitHub
2. Copies it to `./<project-name>/`
3. Renames all package references to match your project name
4. Prints next steps

## Next steps after scaffolding

```bash
cd my-app
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

bun db:setup && bun db:generate && bun db:migrate

bun dev:api   # API  → http://localhost:8787
bun dev:web   # Web  → http://localhost:5173
```

## What's in the scaffold

```
my-app/
├── apps/
│   ├── api/       Hono — Better Auth + tRPC (Cloudflare Workers)
│   ├── web/       React Router v7 SSR (Cloudflare Workers)
│   └── mobile/    Expo SDK 55 — iOS + Android
└── packages/
    ├── auth/      Better Auth factory
    ├── db/        Drizzle ORM + PostgreSQL
    ├── env/       Zod-validated env vars
    ├── trpc/      Shared tRPC v11 router
    └── ui/        Shared UI components (web + native)
```

## Stack

<table>
  <tr>
    <td><img src="https://img.shields.io/badge/Bun-000000?style=flat-square&logo=bun&logoColor=white" /></td>
    <td>Runtime & package manager</td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white" /></td>
    <td>API on Cloudflare Workers</td>
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
</table>

---

## Full documentation

See the [blazestack repo](https://github.com/Alshahriah/blazestack) for full documentation.
