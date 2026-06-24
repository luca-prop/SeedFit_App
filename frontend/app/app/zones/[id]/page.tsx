import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, FileText, Landmark, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferenceApartmentComparisonCard } from "@/components/domain/ReferenceApartmentComparisonCard";
import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";
import { prisma } from "@/lib/prisma";

type ZoneDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function ZoneDetailLitePage({ params }: ZoneDetailPageProps) {
  const { id } = await params;
  const zone = await prisma.zone.findUnique({
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

  if (!zone) {
    notFound();
  }

  const snapshot = zone.investmentSnapshots[0];
  const investmentRange = formatKrwRange(snapshot?.investmentMinKrw, snapshot?.investmentMaxKrw);
  const featureNotes = [
    zone.notes,
    `${zone.district} ${zone.dong}의 ${zone.projectType ?? "정비사업"} 후보입니다.`,
    `${zone.stage} 단계 기준으로 후속 인허가와 사업 속도를 함께 확인해야 합니다.`,
    `운영팀 큐레이션 기준 실투자금 범위는 ${investmentRange}입니다.`,
  ].filter((note): note is string => Boolean(note));

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
      <div className="mb-6">
        <Link
          href="/app/results"
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
              {zone.projectType ? <Badge variant="outline">{zone.projectType}</Badge> : null}
            </div>
            <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{zone.zoneName}</h1>
            <p className="mt-2 text-sm text-slate-500">구역 기본 정보와 최신 실투자금 범위를 빠르게 확인하는 Lite 화면입니다.</p>
          </div>
          <Link
            href={`/app/comparison/${zone.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            같은 예산 기축단지 비교
          </Link>
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
                    currentPriceKrw={referenceApartment.currentPriceKrw}
                    isPresale={referenceApartment.isPresale}
                    reason={reason}
                    zoneInvestmentMinKrw={snapshot?.investmentMinKrw ?? null}
                    zoneInvestmentMaxKrw={snapshot?.investmentMaxKrw ?? null}
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
