import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

/**
 * Create a Drizzle DB instance from a connection URL.
 * Call this at request time (e.g. in tRPC context factory),
 * not at module load time — safe for both Bun server and Cloudflare Workers.
 */
export function createDb(databaseUrl: string) {
  const sql = postgres(databaseUrl, {
    max: 1, // keep low for serverless — use Hyperdrive on Cloudflare
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(sql, { schema });
}

export type DB = ReturnType<typeof createDb>;
