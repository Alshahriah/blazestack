#!/usr/bin/env bun
import { copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const src = join(import.meta.dir, "..");
const dest = import.meta.dir;

const files = readdirSync(src).filter((f) => f.endsWith(".md"));
for (const file of files) {
  copyFileSync(join(src, file), join(dest, file));
  console.log(`  synced ${file}`);
}
