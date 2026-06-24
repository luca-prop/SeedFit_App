import { calculateEntryCost } from "@/lib/acquisitionCostCore";
import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";
import {
  getReverseFilterNearBudgetLimitKrw,
  type ReverseFilterBudgetStatus,
  type ReverseFilterInput,
  type ReverseFilterSortBy,
  type ReverseFilterSortDirection,
  type ReverseFilterZone,
} from "@/lib/reverseFilterDto";

export const REVERSE_FILTER_GROUP_LIMIT = 30;
export const REVERSE_FILTER_DISCLAIMER = MVP_DATA_DISCLOSURE.disclaimer;

export type ReverseFilterSnapshotCandidate = {
  zoneId: string;
  zoneName: string;
  district: string;
  dong: string;
  stage: string;
  projectType: string | null;
  salePriceMinKrw: bigint | null;
  salePriceMaxKrw: bigint | null;
  investmentMinKrw: bigint | null;
  investmentMaxKrw: bigint | null;
  sourceDate: Date;
};

export type ReverseFilterCalculationOptions = {
  acquisitionTaxRateBps?: number;
  additionalCostsKrw?: bigint;
};

function bigintToSafeNumber(value: bigint): number {
  const converted = Number(value);

  if (!Number.isSafeInteger(converted)) {
    throw new RangeError("KRW value exceeds Number.MAX_SAFE_INTEGER");
  }

  return converted;
}

function dateToIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculateRequiredCashKrw(
  baseInvestmentKrw: bigint,
  salePriceKrw: bigint | null,
  options: ReverseFilterCalculationOptions,
): bigint {
  return calculateEntryCost({
    baseInvestmentKrw,
    acquisitionBasePriceKrw: salePriceKrw ?? baseInvestmentKrw,
    acquisitionTaxRateBps: options.acquisitionTaxRateBps ?? 0,
    additionalCosts:
      options.additionalCostsKrw && options.additionalCostsKrw > BigInt(0)
        ? [{ label: "additionalCosts", amountKrw: options.additionalCostsKrw }]
        : [],
  }).totalRequiredCashKrw;
}

function classifyBudgetStatus(input: ReverseFilterInput, requiredCashMinKrw: number): ReverseFilterBudgetStatus {
  if (requiredCashMinKrw >= input.budgetMinKrw && requiredCashMinKrw <= input.budgetMaxKrw) {
    return "within_budget";
  }

  const nearLimitKrw = getReverseFilterNearBudgetLimitKrw(input.budgetMaxKrw);
  const overBudgetGapKrw = requiredCashMinKrw - input.budgetMaxKrw;

  return overBudgetGapKrw > 0 && overBudgetGapKrw <= nearLimitKrw ? "near_budget" : "over_budget";
}

function matchScoreForStatus(status: ReverseFilterBudgetStatus): number {
  if (status === "within_budget") {
    return 100;
  }
  if (status === "near_budget") {
    return 70;
  }

  return 0;
}

function compareNullableNumbers(left: number | null, right: number | null): number {
  if (left === right) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }

  return left - right;
}

function compareZones(left: ReverseFilterZone, right: ReverseFilterZone, sortBy: ReverseFilterSortBy): number {
  if (sortBy === "investmentMin") {
    return left.investmentMinKrw - right.investmentMinKrw;
  }
  if (sortBy === "investmentMax") {
    return compareNullableNumbers(left.investmentMaxKrw, right.investmentMaxKrw);
  }
  if (sortBy === "stage") {
    return left.stage.localeCompare(right.stage, "ko");
  }
  if (sortBy === "zoneName") {
    return left.zoneName.localeCompare(right.zoneName, "ko");
  }

  const statusDiff = right.matchScore - left.matchScore;
  if (statusDiff !== 0) {
    return statusDiff;
  }

  return Math.abs(left.budgetGapKrw) - Math.abs(right.budgetGapKrw);
}

function calculateBudgetGapKrw(input: ReverseFilterInput, requiredCashMinKrw: number): number {
  if (requiredCashMinKrw < input.budgetMinKrw) {
    return input.budgetMinKrw - requiredCashMinKrw;
  }
  if (requiredCashMinKrw > input.budgetMaxKrw) {
    return input.budgetMaxKrw - requiredCashMinKrw;
  }

  return 0;
}

function sortZones(
  zones: ReverseFilterZone[],
  sortBy: ReverseFilterSortBy,
  direction: ReverseFilterSortDirection,
): ReverseFilterZone[] {
  const directionFactor = direction === "asc" ? 1 : -1;

  return [...zones].sort((left, right) => {
    const primary = compareZones(left, right, sortBy);
    if (primary !== 0) {
      return primary * directionFactor;
    }

    return left.zoneName.localeCompare(right.zoneName, "ko");
  });
}

export function buildReverseFilterZone(
  candidate: ReverseFilterSnapshotCandidate,
  input: ReverseFilterInput,
  options: ReverseFilterCalculationOptions = {},
): ReverseFilterZone | null {
  if (candidate.investmentMinKrw === null) {
    return null;
  }

  // MVP-014부터 예산 검색은 최소~최대 범위에 들어오는 실투자금을 우선 매칭합니다.
  const requiredCashMinKrw = calculateRequiredCashKrw(
    candidate.investmentMinKrw,
    candidate.salePriceMinKrw,
    options,
  );
  const requiredCashMaxKrw =
    candidate.investmentMaxKrw === null
      ? null
      : calculateRequiredCashKrw(candidate.investmentMaxKrw, candidate.salePriceMaxKrw, options);
  const requiredCashMinNumber = bigintToSafeNumber(requiredCashMinKrw);
  const budgetStatus = classifyBudgetStatus(input, requiredCashMinNumber);
  const budgetGapKrw = calculateBudgetGapKrw(input, requiredCashMinNumber);

  return {
    zoneId: candidate.zoneId,
    zoneName: candidate.zoneName,
    district: candidate.district,
    dong: candidate.dong,
    stage: candidate.stage,
    projectType: candidate.projectType,
    investmentMinKrw: bigintToSafeNumber(candidate.investmentMinKrw),
    investmentMaxKrw: candidate.investmentMaxKrw === null ? null : bigintToSafeNumber(candidate.investmentMaxKrw),
    requiredCashMinKrw: requiredCashMinNumber,
    requiredCashMaxKrw: requiredCashMaxKrw === null ? null : bigintToSafeNumber(requiredCashMaxKrw),
    budgetGapKrw,
    budgetStatus,
    matchScore: matchScoreForStatus(budgetStatus),
    sourceDate: dateToIsoDate(candidate.sourceDate),
    excludedReason:
      budgetStatus === "over_budget"
        ? requiredCashMinNumber < input.budgetMinKrw
          ? "예산 범위 미만"
          : "예산 초과"
        : null,
  };
}

export function buildReverseFilterGroups(
  candidates: ReverseFilterSnapshotCandidate[],
  input: ReverseFilterInput,
  options: ReverseFilterCalculationOptions = {},
) {
  const zones = candidates
    .filter((candidate) => input.interestedDistricts.length === 0 || input.interestedDistricts.includes(candidate.district))
    .map((candidate) => buildReverseFilterZone(candidate, input, options))
    .filter((zone): zone is ReverseFilterZone => zone !== null);

  const matchedZones = sortZones(
    zones.filter((zone) => zone.budgetStatus === "within_budget"),
    input.sortBy,
    input.sortDirection,
  ).slice(0, REVERSE_FILTER_GROUP_LIMIT);
  const nearZones = sortZones(
    zones.filter((zone) => zone.budgetStatus === "near_budget"),
    input.sortBy,
    input.sortDirection,
  ).slice(0, REVERSE_FILTER_GROUP_LIMIT);
  const excludedZones = sortZones(
    zones.filter((zone) => zone.budgetStatus === "over_budget"),
    input.sortBy,
    input.sortDirection,
  )
    .slice(0, REVERSE_FILTER_GROUP_LIMIT)
    .map((zone) => ({
      ...zone,
      budgetStatus: "over_budget" as const,
      excludedReason: zone.excludedReason ?? "예산 초과",
    }));

  return {
    matchedZones,
    nearZones,
    excludedZones,
    totalMatchedCount: matchedZones.length,
  };
}
