import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const result = spawnSync(
  "npx",
  ["--yes", "create-db", "create", "-r", "ap-southeast-1", "-t", "24h", "-j"],
  { encoding: "utf8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

const combined = `${result.stdout}\n${result.stderr}`;
const start = combined.indexOf("{");
const end = combined.lastIndexOf("}");
if (start < 0 || end < start) {
  console.error("create-db JSON output not found");
  console.error(combined.slice(0, 500));
  process.exit(1);
}

const payload = JSON.parse(combined.slice(start, end + 1));
writeFileSync(
  ".env.preview-db",
  [
    `DATABASE_URL="${payload.connectionString}"`,
    `DIRECT_URL="${payload.connectionString}"`,
    `CLAIM_URL="${payload.claimUrl}"`,
    "",
  ].join("\n"),
);

const host = (payload.connectionString.match(/@([^/:]+)/) || [])[1] ?? null;
writeFileSync(
  ".create-db.meta.json",
  JSON.stringify(
    {
      success: payload.success,
      deletionDate: payload.deletionDate,
      projectId: payload.projectId,
      region: payload.region,
      claimUrl: payload.claimUrl,
      host,
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify({
    ok: true,
    host,
    deletionDate: payload.deletionDate,
    projectId: payload.projectId,
  }),
);
