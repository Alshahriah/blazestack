#!/usr/bin/env node
import {
  createWriteStream,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { get } from "node:https";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import kleur from "kleur";
import { extract } from "tar";

const REPO_OWNER = "Alshahriah";
const REPO_NAME = "blazestack";
const REPO_BRANCH = "main";
const VERSION = "0.3.0";

const EXCLUDE = new Set([
  "node_modules",
  ".git",
  "bun.lock",
  "packages/create-blaze",
  "docs",
  "assets",
  ".vscode",
  "scripts",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "README.md", // replaced with a project-specific one
]);
const EXCLUDE_FILES = new Set([".github/workflows/publish.yml"]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".jsonc",
  ".toml",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".html",
  ".env",
  ".txt",
  ".gitignore",
  ".gitattributes",
]);

function isTextFile(filePath: string): boolean {
  const ext = extname(filePath);
  const base = basename(filePath);
  if (ext === "" || base.startsWith(".")) return true;
  return TEXT_EXTENSIONS.has(ext);
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDbName(name: string): string {
  return name.replace(/-/g, "_");
}

function toBundleId(name: string): string {
  const safe = name.replace(/-/g, "");
  return `com.${safe}.app`;
}

function replaceTokens(content: string, name: string): string {
  const dbName = toDbName(name);
  const bundleId = toBundleId(name);

  return content
    .replace(/blazestack-api\.your-subdomain/g, `${name}-api.your-subdomain`)
    .replace(/@blazestack\//g, `@${name}/`)
    .replace(/blazestack-api/g, `${name}-api`)
    .replace(/blazestack-web/g, `${name}-web`)
    .replace(/blazestack-pg/g, `${name}-pg`)
    .replace(/blazestack_db/g, `${dbName}_db`)
    .replace(/com\.blazestack\.app/g, bundleId)
    .replace(/"name": "blazestack"/g, `"name": "${name}"`)
    .replace(/# blazestack\b/g, `# ${name}`)
    .replace(/# Contributing to blazestack/g, `# Contributing to ${name}`)
    .replace(/^blazestack\/$/gm, `${name}/`)
    .replace(/cd blazestack\b/g, `cd ${name}`);
}

function shouldExclude(relPath: string): boolean {
  const parts = relPath.split(/[\/\\]/);
  if (EXCLUDE.has(parts[0])) return true;
  if (parts[0] === "packages" && parts[1] === "create-blaze") return true;
  const normalized = relPath.replace(/\\/g, "/");
  if (EXCLUDE_FILES.has(normalized)) return true;
  return false;
}

function copyDir(src: string, dest: string, name: string, relBase = "") {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const relPath = relBase ? `${relBase}/${entry}` : entry;
    if (EXCLUDE_FILES.has(relPath)) continue;
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, name, relPath);
    } else {
      if (isTextFile(srcPath)) {
        const content = readFileSync(srcPath, "utf8");
        writeFileSync(destPath, replaceTokens(content, name), "utf8");
      } else {
        const buf = readFileSync(srcPath);
        writeFileSync(destPath, buf);
      }
    }
  }
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const request = (u: string) =>
      get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.destroy();
          request(res.headers.location ?? "");
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      }).on("error", reject);
    request(url);
  });
}

function generateReadme(name: string): string {
  return `# ${name}

Scaffolded with [create-blaze](https://github.com/Alshahriah/blazestack) — a full-stack Bun monorepo with end-to-end type safety.

## Stack

- **API** — Hono on Cloudflare Workers
- **Web** — React Router v7 SSR on Cloudflare Workers
- **Mobile** — Expo SDK 55 (iOS + Android)
- **Auth** — Better Auth
- **Database** — Drizzle ORM + PostgreSQL
- **RPC** — tRPC v11 (no codegen)

## Getting started

\`\`\`bash
bun install
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

bun db:setup && bun db:generate && bun db:migrate

bun dev:api   # API  → http://localhost:8787
bun dev:web   # Web  → http://localhost:5173
bun dev:mobile # Mobile (optional)
\`\`\`

## Structure

\`\`\`
${name}/
├── apps/
│   ├── api/       Hono API — auth + tRPC
│   ├── web/       React Router v7 SSR
│   └── mobile/    Expo — iOS + Android
└── packages/
    ├── auth/      Better Auth factory
    ├── db/        Drizzle schema + migrations
    ├── env/       Zod-validated env vars
    ├── trpc/      Shared tRPC router
    └── ui/        Shared components (web + native)
\`\`\`

## Commands

\`\`\`bash
bun dev:api          # Start API
bun dev:web          # Start web app
bun dev:mobile       # Start mobile app
bun db:generate      # Generate migrations
bun db:migrate       # Run migrations
bun db:studio        # Open Drizzle Studio
bun lint             # Lint check
bun lint:fix         # Auto-fix lint
\`\`\`
`;
}

function dirExists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function step(label: string) {
  process.stdout.write(`  ${kleur.cyan("◆")} ${label.padEnd(30)}`);
}

function stepDone() {
  process.stdout.write(`${kleur.green("✓")}\n`);
}

function stepFail() {
  process.stdout.write(`${kleur.red("✗")}\n`);
}

async function main() {
  const input = process.argv[2];
  const DEFAULT_NAME = "my-blazestack-app";

  const rawName = input ?? DEFAULT_NAME;
  const baseName = sanitizeName(rawName);

  if (!baseName) {
    console.error(kleur.red(`\n  Invalid project name: "${rawName}"\n`));
    process.exit(1);
  }

  // Auto-increment if directory exists
  let safeName = baseName;
  let counter = 1;
  while (dirExists(join(process.cwd(), safeName))) {
    safeName = `${baseName}-${counter}`;
    counter++;
  }

  const targetDir = join(process.cwd(), safeName);
  const tarUrl = `https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/refs/heads/${REPO_BRANCH}`;
  const tmpFile = join(tmpdir(), `create-blaze-${Date.now()}.tar.gz`);
  const tmpExtract = join(tmpdir(), `create-blaze-${Date.now()}`);

  // Header
  console.log();
  console.log(`  ${kleur.bgCyan().black(` create-blaze v${VERSION} `)}`);
  console.log();

  if (safeName !== baseName) {
    console.log(
      `  ${kleur.yellow("!")} ${kleur.dim(`"${baseName}" already exists — using "${safeName}" instead.`)}`,
    );
    console.log();
  }

  console.log(`  Scaffolding ${kleur.cyan().bold(safeName)}...`);
  console.log();

  try {
    step("Downloading template");
    await download(tarUrl, tmpFile);
    stepDone();

    step("Extracting");
    mkdirSync(tmpExtract, { recursive: true });
    await extract({ file: tmpFile, cwd: tmpExtract });
    stepDone();

    step("Setting up project");
    const extractedRoot = join(tmpExtract, `${REPO_NAME}-${REPO_BRANCH}`);
    mkdirSync(targetDir, { recursive: true });

    const entries = readdirSync(extractedRoot);
    for (const entry of entries) {
      if (shouldExclude(entry)) continue;
      const srcPath = join(extractedRoot, entry);
      const destPath = join(targetDir, entry);
      const stat = statSync(srcPath);
      if (stat.isDirectory()) {
        if (entry === "packages") {
          mkdirSync(destPath, { recursive: true });
          for (const pkg of readdirSync(srcPath)) {
            if (pkg === "create-blaze") continue;
            copyDir(join(srcPath, pkg), join(destPath, pkg), safeName, `packages/${pkg}`);
          }
        } else {
          copyDir(srcPath, destPath, safeName, entry);
        }
      } else {
        if (isTextFile(srcPath)) {
          const content = readFileSync(srcPath, "utf8");
          writeFileSync(destPath, replaceTokens(content, safeName), "utf8");
        } else {
          writeFileSync(destPath, readFileSync(srcPath));
        }
      }
    }
    stepDone();

    // Write project-specific README
    writeFileSync(join(targetDir, "README.md"), generateReadme(safeName), "utf8");
  } catch (err) {
    stepFail();
    throw err;
  } finally {
    try {
      rmSync(tmpFile, { force: true });
    } catch {}
    try {
      rmSync(tmpExtract, { recursive: true, force: true });
    } catch {}
  }

  console.log();
  console.log(`  ${kleur.green().bold("Ready!")} Your project is set up.`);
  console.log();
  console.log(`  ${kleur.dim("Next steps:")}`);
  console.log();
  console.log(`    ${kleur.yellow(`cd ${safeName}`)}`);
  console.log(`    ${kleur.yellow("bun install")}`);
  console.log(`    ${kleur.yellow("cp apps/api/.dev.vars.example apps/api/.dev.vars")}`);
  console.log(`    ${kleur.dim("# add DATABASE_URL + BETTER_AUTH_SECRET to .dev.vars")}`);
  console.log(`    ${kleur.yellow("bun db:setup && bun db:generate && bun db:migrate")}`);
  console.log();
  console.log(
    `    ${kleur.yellow("bun dev:api")}  ${kleur.dim("─")}  ${kleur.dim("API")}  ${kleur.dim("→")}  ${kleur.cyan("http://localhost:8787")}`,
  );
  console.log(
    `    ${kleur.yellow("bun dev:web")}  ${kleur.dim("─")}  ${kleur.dim("Web")}  ${kleur.dim("→")}  ${kleur.cyan("http://localhost:5173")}`,
  );
  console.log();
}

main().catch((err) => {
  console.error(`\n  ${kleur.red("Error:")} ${err.message}\n`);
  process.exit(1);
});
