import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    ...options,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
  return result;
}

const cwd = process.cwd();
const previewEnvPath = resolve(cwd, ".env.preview-db");
if (!existsSync(previewEnvPath)) {
  console.error("Missing .env.preview-db");
  process.exit(1);
}

const previewEnv = loadEnvFile(previewEnvPath);
const databaseUrl = previewEnv.DATABASE_URL;
const directUrl = previewEnv.DIRECT_URL || previewEnv.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL missing in .env.preview-db");
  process.exit(1);
}

for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  console.log(`Removing existing Preview ${key} (ignore if absent)...`);
  spawnSync("npx", ["vercel", "env", "rm", key, "preview", "--yes"], {
    encoding: "utf8",
    shell: true,
  });
}

console.log("Adding Preview DATABASE_URL...");
run("npx", ["vercel", "env", "add", "DATABASE_URL", "preview", "--sensitive"], {
  input: `${databaseUrl}\n`,
});

console.log("Adding Preview DIRECT_URL...");
run("npx", ["vercel", "env", "add", "DIRECT_URL", "preview", "--sensitive"], {
  input: `${directUrl}\n`,
});

// Keep local .env.local aligned for the same Preview DB.
const localEnvPath = resolve(cwd, ".env.local");
if (existsSync(localEnvPath)) {
  const original = readFileSync(localEnvPath, "utf8");
  let next = original;
  if (/^DATABASE_URL=.*/m.test(next)) {
    next = next.replace(/^DATABASE_URL=.*/m, `DATABASE_URL="${databaseUrl}"`);
  } else {
    next = `DATABASE_URL="${databaseUrl}"\n${next}`;
  }
  if (/^DIRECT_URL=.*/m.test(next)) {
    next = next.replace(/^DIRECT_URL=.*/m, `DIRECT_URL="${directUrl}"`);
  } else {
    next = `${next.trimEnd()}\nDIRECT_URL="${directUrl}"\n`;
  }
  writeFileSync(localEnvPath, next);
  console.log("Updated local .env.local DATABASE_URL/DIRECT_URL");
}

console.log(
  JSON.stringify({
    ok: true,
    host: (databaseUrl.match(/@([^/:]+)/) || [])[1] ?? null,
  }),
);
