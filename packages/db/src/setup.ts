import { config } from "dotenv";
import postgres from "postgres";

config(); // load .env if present

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

// Parse DB name from URL so we can connect to `postgres` (default db) first
const parsed = new URL(url);
const dbName = parsed.pathname.slice(1); // remove leading /

if (!dbName) throw new Error("DATABASE_URL must include a database name");

// Connect to the default `postgres` database to run CREATE DATABASE
parsed.pathname = "/postgres";
const adminUrl = parsed.toString();

console.log(`Ensuring database "${dbName}" exists...`);

const sql = postgres(adminUrl, { max: 1 });

try {
  // Check if DB exists
  const result = await sql`
    SELECT 1 FROM pg_database WHERE datname = ${dbName}
  `;

  if (result.length === 0) {
    // CREATE DATABASE doesn't support parameterized queries — use safe identifier
    await sql.unsafe(`CREATE DATABASE "${dbName.replace(/"/g, "")}"`);
    console.log(`Database "${dbName}" created.`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }
} finally {
  await sql.end();
}
