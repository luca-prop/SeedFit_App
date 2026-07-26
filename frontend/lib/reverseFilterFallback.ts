import seed from "@/lib/data/mvpReverseFilterSeed.json";
import type { ReverseFilterSnapshotCandidate } from "@/lib/reverseFilterCore";

type SeedCandidate = {
  zoneId: string;
  zoneName: string;
  district: string;
  dong: string;
  stage: string;
  projectType: string | null;
  salePriceMinKrw: number | null;
  salePriceMaxKrw: number | null;
  investmentMinKrw: number;
  investmentMaxKrw: number | null;
  sourceDate: string;
};

function toBigIntOrNull(value: number | null): bigint | null {
  return value === null ? null : BigInt(value);
}

export function listFallbackZoneSnapshots(): ReverseFilterSnapshotCandidate[] {
  return (seed.candidates as SeedCandidate[]).map((candidate) => ({
    zoneId: candidate.zoneId,
    zoneName: candidate.zoneName,
    district: candidate.district,
    dong: candidate.dong,
    stage: candidate.stage,
    projectType: candidate.projectType,
    salePriceMinKrw: toBigIntOrNull(candidate.salePriceMinKrw),
    salePriceMaxKrw: toBigIntOrNull(candidate.salePriceMaxKrw),
    investmentMinKrw: BigInt(candidate.investmentMinKrw),
    investmentMaxKrw: toBigIntOrNull(candidate.investmentMaxKrw),
    sourceDate: new Date(`${candidate.sourceDate}T00:00:00.000Z`),
  }));
}

export function getFallbackDataSyncedAt(): string {
  return new Date(`${seed.sourceDate}T00:00:00.000Z`).toISOString();
}
