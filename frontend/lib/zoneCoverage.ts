/**
 * CORE vs SUB coverage for SeedFit matching surfaces.
 *
 * Cut: 정비구역지정(및 동급) 이후 = CORE.
 * 추진위 승인·설립은 그 자체로 CORE가 아니다.
 * 진행현황에 정비구역지정 또는 관리계획고시가 날짜로 끝난 곳만 CORE.
 * 연번·대상지 등 구역지정 전 단계는 SUB.
 * Source: docs/DATA_CURATION_SPEC.v.2.md §4.1
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

/** 정비구역지정·관리계획고시가 날짜로 끝난 줄. '진행중'은 완료가 아니다. */
export function designationCompleted(progress: string | null | undefined): boolean {
  if (!progress) return false;
  for (const raw of progress.split(/\r?\n/)) {
    const line = raw.trim();
    const bar = line.indexOf("|");
    if (bar < 0) continue;
    const label = compactStage(line.slice(0, bar));
    const detail = line.slice(bar + 1).trim();
    const detailCompact = compactStage(detail);
    if (detailCompact.includes("진행중")) continue;
    if (!/\d{4}/.test(detail)) continue;
    if (label.includes("정비구역지정") || label.includes("관리계획고시")) return true;
  }
  return false;
}

/**
 * Derive coverage from business stage.
 * Explicit sheet/DB override wins when provided as CORE|SUB.
 * `progress` is the 진행현황 cell, used only for 추진위.
 */
export function deriveZoneCoverage(
  stage: string,
  override?: string | null,
  progress?: string | null,
): ZoneCoverage {
  const fromOverride = normalizeCoverageOverride(override);
  if (fromOverride) {
    return fromOverride;
  }

  const normalized = compactStage(stage);

  if (
    normalized.includes("연번") ||
    normalized.includes("신속통합기획") ||
    normalized.includes("대상지선정") ||
    normalized.includes("관리계획수립") ||
    normalized.includes("통합심의") ||
    normalized.includes("추진준비") ||
    normalized.includes("대상지철회")
  ) {
    return "SUB";
  }

  if (normalized.includes("추진위")) {
    return designationCompleted(progress) ? "CORE" : "SUB";
  }

  if (
    normalized.includes("구역지정") ||
    normalized.includes("관리계획고시") ||
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
