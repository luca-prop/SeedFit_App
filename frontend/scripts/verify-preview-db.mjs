import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { config } from "dotenv";

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

async function main() {
  const preview = loadEnvFile(".env.preview-db");
  process.env.DATABASE_URL = preview.DATABASE_URL;
  process.env.DIRECT_URL = preview.DIRECT_URL || preview.DATABASE_URL;
  config({ path: ".env.preview-db", override: true });

  const require = createRequire(import.meta.url);
  require.cache[require.resolve("server-only")] = {
    id: require.resolve("server-only"),
    filename: require.resolve("server-only"),
    loaded: true,
    exports: {},
  };

  const { prisma } = await import("../lib/prisma.ts");
  const [zones, snapshots, ltv] = await Promise.all([
    prisma.zone.count(),
    prisma.zoneInvestmentSnapshot.count(),
    prisma.ltvPolicy.count({ where: { isActive: true } }),
  ]);

  console.log(JSON.stringify({ zones, snapshots, ltv }, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
