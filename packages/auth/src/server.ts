import type { DB } from "@erh/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

/**
 * Create a Better Auth instance.
 * Call this once at app startup (or per-worker if needed).
 */
export function createAuth(
  db: DB,
  options: { secret: string; baseUrl: string; trustedOrigins?: string[] },
) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    secret: options.secret,
    baseURL: options.baseUrl,
    trustedOrigins: options.trustedOrigins ?? [],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      // Add OAuth providers here, e.g.:
      // github: {
      //   clientId: process.env.GITHUB_CLIENT_ID!,
      //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
