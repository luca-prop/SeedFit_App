/**
 * CORE vs SUB coverage for SeedFit matching surfaces.
 *
 * Cut: 정비구역지정(및 동급) 이후 = CORE.
 * 추진위는 구역지정 이후이므로 CORE.
 * 신통 확정·완료·모아 통합심의 등 구역지정 전 = SUB.
 * Source of stage taxonomy: docs/Phase2_scatter_chart검토.md
 */

export type ZoneCoverage = "CORE" | "SUB";

export function normalizeCoverageOverride(value: string | null | undefined): ZoneCoverage | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === "CORE" || normalized === "SUB") {
    return normalized;
  }
  return null;
}

/** Compact stage string for keyword checks. */
function compactStage(stage: string): string {
  return stage.replace(/\s+/g, "");
}

/**
 * Derive coverage from business stage.
 * Explicit sheet/DB override wins when provided as CORE|SUB.
 */
export function deriveZoneCoverage(stage: string, override?: string | null): ZoneCoverage {
  const fromOverride = normalizeCoverageOverride(override);
  if (fromOverride) {
    return fromOverride;
  }

  const normalized = compactStage(stage);

  // CORE first: 구역지정 동급·이후 (모아 관리계획고시 = 구역지정 축)
  if (
    normalized.includes("구역지정") ||
    normalized.includes("관리계획고시") ||
    normalized.includes("추진위") ||
    normalized.includes("조합설립") ||
    normalized.includes("사업시행자지정") ||
    normalized.includes("시공사") ||
    normalized.includes("건축심의") ||
    normalized.includes("사업시행인가") ||
    normalized.includes("관리처분") ||
    normalized.includes("이주") ||
    normalized.includes("철거") ||
    normalized.includes("착공")
  ) {
    return "CORE";
  }

  // SUB: 구역지정 전 추진준비 축
  if (
    normalized.includes("연번") ||
    normalized.includes("신속통합기획") ||
    normalized.includes("대상지선정") ||
    normalized.includes("관리계획수립") ||
    normalized.includes("통합심의") ||
    normalized.includes("추진준비")
  ) {
    return "SUB";
  }

  // Unknown later-looking stages default to CORE (safer for matching trust).
  return "CORE";
}

export function filterZonesByCoverage<T extends { coverage: ZoneCoverage }>(
  zones: T[],
  includeSub: boolean,
): T[] {
  if (includeSub) {
    return zones;
  }
  return zones.filter((zone) => zone.coverage === "CORE");
}
