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
import { extract } from "tar";

const REPO_OWNER = "Alshahriah";
const REPO_NAME = "blazestack";
const REPO_BRANCH = "main";

// Files/dirs to exclude from the scaffolded project
const EXCLUDE = new Set(["node_modules", ".git", "bun.lock", "packages/create-blaze"]);

// Extensions that are safe to do text replacement on
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
  // Handle extensionless dotfiles like .env.example, .dev.vars.example
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
  // com.my-app.app -> com.myapp.app (dots and alphanumeric only)
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
  // Exclude top-level entries in EXCLUDE set
  if (EXCLUDE.has(parts[0])) return true;
  // Exclude packages/create-blaze specifically
  if (parts[0] === "packages" && parts[1] === "create-blaze") return true;
  return false;
}

function copyDir(src: string, dest: string, name: string) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, name);
    } else {
      if (isTextFile(srcPath)) {
        const content = readFileSync(srcPath, "utf8");
        writeFileSync(destPath, replaceTokens(content, name), "utf8");
      } else {
        // Binary file — copy as-is
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

function dirExists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const input = process.argv[2];
  const DEFAULT_NAME = "my-blazestack-app";

  const rawName = input ?? DEFAULT_NAME;
  const baseName = sanitizeName(rawName);

  if (!baseName) {
    console.error(`Invalid project name: "${rawName}"`);
    process.exit(1);
  }

  // If directory exists, append incrementing number
  let safeName = baseName;
  let counter = 1;
  while (dirExists(join(process.cwd(), safeName))) {
    safeName = `${baseName}-${counter}`;
    counter++;
  }

  if (safeName !== baseName) {
    console.log(`\n  "${baseName}" already exists — using "${safeName}" instead.`);
  }

  const targetDir = join(process.cwd(), safeName);

  const tarUrl = `https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/refs/heads/${REPO_BRANCH}`;
  const tmpFile = join(tmpdir(), `create-blaze-${Date.now()}.tar.gz`);
  const tmpExtract = join(tmpdir(), `create-blaze-${Date.now()}`);

  console.log(`\nCreating ${safeName}...\n`);

  try {
    process.stdout.write("  Downloading template...");
    await download(tarUrl, tmpFile);
    console.log(" done");

    process.stdout.write("  Extracting...");
    mkdirSync(tmpExtract, { recursive: true });
    await extract({ file: tmpFile, cwd: tmpExtract });
    console.log(" done");

    // GitHub tarballs extract to <repo>-<branch>/
    const extractedRoot = join(tmpExtract, `${REPO_NAME}-${REPO_BRANCH}`);

    process.stdout.write("  Scaffolding project...");
    mkdirSync(targetDir, { recursive: true });

    const entries = readdirSync(extractedRoot);
    for (const entry of entries) {
      if (shouldExclude(entry)) continue;
      const srcPath = join(extractedRoot, entry);
      const destPath = join(targetDir, entry);
      const stat = statSync(srcPath);
      if (stat.isDirectory()) {
        // For packages dir, skip create-blaze subfolder
        if (entry === "packages") {
          mkdirSync(destPath, { recursive: true });
          for (const pkg of readdirSync(srcPath)) {
            if (pkg === "create-blaze") continue;
            copyDir(join(srcPath, pkg), join(destPath, pkg), safeName);
          }
        } else {
          copyDir(srcPath, destPath, safeName);
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
    console.log(" done");
  } finally {
    // Cleanup temp files
    try {
      rmSync(tmpFile, { force: true });
    } catch {}
    try {
      rmSync(tmpExtract, { recursive: true, force: true });
    } catch {}
  }

  console.log(`
  Done! Next steps:

    cd ${safeName}
    bun install
    cp apps/api/.dev.vars.example apps/api/.dev.vars
    # Edit apps/api/.dev.vars with your DATABASE_URL and BETTER_AUTH_SECRET
    bun db:setup && bun db:generate && bun db:migrate
    bun dev:api    # terminal 1 — API on http://localhost:8787
    bun dev:web    # terminal 2 — web on http://localhost:5173
`);
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
