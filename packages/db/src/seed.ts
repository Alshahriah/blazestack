import { config } from "dotenv";
import { createDb } from "./client";
import { notes } from "./schema/index";

config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

console.log("Seeding database...");

// Users must be created via the Better Auth sign-up endpoint, not inserted directly.
// Direct insertion into `user` skips account/password row creation — those users
// cannot sign in. Use the API to create users first:
//
//   POST http://localhost:8787/api/auth/sign-up/email
//   { "name": "Alice", "email": "alice@example.com", "password": "password123" }
//
// Then set SEED_USER_ID to the returned user ID to seed demo notes.

const SEED_USER_ID = process.env.SEED_USER_ID;

if (SEED_USER_ID) {
  await db
    .insert(notes)
    .values([
      {
        id: "note-seed-1",
        userId: SEED_USER_ID,
        title: "Welcome to ERH",
        body: "This is a seed note. Edit or delete it anytime.",
      },
    ])
    .onConflictDoNothing();
  console.log(`Seeded notes for user ${SEED_USER_ID}.`);
} else {
  console.log(
    "No SEED_USER_ID set — skipping note seed. Set SEED_USER_ID=<user-id> to seed notes.",
  );
}

console.log("Seed complete.");
process.exit(0);
