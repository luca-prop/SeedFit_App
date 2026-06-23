import Link from "next/link";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";

import { reverseFilterAction } from "@/app/actions/reverseFilter";
import { ResultsScatterExplorer } from "@/components/b2c/ResultsScatterExplorer";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  REVERSE_FILTER_CASH_STEP_KRW,
  REVERSE_FILTER_MAX_CASH_KRW,
  REVERSE_FILTER_MIN_CASH_KRW,
  type ReverseFilterBudgetStatus,
  type ReverseFilterSortBy,
  type ReverseFilterSortDirection,
  type ReverseFilterZone,
} from "@/lib/reverseFilterDto";

const STAGE_COLORS: Record<string, string> = {
  "조합설립인가": "bg-blue-100 text-blue-800",
  "정비구역지정": "bg-indigo-100 text-indigo-800",
  "정비구역 지정": "bg-indigo-100 text-indigo-800",
  "연번 부여": "bg-gray-100 text-gray-800",
  "연변 부여": "bg-gray-100 text-gray-800",
  "시공사선정": "bg-yellow-100 text-yellow-800",
  "시공사 선정": "bg-yellow-100 text-yellow-800",
  "사업시행인가": "bg-emerald-100 text-emerald-800",
  "관리처분인가": "bg-purple-100 text-purple-800",
  "신속통합기획 대상지 선정": "bg-cyan-100 text-cyan-800",
  "신속통합기획 완료": "bg-teal-100 text-teal-800",
  "신속통합기획 확정": "bg-teal-100 text-teal-800",
  "사업시행자 지정": "bg-orange-100 text-orange-800",
  "추진위 승인": "bg-amber-100 text-amber-800",
  "추진위설립": "bg-amber-100 text-amber-800",
  "(모아)통합심의통과": "bg-teal-100 text-teal-800",
  "(모아)관리계획고시": "bg-indigo-100 text-indigo-800",
  "(모아)관리계획수립": "bg-indigo-100 text-indigo-800",
  "(모아)대상지 선정": "bg-cyan-100 text-cyan-800",
};

const GROUP_CONFIG: Record<
  ReverseFilterBudgetStatus,
  { title: string; description: string; badgeClassName: string; emptyText: string }
> = {
  within_budget: {
    title: "예산 내 진입 가능",
    description: "최소 실투자금이 입력한 예산 범위 안에 들어오는 구역입니다.",
    badgeClassName: "bg-emerald-100 text-emerald-800",
    emptyText: "현재 예산 범위 안에 들어오는 구역이 없습니다.",
  },
  near_budget: {
    title: "예산 근접",
    description: "예산 상한을 조금 넘지만, MVP 근접 기준 안에 들어오는 후보입니다.",
    badgeClassName: "bg-amber-100 text-amber-800",
    emptyText: "예산 근접 구역이 없습니다.",
  },
  over_budget: {
    title: "예산 초과",
    description: "현재 예산으로는 진입이 어려운 구역입니다. 비교 참고용으로만 봅니다.",
    badgeClassName: "bg-slate-100 text-slate-700",
    emptyText: "예산 초과 구역이 없습니다.",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS = [
  { value: "budgetFitAsc", label: "예산 적합도 높은 순", sortBy: "budgetFit", sortDirection: "asc" },
  { value: "investmentMinAsc", label: "최소 실투자금 낮은 순", sortBy: "investmentMin", sortDirection: "asc" },
  { value: "investmentMaxAsc", label: "최대 실투자금 낮은 순", sortBy: "investmentMax", sortDirection: "asc" },
  { value: "zoneNameAsc", label: "구역명 가나다순", sortBy: "zoneName", sortDirection: "asc" },
] satisfies Array<{
  value: string;
  label: string;
  sortBy: ReverseFilterSortBy;
  sortDirection: ReverseFilterSortDirection;
}>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function roundToStep(value: number): number {
  return Math.round(value / REVERSE_FILTER_CASH_STEP_KRW) * REVERSE_FILTER_CASH_STEP_KRW;
}

function normalizeBudgetValue(value: number): number {
  const rounded = roundToStep(value);

  return Math.min(REVERSE_FILTER_MAX_CASH_KRW, Math.max(REVERSE_FILTER_MIN_CASH_KRW, rounded));
}

function parseBudgetRange(searchParams: SearchParams) {
  const budgetMinParam = Number(firstParam(searchParams.budgetMin));
  const budgetMaxParam = Number(firstParam(searchParams.budgetMax));
  const legacyBudgetParam = Number(firstParam(searchParams.budget));
  const hasRange = Number.isFinite(budgetMinParam) && Number.isFinite(budgetMaxParam);
  const hasLegacyBudget = Number.isFinite(legacyBudgetParam);
  const rawMin = hasRange ? budgetMinParam : hasLegacyBudget ? legacyBudgetParam : 100_000_000;
  const rawMax = hasRange ? budgetMaxParam : hasLegacyBudget ? legacyBudgetParam : 300_000_000;
  const budgetMinKrw = normalizeBudgetValue(Math.min(rawMin, rawMax));
  const budgetMaxKrw = normalizeBudgetValue(Math.max(rawMin, rawMax));

  return {
    budgetMinKrw,
    budgetMaxKrw,
  };
}

function parseFilterValue(searchParams: SearchParams, key: string) {
  const value = firstParam(searchParams[key]);

  return value && value.trim().length > 0 ? value.trim() : "all";
}

function parseCsvFilter(searchParams: SearchParams, key: string) {
  const value = firstParam(searchParams[key]);

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSortOption(searchParams: SearchParams) {
  const sortParam = firstParam(searchParams.sort);

  return SORT_OPTIONS.find((option) => option.value === sortParam) ?? SORT_OPTIONS[0];
}

function formatBudget(value: number) {
  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatBudgetRange(minKrw: number, maxKrw: number | null) {
  if (maxKrw === null || minKrw === maxKrw) {
    return formatBudget(minKrw);
  }

  return `${formatBudget(minKrw)} ~ ${formatBudget(maxKrw)}`;
}

function formatBudgetGap(value: number) {
  if (value === 0) {
    return "예산 범위 내";
  }

  const prefix = value > 0 ? "예산 하한보다 낮음" : "예산 상한 대비 부족";

  return `${prefix} ${formatBudget(Math.abs(value))}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function stageAxisLabelFor(stage: string) {
  const normalized = stage.replace(/\s+/g, "");

  if (normalized.includes("착공")) return "착공";
  if (normalized.includes("이주") || normalized.includes("철거")) return "이주철거";
  if (normalized.includes("관리처분")) return "관리처분";
  if (normalized.includes("사업시행")) return "사업시행";
  if (normalized.includes("시공사") || normalized.includes("건축심의")) return "시공사";
  if (normalized.includes("조합설립") || normalized.includes("사업시행자지정")) return "조합설립";
  if (normalized.includes("구역지정") || normalized.includes("관리계획고시") || normalized.includes("추진위")) {
    return "구역지정";
  }

  return "추진준비";
}

function filterZones(zones: ReverseFilterZone[], selectedDistricts: string[], selectedStageLabels: string[]) {
  return zones.filter((zone) => {
    const districtMatched = selectedDistricts.length === 0 || selectedDistricts.includes(zone.district);
    const stageMatched = selectedStageLabels.length === 0 || selectedStageLabels.includes(stageAxisLabelFor(zone.stage));

    return districtMatched && stageMatched;
  });
}

function ResultZoneCard({ zone }: { zone: ReverseFilterZone }) {
  const config = GROUP_CONFIG[zone.budgetStatus];

  return (
    <Card
      id={`zone-card-${zone.zoneId}`}
      className="scroll-mt-6 border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-slate-950 md:text-base">{zone.zoneName}</h3>
              <Badge variant="secondary" className="text-[11px]">
                {zone.district} {zone.dong}
              </Badge>
              <Badge className={`text-[11px] ${config.badgeClassName}`}>{config.title}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                필요 현금 <strong className="text-blue-700">{formatBudgetRange(zone.requiredCashMinKrw, zone.requiredCashMaxKrw)}</strong>
              </span>
              <span>
                X축 단계 <strong className="text-slate-800">{stageAxisLabelFor(zone.stage)}</strong>
              </span>
              <span>
                적합도 <strong className="text-slate-800">{zone.matchScore}%</strong>
              </span>
              <span>{formatBudgetGap(zone.budgetGapKrw)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`text-[11px] ${STAGE_COLORS[zone.stage] || "bg-gray-100 text-gray-700"}`}>
                세부: {zone.stage}
              </Badge>
              <span className="text-[11px] text-slate-400">데이터 기준일 {zone.sourceDate}</span>
            </div>
          </div>
          <Link
            href={`/app/comparison/${zone.zoneId}`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            같은 예산 기축단지 비교
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultGroupSection({
  status,
  zones,
}: {
  status: ReverseFilterBudgetStatus;
  zones: ReverseFilterZone[];
}) {
  const config = GROUP_CONFIG[status];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{config.title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {config.description} <span className="font-semibold text-slate-900">{zones.length}개</span>
        </p>
      </div>
      {zones.length > 0 ? (
        <div className="space-y-2">
          {zones.map((zone) => (
            <ResultZoneCard key={`${status}-${zone.zoneId}`} zone={zone} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed bg-white">
          <CardContent className="p-6 text-sm text-slate-500">{config.emptyText}</CardContent>
        </Card>
      )}
    </section>
  );
}

export default async function ResultsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { budgetMinKrw, budgetMaxKrw } = parseBudgetRange(resolvedSearchParams);
  const legacyDistrict = parseFilterValue(resolvedSearchParams, "district");
  const legacyStage = parseFilterValue(resolvedSearchParams, "stage");
  const selectedDistricts = parseCsvFilter(resolvedSearchParams, "districts");
  const selectedStageGroups = parseCsvFilter(resolvedSearchParams, "stageGroups");
  const selectedSort = parseSortOption(resolvedSearchParams);
  const result = await reverseFilterAction({
    budgetMinKrw,
    budgetMaxKrw,
    sortBy: selectedSort.sortBy,
    sortDirection: selectedSort.sortDirection,
  });
  const visibleZones = result.ok ? [...result.matchedZones, ...result.nearZones] : [];
  const effectiveDistricts = selectedDistricts.length > 0 ? selectedDistricts : legacyDistrict !== "all" ? [legacyDistrict] : [];
  const effectiveStageGroups =
    selectedStageGroups.length > 0 ? selectedStageGroups : legacyStage !== "all" ? [stageAxisLabelFor(legacyStage)] : [];
  const filteredMatchedZones = result.ok ? filterZones(result.matchedZones, effectiveDistricts, effectiveStageGroups) : [];
  const filteredNearZones = result.ok ? filterZones(result.nearZones, effectiveDistricts, effectiveStageGroups) : [];
  const visibleResultCount = filteredMatchedZones.length + filteredNearZones.length;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
      <div className="mb-5 md:mb-6">
        <Link
          href="/"
          className="mb-3 inline-flex min-h-10 items-center rounded-lg px-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          예산 다시 입력하기
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950 md:text-2xl">Reverse Filter 검색 결과</h1>
            <p className="mt-1 text-sm text-slate-500 md:text-base">
              예산 범위{" "}
              <span className="font-semibold text-slate-950">
                {formatBudget(budgetMinKrw)} ~ {formatBudget(budgetMaxKrw)}
              </span>{" "}
              기준
            </p>
          </div>
        </div>
      </div>

      {result.ok ? (
        <div className="space-y-8">
          <Alert className="border-blue-200 bg-blue-50 text-blue-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm md:text-base">최신 큐레이션 데이터</AlertTitle>
            <AlertDescription className="text-xs md:text-sm">
              데이터 동기화 기준일: {formatDateTime(result.dataSyncedAt)}. {result.disclaimer}
            </AlertDescription>
          </Alert>

          <ResultsScatterExplorer
            zones={visibleZones}
            budgetMinKrw={budgetMinKrw}
            budgetMaxKrw={budgetMaxKrw}
            selectedDistricts={effectiveDistricts}
            selectedStageGroups={effectiveStageGroups}
            selectedSort={selectedSort.value}
            sortOptions={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">예산 내</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{filteredMatchedZones.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">예산 근접</p>
                <p className="mt-1 text-2xl font-black text-amber-700">{filteredNearZones.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">표시 결과</p>
                <p className="mt-1 text-2xl font-black text-blue-700">{visibleResultCount}개</p>
              </CardContent>
            </Card>
          </div>

          <ResultGroupSection status="within_budget" zones={filteredMatchedZones} />
          <ResultGroupSection status="near_budget" zones={filteredNearZones} />
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center border-dashed bg-white p-8 text-center md:p-12">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold md:text-xl">{result.message}</h3>
          <p className="mb-6 text-sm text-slate-500 md:text-base">
            입력값 또는 데이터 준비 상태를 확인한 뒤 다시 검색해 주세요.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              예산 다시 입력하기
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
