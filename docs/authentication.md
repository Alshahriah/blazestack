# Authentication

Auth is handled by [Better Auth](https://www.better-auth.com) on the Hono API at `/api/auth/**`.

## How it works

1. **Sign up / sign in** — clients POST to `/api/auth/sign-up/email` or `/api/auth/sign-in/email`
2. **Session cookie** — Better Auth sets a `better-auth.session_token` cookie
3. **tRPC context** — each request calls `auth.api.getSession()` to extract the session
4. **Protected procedures** — `protectedProcedure` throws `UNAUTHORIZED` if session is null
5. **Email verification** — disabled by default. Enable in `packages/auth/src/server.ts`.

## Web

```ts
import { signIn, signUp, signOut, useSession } from "~/lib/auth-client";

const { data: session } = useSession();
await signIn.email({ email, password });
await signOut();
```

## Mobile

```ts
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";

const { data: session } = useSession();
await signIn.email({ email, password });
await signOut();
```

The `AuthGate` in `apps/mobile/app/_layout.tsx` redirects unauthenticated users to `/sign-in` automatically.

## Adding a production origin

```ts
// apps/api/src/index.ts
const TRUSTED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8081",
  "https://your-web-app.pages.dev", // add here
];
```

## Adding OAuth (e.g. GitHub)

1. Update `packages/auth/src/server.ts`:
```ts
socialProviders: {
  github: {
    clientId: options.githubClientId,
    clientSecret: options.githubClientSecret,
  },
},
```
2. Pass credentials through `createAuth(db, { ..., githubClientId, githubClientSecret })`
3. Set secrets: `wrangler secret put GITHUB_CLIENT_ID --cwd apps/api`
