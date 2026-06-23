import Link from "next/link";
import { AlertTriangle, ArrowLeft, BarChart3, Search } from "lucide-react";

import { reverseFilterAction } from "@/app/actions/reverseFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  REVERSE_FILTER_CASH_STEP_KRW,
  REVERSE_FILTER_MAX_CASH_KRW,
  REVERSE_FILTER_MIN_CASH_KRW,
  type ReverseFilterBudgetStatus,
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

function ResultZoneCard({ zone }: { zone: ReverseFilterZone }) {
  const config = GROUP_CONFIG[zone.budgetStatus];

  return (
    <Card className="border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base md:text-lg">{zone.zoneName}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {zone.district} {zone.dong}
              </Badge>
              <Badge className={`text-xs ${STAGE_COLORS[zone.stage] || "bg-gray-100 text-gray-700"}`}>
                {zone.stage}
              </Badge>
            </div>
          </div>
          <Badge className={`whitespace-nowrap text-xs ${config.badgeClassName}`}>
            {config.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">실투자금 범위</p>
            <p className="mt-1 font-bold text-slate-950">
              {formatBudgetRange(zone.investmentMinKrw, zone.investmentMaxKrw)}
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs text-slate-500">필요 현금 범위</p>
            <p className="mt-1 font-bold text-blue-700">
              {formatBudgetRange(zone.requiredCashMinKrw, zone.requiredCashMaxKrw)}
            </p>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-end justify-between text-sm">
            <span className="text-slate-500">예산 적합도</span>
            <span className="font-semibold text-blue-700">{zone.matchScore}%</span>
          </div>
          <Progress value={zone.matchScore} className="h-1.5" />
        </div>
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{formatBudgetGap(zone.budgetGapKrw)}</span>
          <span>데이터 기준일 {zone.sourceDate}</span>
        </div>
        {zone.excludedReason ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{zone.excludedReason}</p>
        ) : null}
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
  const result = await reverseFilterAction({
    budgetMinKrw,
    budgetMaxKrw,
    sortBy: "budgetFit",
    sortDirection: "asc",
  });
  const scatterHref = `/app/scatter?budgetMin=${budgetMinKrw}&budgetMax=${budgetMaxKrw}`;

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
          <Link
            href={scatterHref}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            스캐터 차트로 비교
          </Link>
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

          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">예산 내</p>
                <p className="mt-1 text-2xl font-black text-emerald-700">{result.matchedZones.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">예산 근접</p>
                <p className="mt-1 text-2xl font-black text-amber-700">{result.nearZones.length}개</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">예산 초과</p>
                <p className="mt-1 text-2xl font-black text-slate-700">{result.excludedZones.length}개</p>
              </CardContent>
            </Card>
          </div>

          <ResultGroupSection status="within_budget" zones={result.matchedZones} />
          <ResultGroupSection status="near_budget" zones={result.nearZones} />
          <ResultGroupSection status="over_budget" zones={result.excludedZones} />
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
            <Link
              href={scatterHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              스캐터 차트 보기
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
