import Link from "next/link";
import { ArrowLeft, Building2, FileText, Landmark, TrendingUp } from "lucide-react";

import { comparisonDataAction } from "@/app/actions/comparisonData";
import { ComparisonAssetCard } from "@/components/domain/ComparisonAssetCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ComparisonPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function appendIfPresent(params: URLSearchParams, key: string, value: string | undefined) {
  if (value && value.trim().length > 0) {
    params.set(key, value);
  }
}

function buildResultsHref(searchParams: SearchParams) {
  const params = new URLSearchParams();

  appendIfPresent(params, "budgetMin", firstParam(searchParams.budgetMin));
  appendIfPresent(params, "budgetMax", firstParam(searchParams.budgetMax));
  appendIfPresent(params, "budget", firstParam(searchParams.budget));
  appendIfPresent(params, "sort", firstParam(searchParams.sort));
  appendIfPresent(params, "districts", firstParam(searchParams.districts));
  appendIfPresent(params, "stageGroups", firstParam(searchParams.stageGroups));

  const query = params.toString();

  return query ? `/app/results?${query}` : "/app/results";
}

function buildLtvModelHref(zoneId: string, searchParams: SearchParams, ltvModel: "firstHome70" | "general40") {
  const params = new URLSearchParams();

  appendIfPresent(params, "budgetMin", firstParam(searchParams.budgetMin));
  appendIfPresent(params, "budgetMax", firstParam(searchParams.budgetMax));
  appendIfPresent(params, "budget", firstParam(searchParams.budget));
  appendIfPresent(params, "sort", firstParam(searchParams.sort));
  appendIfPresent(params, "districts", firstParam(searchParams.districts));
  appendIfPresent(params, "stageGroups", firstParam(searchParams.stageGroups));
  appendIfPresent(params, "zoneName", firstParam(searchParams.zoneName));
  params.set("ltvModel", ltvModel);

  return `/app/comparison/${zoneId}?${params.toString()}`;
}

function formatKrw(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "업데이트 예정";
  }

  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatKrwRange(minKrw: number | null | undefined, maxKrw: number | null | undefined) {
  if (minKrw === null || minKrw === undefined) {
    return "업데이트 예정";
  }
  if (maxKrw === null || maxKrw === undefined || minKrw === maxKrw) {
    return formatKrw(minKrw);
  }

  return `${formatKrw(minKrw)} ~ ${formatKrw(maxKrw)}`;
}

function formatCashDelta(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "비교 대기";
  }
  if (value === 0) {
    return "실투자금과 동일";
  }

  return value > 0 ? `${formatKrw(value)} 여유` : `${formatKrw(Math.abs(value))} 부족`;
}

function formatProjectType(value: string | null) {
  if (!value) {
    return "정비사업";
  }

  const normalized = value.toLowerCase();

  if (normalized === "redevelopment" || value === "재개발") return "재개발";
  if (normalized === "reconstruction" || value === "재건축") return "재건축";

  return value;
}

function normalizeLtvModel(value: string | undefined) {
  return value === "general40" ? "general40" : "firstHome70";
}

function formatLtvModel(value: "firstHome70" | "general40") {
  return value === "firstHome70" ? "생애최초 LTV 70%" : "일반 LTV 40%";
}

export default async function ComparisonPage({ params, searchParams }: ComparisonPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const result = await comparisonDataAction({
    zoneId: id,
    zoneName: firstParam(resolvedSearchParams.zoneName),
    ltvModel: normalizeLtvModel(firstParam(resolvedSearchParams.ltvModel)),
  });
  const resultsHref = buildResultsHref(resolvedSearchParams);

  if (!result.ok) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link href={resultsHref} className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          검색 결과로 돌아가기
        </Link>
        <Card className="border-dashed bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-lg font-black text-slate-950">{result.message}</p>
            <p className="mt-2 text-sm text-slate-500">다른 구역을 선택하거나 결과 목록에서 다시 진입해 주세요.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { zone, ltvModel, comparisonAssets, summary } = result;
  const firstHomeHref = buildLtvModelHref(id, resolvedSearchParams, "firstHome70");
  const generalHref = buildLtvModelHref(id, resolvedSearchParams, "general40");

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
      <div className="mb-5 md:mb-6">
        <Link href={resultsHref} className="mb-3 inline-flex min-h-10 items-center rounded-lg px-1 text-sm font-medium text-slate-500 transition hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          검색 결과로 돌아가기
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">{zone.district}</Badge>
              <Badge variant="secondary">{zone.dong}</Badge>
              {zone.projectType ? <Badge variant="outline">{formatProjectType(zone.projectType)}</Badge> : null}
            </div>
            <h1 className="text-2xl font-black text-slate-950 md:text-3xl">같은 실투자금 기축단지 비교</h1>
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-bold text-slate-900">{zone.zoneName}</span>의 최소 실투자금으로 진입 가능한 기축 대조군을 비교합니다.
            </p>
          </div>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm">
            <Link
              href={firstHomeHref}
              className={`rounded-lg px-3 py-2 transition ${
                ltvModel === "firstHome70" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              생애최초 70%
            </Link>
            <Link
              href={generalHref}
              className={`rounded-lg px-3 py-2 transition ${
                ltvModel === "general40" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              일반 40%
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <Landmark className="h-4 w-4 text-blue-600" />
              사업 단계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-950">{zone.stage}</p>
            <p className="mt-2 text-xs text-slate-500">데이터 기준일 {zone.sourceDate ?? "업데이트 예정"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              구역 실투자금
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-950">
              {formatKrwRange(zone.investmentMinKrw, zone.investmentMaxKrw)}
            </p>
            <p className="mt-2 text-xs text-slate-500">대조군 기축 단지 매칭의 기준값입니다.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <Building2 className="h-4 w-4 text-indigo-600" />
              기축 대조군
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-950">{summary.comparisonAssetCount}개</p>
            <p className="mt-2 text-xs text-slate-500">
              최고 후보 매매가 {formatKrw(summary.highestCandidatePriceKrw)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              비교 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              {zone.zoneName}의 최소 실투자금은{" "}
              <span className="font-bold text-slate-950">{formatKrw(zone.investmentMinKrw)}</span>입니다.
            </p>
            <p>
              적용 시나리오는{" "}
              <span className="font-bold text-slate-950">{formatLtvModel(ltvModel)}</span>입니다.
            </p>
            <p>
              가장 가까운 대조군의 필요 실투자금은{" "}
              <span className="font-bold text-slate-950">{formatKrw(summary.closestRequiredCashKrw)}</span>이고,{" "}
              <span className="font-bold text-slate-950">{formatCashDelta(summary.closestCashDeltaKrw)}</span>
              입니다.
            </p>
            <Badge className="bg-indigo-100 text-indigo-800">DATA_CURATION_SPEC 3. Comparison Assets 기준</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              진입 가능한 기축 대조군
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comparisonAssets.length > 0 ? (
              <div className="space-y-3">
                {comparisonAssets.map((asset) => (
                  <ComparisonAssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                구역 최소 실투자금 또는 대조군 기축 데이터가 업데이트되면 비교 결과가 표시됩니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
