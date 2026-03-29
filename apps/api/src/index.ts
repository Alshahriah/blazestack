import { createAuth } from "@blazestack/auth/server";
import { createDb } from "@blazestack/db";
import { appRouter } from "@blazestack/trpc/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

export type Env = {
  DATABASE_URL: string;
  NODE_ENV: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  // HYPERDRIVE: Hyperdrive; // Uncomment when using Cloudflare Hyperdrive
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:8081"],
    credentials: true,
  }),
);

const TRUSTED_ORIGINS = ["http://localhost:5173", "http://localhost:8081"];

// Better Auth — handles /api/auth/* routes
app.on(["GET", "POST"], "/api/auth/**", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const auth = createAuth(db, {
    secret: c.env.BETTER_AUTH_SECRET,
    baseUrl: c.env.BETTER_AUTH_URL,
    trustedOrigins: TRUSTED_ORIGINS,
  });
  return auth.handler(c.req.raw);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: async (_opts, c) => {
      const db = createDb(c.env.DATABASE_URL);
      const auth = createAuth(db, {
        secret: c.env.BETTER_AUTH_SECRET,
        baseUrl: c.env.BETTER_AUTH_URL,
        trustedOrigins: TRUSTED_ORIGINS,
      });
      const sessionData = await auth.api.getSession({ headers: c.req.raw.headers });
      return {
        db,
        session: sessionData
          ? { userId: sessionData.user.id, email: sessionData.user.email }
          : null,
      };
    },
  }),
);

app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

export default app;
