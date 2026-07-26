import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

const envPath = resolve(process.cwd(), ".env.preview-db");
if (!existsSync(envPath)) {
  console.error("Missing .env.preview-db");
  process.exit(1);
}

const fileEnv = loadEnvFile(envPath);
const env = {
  ...process.env,
  DATABASE_URL: fileEnv.DATABASE_URL,
  DIRECT_URL: fileEnv.DIRECT_URL || fileEnv.DATABASE_URL,
};

console.log("Running prisma db push...");
const push = spawnSync("npx", ["prisma", "db", "push", "--accept-data-loss"], {
  encoding: "utf8",
  shell: true,
  env,
});
process.stdout.write(push.stdout || "");
process.stderr.write(push.stderr || "");
if (push.status !== 0) process.exit(push.status ?? 1);

const seedPath = resolve(process.cwd(), "../data/seed/seed_mvp_data.sql");
console.log("Seeding SQL...");
const seed = spawnSync(
  "npx",
  ["prisma", "db", "execute", "--file", seedPath],
  {
    encoding: "utf8",
    shell: true,
    env,
  },
);
process.stdout.write(seed.stdout || "");
process.stderr.write(seed.stderr || "");
if (seed.status !== 0) process.exit(seed.status ?? 1);

console.log("Schema + seed completed");
