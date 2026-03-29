import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Runtime env for Cloudflare Workers — pass `c.env` from Hono context.
 * Call this inside request handlers, not at module level.
 */
export function createApiEnv(env: Record<string, string | undefined>) {
  return createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      BETTER_AUTH_SECRET: z.string().min(32),
      BETTER_AUTH_URL: z.string().url(),
    },
    runtimeEnv: env,
    emptyStringAsUndefined: true,
  });
}

export type ApiEnv = ReturnType<typeof createApiEnv>;
