import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "../..");
const sourcePath = join(root, "data/normalized/golden_samples260823.normalized.json");
const outputPath = join(__dirname, "../lib/data/mvpReverseFilterSeed.json");

// Keep in sync with scripts/data/generate_mvp_seed_sql.py
const NAMESPACE = "b1be6f42-2a3a-47b0-8bfb-4b65a8a5f5ed";

function uuidToBytes(uuid) {
  const hex = uuid.replace(/-/g, "");
  const bytes = Buffer.alloc(16);
  for (let i = 0; i < 16; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToUuid(bytes) {
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function uuid5(name) {
  const ns = uuidToBytes(NAMESPACE);
  const hash = createHash("sha1").update(Buffer.concat([ns, Buffer.from(name, "utf8")])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  return bytesToUuid(hash.subarray(0, 16));
}

function deterministicUuid(kind, naturalKey) {
  return uuid5(`${kind}:${naturalKey}`);
}

const raw = JSON.parse(readFileSync(sourcePath, "utf8"));
const zoneByKey = new Map(raw.zones.map((zone) => [zone.naturalKey, zone]));

const candidates = [];
for (const snap of raw.zoneInvestmentSnapshots) {
  const zone = zoneByKey.get(snap.zoneNaturalKey);
  if (!zone || snap.investmentMinKrw == null) {
    continue;
  }

  candidates.push({
    zoneId: deterministicUuid("zone", zone.naturalKey),
    zoneName: zone.zoneName,
    district: zone.district,
    dong: zone.dong,
    stage: zone.stage,
    coverage: zone.coverage === "CORE" || zone.coverage === "SUB" ? zone.coverage : "CORE",
    projectType: zone.projectType ?? null,
    salePriceMinKrw: snap.salePriceMinKrw ?? null,
    salePriceMaxKrw: snap.salePriceMaxKrw ?? null,
    investmentMinKrw: snap.investmentMinKrw,
    investmentMaxKrw: snap.investmentMaxKrw ?? null,
    sourceDate: snap.sourceDate,
  });
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      sourceDate: raw.source.sourceDate,
      candidates,
    },
    null,
    2,
  )}\n`,
);

const sample = candidates.find((item) => item.zoneName === "청파 1구역");
console.log(
  JSON.stringify({
    outputPath,
    candidates: candidates.length,
    sourceDate: raw.source.sourceDate,
    sampleZoneId: sample?.zoneId ?? null,
  }),
);
