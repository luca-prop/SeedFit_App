"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { ArrowLeft, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { ComparisonAptCard } from "@/components/domain/ComparisonAptCard";
import { DeepAnalysisReport } from "@/components/domain/DeepAnalysisReport";
import { ZONE_DATA, COMPARISON_APTS, type UnitType } from "@/lib/mockData";

const formatBudget = (n: number) =>
  n >= 100000000 ? `${(n / 100000000).toFixed(1)}억 원` : `${(n / 10000).toLocaleString()}만 원`;

/**
 * 1:1 대조 분석 대시보드 페이지 — Mobile-First
 * 
 * @description
 * 사용자가 선택한 재개발 구역과 가용 현금(LTV 포함)으로 진입 가능한 기축 아파트를 
 * 1:1로 비교하는 핵심 B2C 페이지입니다.
 * 
 * @mobile_first
 * - 모바일: 재개발 카드 → 기축 아파트 카드 순서로 세로 스택 (상하 스크롤)
 * - lg+: 기존 좌우 2열 그리드 유지
 * - 타입 선택기는 모바일에서 더 큰 터치 타겟 제공
 * 
 * @logic
 * - URL Params (`id`): 대상 재개발 구역 ID
 * - URL Search Params (`cash`): 사용자의 가용 현금
 * - State (`unitType`): 비교할 평형 타입 (59 or 84)
 * - State (`isRefreshing`): 데이터 새로고침 UI 상태
 * 
 * @data_flow
 * 1. `ZONE_DATA`에서 `id`에 해당하는 재개발 구역 정보를 가져옵니다.
 * 2. `COMPARISON_APTS`에서 비교 대상 기축 아파트 리스트를 가져옵니다.
 * 3. `ComparisonAptCard`와 `DeepAnalysisReport` 자식 컴포넌트에 데이터를 Props로 주입하여 렌더링합니다.
 */
function ComparisonContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const zoneId = params.id as string;
  const budget = Number(searchParams.get("budget") || "300000000");
  const zone = ZONE_DATA[zoneId] ?? ZONE_DATA["zone-1"];

  const [adjustedBudget, setAdjustedBudget] = useState(budget);
  const [showReport, setShowReport] = useState(false);
  const [unitType, setUnitType] = useState<UnitType>("84");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apts, setApts] = useState(COMPARISON_APTS);
  const isUnderBudget = adjustedBudget < 300000000;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API fetch delay
    setTimeout(() => {
      // Simulate data update
      setApts([...apts]); 
      setIsRefreshing(false);
    }, 1000);
  };

  const currentData = zone.data[unitType];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-5 md:mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/results?budget=${budget}`)} className="mb-3 md:mb-4 -ml-2 min-h-[44px]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          검색 결과로 돌아가기
        </Button>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">1:1 비교 분석 대시보드</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              <span className="font-medium text-primary">{zone.name}</span> · 기축 아파트 비교
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="min-h-[44px] self-start"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            최신 데이터 업데이트
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-3 mb-6 md:mb-8">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle className="text-sm md:text-base">참고</AlertTitle>
          <AlertDescription className="text-xs md:text-sm">도봉구 내 비교 데이터가 부족하여 인접 행정구(노원구) 기준으로 산정되었습니다.</AlertDescription>
        </Alert>

        {isUnderBudget && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm md:text-base">예산 미달 경고</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-3 mt-2">
                <span className="text-xs md:text-sm">현재 예산으로는 해당 구역 진입이 어렵습니다. 예산을 조정해 보세요.</span>
                <div className="flex items-center gap-3 w-full">
                  <Slider
                    defaultValue={[adjustedBudget]}
                    max={1000000000}
                    min={100000000}
                    step={10000000}
                    onValueChange={(v) => setAdjustedBudget(v[0])}
                    className="flex-1"
                  />
                  <span className="font-bold whitespace-nowrap text-sm">{formatBudget(adjustedBudget)}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Comparison Grid — 모바일: 세로 스택, lg+: 좌우 분할 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 md:mb-10">
        {/* Left: Redevelopment */}
        <div>
          <h2 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">재개발</span>
            {zone.name}
          </h2>
          <Card className="border-blue-200">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">핵심 투자 지표</CardTitle>
                {/* 59/84 타입 선택기 */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(["59", "84"] as UnitType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setUnitType(t)}
                      className={`px-4 py-2 md:py-1.5 text-sm font-medium transition-colors min-h-[40px] ${
                        unitType === t
                          ? "bg-primary text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      {t}타입
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-5">
              {/* 진행단계 */}
              <div className="flex justify-between items-center border-b pb-3 md:pb-4">
                <span className="text-sm md:text-base text-gray-500">진행단계</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs md:text-sm px-3 py-1">{zone.stage}</Badge>
              </div>
              {/* 조합원분양가 */}
              <div className="flex justify-between items-center border-b pb-3 md:pb-4">
                <span className="text-sm md:text-base text-gray-500">조합원분양가</span>
                <span className="text-lg md:text-xl font-bold">{currentData.unitPrice}</span>
              </div>
              {/* 프리미엄 */}
              <div className="flex justify-between items-center border-b pb-3 md:pb-4">
                <span className="text-sm md:text-base text-gray-500">프리미엄</span>
                <span className="text-lg md:text-xl font-bold text-blue-600">{currentData.premium}</span>
              </div>
              {/* 잠재 미래 가치 */}
              <div className="bg-blue-50 p-3 md:p-4 rounded-xl mt-2">
                <p className="text-xs md:text-sm text-gray-500 mb-1">잠재 미래 가치 (참조: 흑석 아크로리버하임)</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{currentData.futureValue}</p>
              </div>
              {/* 이 구역 매물 보기 버튼 */}
              <Button
                onClick={() => router.push(`/listings/${zoneId}`)}
                variant="outline"
                className="w-full mt-2 min-h-[44px]"
              >
                이 구역 매물 보기 →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Comparison Apts */}
        <div>
          <h2 className="text-base md:text-lg font-bold mb-1 flex items-center gap-2 text-gray-900">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">기축</span>
            기축 아파트 비교군
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">내 예산으로 매수 가능한 동일 행정구 아파트입니다.</p>
          <div className={`space-y-3 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {apts.map((apt) => (
              <ComparisonAptCard key={apt.id} apt={apt as any} />
            ))}
          </div>
        </div>
      </div>

      {/* Deep Report */}
      <div className="mt-8 md:mt-12">
        {!showReport ? (
          <div className="text-center">
            <Button size="lg" onClick={() => setShowReport(true)} className="min-h-[48px] text-base">심층 분석 리포트 보기</Button>
          </div>
        ) : (
          <DeepAnalysisReport />
        )}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full" /></div>}>
      <ComparisonContent />
    </Suspense>
  );
}
