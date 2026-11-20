import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, FileText, Landmark, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferenceApartmentComparisonCard } from "@/components/domain/ReferenceApartmentComparisonCard";
import { FallbackDataBanner, SetZoneAsOf } from "@/components/domain/zoneAsOf";
import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";
import { findFallbackZone, getFallbackSourceDate } from "@/lib/reverseFilterFallback";
import { EVENT_TYPES, recordEvent } from "@/lib/analytics/events";
import { prisma } from "@/lib/prisma";

type ZoneDetailPageProps = {
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

function buildComparisonHref(zoneId: string, zoneName: string, searchParams: SearchParams) {
  const params = new URLSearchParams();

  appendIfPresent(params, "budgetMin", firstParam(searchParams.budgetMin));
  appendIfPresent(params, "budgetMax", firstParam(searchParams.budgetMax));
  appendIfPresent(params, "budget", firstParam(searchParams.budget));
  appendIfPresent(params, "sort", firstParam(searchParams.sort));
  params.set("zoneName", zoneName);

  return `/app/comparison/${zoneId}?${params.toString()}`;
}

function formatProjectType(value: string | null) {
  if (!value) {
    return "정비사업";
  }

  const normalized = value.toLowerCase();

  if (normalized === "redevelopment" || value === "재개발") {
    return "재개발";
  }
  if (normalized === "reconstruction" || value === "재건축") {
    return "재건축";
  }

  return value;
}

function formatKrw(value: bigint | null | undefined) {
  if (value === null || value === undefined) {
    return "업데이트 예정";
  }

  const eok = Number(value) / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatKrwRange(minKrw: bigint | null | undefined, maxKrw: bigint | null | undefined) {
  if (minKrw === null || minKrw === undefined) {
    return "업데이트 예정";
  }
  if (maxKrw === null || maxKrw === undefined || minKrw === maxKrw) {
    return formatKrw(minKrw);
  }

  return `${formatKrw(minKrw)} ~ ${formatKrw(maxKrw)}`;
}

function isoDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "업데이트 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function toSafeKrwNumber(value: bigint | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const converted = Number(value);

  if (!Number.isSafeInteger(converted)) {
    throw new RangeError("KRW value exceeds Number.MAX_SAFE_INTEGER");
  }

  return converted;
}

export default async function ZoneDetailLitePage({ params, searchParams }: ZoneDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const resultsHref = buildResultsHref(resolvedSearchParams);
  let zone: Awaited<ReturnType<typeof prisma.zone.findUnique<{
    where: { id: string };
    include: {
      investmentSnapshots: { orderBy: { sourceDate: "desc" }; take: 1 };
      referenceApartments: {
        orderBy: { priority: "asc" };
        include: { referenceApartment: true };
      };
    };
  }>>> | null = null;
  try {
    zone = await prisma.zone.findUnique({
      where: {
        id,
      },
      include: {
        investmentSnapshots: {
          orderBy: {
            sourceDate: "desc",
          },
          take: 1,
        },
        referenceApartments: {
          orderBy: {
            priority: "asc",
          },
          include: {
            referenceApartment: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("zone detail database path failed; using curated seed fallback", error);
    const fallbackDate = getFallbackSourceDate();
    const fallbackZone = findFallbackZone(id);

    return (
      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
        <SetZoneAsOf date={fallbackZone?.sourceDate ?? fallbackDate} fallback />
        <Link
          href={resultsHref}
          className="mb-3 inline-flex min-h-10 items-center rounded-lg px-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          검색 결과로 돌아가기
        </Link>
        <FallbackDataBanner date={fallbackDate} />
        {fallbackZone ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">구역</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-black text-slate-950">{fallbackZone.zoneName}</p>
                <p className="mt-2 text-xs text-slate-500">{fallbackZone.district} {fallbackZone.dong}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">사업 단계</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-black text-slate-950">{fallbackZone.stage}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">실투자금 범위</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-black text-slate-950">
                  {formatKrwRange(BigInt(fallbackZone.investmentMinKrw), fallbackZone.investmentMaxKrw === null ? null : BigInt(fallbackZone.investmentMaxKrw))}
                </p>
                <p className="mt-2 text-xs text-slate-500">이 금액은 {fallbackZone.sourceDate} 예비 파일 기준입니다.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-slate-600">이 구역은 예비 파일에 없습니다.</p>
        )}
      </div>
    );
  }

  if (!zone) {
    notFound();
  }

  await recordEvent({
    eventType: EVENT_TYPES.zoneDetailOpened,
    zoneId: zone.id,
    path: `/app/zones/${zone.id}`,
    props: { zoneName: zone.zoneName, district: zone.district, stage: zone.stage },
  });

  const snapshot = zone.investmentSnapshots[0];
  const investmentRange = formatKrwRange(snapshot?.investmentMinKrw, snapshot?.investmentMaxKrw);
  const projectTypeLabel = formatProjectType(zone.projectType);
  const comparisonHref = buildComparisonHref(zone.id, zone.zoneName, resolvedSearchParams);
  const hexafitHref = `/app/hexafit?zones=${encodeURIComponent(zone.zoneName)}`;
  const featureNotes = [
    zone.notes,
    `${zone.district} ${zone.dong}의 ${projectTypeLabel} 구역입니다.`,
    `${zone.stage} 단계 기준으로 후속 인허가와 사업 속도를 함께 확인해야 합니다.`,
    `운영팀 큐레이션 기준 실투자금 범위는 ${investmentRange}입니다.`,
  ].filter((note): note is string => Boolean(note));

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
      {snapshot ? <SetZoneAsOf date={isoDate(snapshot.sourceDate)} /> : null}
      <div className="mb-6">
        <Link
          href={resultsHref}
          className="mb-3 inline-flex min-h-10 items-center rounded-lg px-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          검색 결과로 돌아가기
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">{zone.district}</Badge>
              <Badge variant="secondary">{zone.dong}</Badge>
              {zone.projectType ? <Badge variant="outline">{projectTypeLabel}</Badge> : null}
            </div>
            <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{zone.zoneName}</h1>
            <p className="mt-2 text-sm text-slate-500">구역 기본 정보와 최신 실투자금 범위를 빠르게 확인하는 Lite 화면입니다.</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={comparisonHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              같은 예산 기축단지 비교
            </Link>
            <Link
              href={hexafitHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              육각형으로 비교
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
            <p className="mt-2 text-xs text-slate-500">진행 단계는 구역 큐레이션 데이터 기준입니다.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              실투자금 범위
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-950">{investmentRange}</p>
            <p className="mt-2 text-xs text-slate-500">필요 현금은 세금·대출 조건에 따라 달라질 수 있습니다.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4 text-amber-600" />
              데이터 기준일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-black text-slate-950">{formatDate(snapshot?.sourceDate)}</p>
            <p className="mt-2 text-xs text-slate-500">{MVP_DATA_DISCLOSURE.sourceFileBasis}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              특징 및 확인 포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-600">
              {featureNotes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              기축 레퍼런스
            </CardTitle>
          </CardHeader>
          <CardContent>
            {zone.referenceApartments.length > 0 ? (
              <div className="space-y-3">
                {zone.referenceApartments.map(({ id: relationId, referenceApartment, reason }) => (
                  <ReferenceApartmentComparisonCard
                    key={relationId}
                    apartmentName={referenceApartment.apartmentName}
                    currentPriceKrw={toSafeKrwNumber(referenceApartment.currentPriceKrw)}
                    isPresale={referenceApartment.isPresale}
                    reason={reason}
                    zoneInvestmentMinKrw={toSafeKrwNumber(snapshot?.investmentMinKrw)}
                    zoneInvestmentMaxKrw={toSafeKrwNumber(snapshot?.investmentMaxKrw)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">연결된 기축 레퍼런스는 운영팀 검수 후 업데이트됩니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
