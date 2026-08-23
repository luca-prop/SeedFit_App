import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

function loadEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
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

async function main() {
  const envFile = process.argv.includes("--supabase-prod")
    ? ".env.supabase-prod"
    : ".env.preview-db";
  const preview = loadEnvFile(envFile);
  // Prefer direct for verification queries
  process.env.DATABASE_URL = preview.DIRECT_URL || preview.DATABASE_URL;
  process.env.DIRECT_URL = preview.DIRECT_URL || preview.DATABASE_URL;

  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("../generated/prisma/client.js");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const [zones, snaps, ltv, coverage] = await Promise.all([
    prisma.zone.count(),
    prisma.zoneInvestmentSnapshot.count(),
    prisma.ltvPolicy.count({ where: { isActive: true } }),
    prisma.zone.groupBy({ by: ["coverage"], _count: true }),
  ]);

  console.log(
    JSON.stringify(
      {
        zones,
        snaps,
        ltv,
        coverage: Object.fromEntries(coverage.map((row) => [row.coverage ?? "null", row._count])),
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
