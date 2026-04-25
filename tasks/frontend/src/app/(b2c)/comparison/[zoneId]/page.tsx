"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, TrendingUp, Info, ChevronRight } from "lucide-react";
import { DistrictExpandedTooltip } from "../../_components/district-expanded-tooltip";
import { BudgetSlider } from "../../_components/budget-slider";
import { CustomComparisonDialog } from "../../_components/custom-comparison-dialog";
import { DeepReport, ReportSkeleton } from "../../_components/deep-report";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function ComparisonPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const { zoneId } = React.use(params);
  const searchParams = useSearchParams();
  const initialCash = Number(searchParams.get("cash") || 300000000);
  const [cash, setCash] = useState(initialCash);

  useEffect(() => {
    setCash(Number(searchParams.get("cash") || 300000000));
  }, [searchParams]);

  // Mock data
  const zone = {
    name: "장위뉴타운 4구역",
    district: "성북구",
    stage: "관리처분인가",
    ratio: 105,
    rightsValue: 250000000,
    potentialPrice: 1500000000,
    refApt: "래미안 장위 퍼스트하이",
  };

  const existingApts = [
    { name: "꿈의숲 아이파크", price: 1020000000, peak: 1250000000, recovery: 81.6, investment: 380000000 },
    { name: "래미안 장위 퍼스트하이", price: 950000000, peak: 1180000000, recovery: 80.5, investment: 320000000 },
    { name: "장위 지웰 에스테이트", price: 680000000, peak: 850000000, recovery: 80.0, investment: 150000000 },
  ];

  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  const getRecoveryColor = (rate: number) => {
    if (rate >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (rate >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">투자 시뮬레이션 대시보드</h1>
        <DistrictExpandedTooltip 
          districtExpanded={true} 
          originalDistrict="성북구" 
          matchedDistrict="노원구" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Redevelopment Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline">{zone.district}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">{zone.stage}</Badge>
              </div>
              <CardTitle className="text-2xl">{zone.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">비례율</p>
                  <p className="text-lg font-bold">{zone.ratio}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">평균 권리가액</p>
                  <p className="text-lg font-bold">{formatKRW(zone.rightsValue)}</p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>잠재 미래 가치</span>
                </div>
                <p className="text-3xl font-extrabold text-primary">{formatKRW(zone.potentialPrice)}</p>
                <p className="text-xs text-muted-foreground">
                  참조: {zone.refApt} (34평형 기준)
                </p>
              </div>
            </CardContent>
          </Card>

          <BudgetSlider 
            currentCash={cash} 
            minRequired={350000000} 
            maxBudget={1000000000} 
            onBudgetChange={(value) => setCash(value)} 
          />
        </div>

        {/* Right: Existing Apts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold">기축 아파트 비교군</h2>
              <p className="text-sm text-muted-foreground">내 예산으로 매수 가능한 동일 행정구 아파트입니다.</p>
            </div>
          </div>

          <div className="space-y-4">
            {existingApts.map((apt, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-primary/10 transition-colors">
                        <Building2 className="h-6 w-6 text-slate-500 group-hover:text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">{apt.name}</h3>
                        <p className="text-sm text-muted-foreground">최신 실거래가: {formatKRW(apt.price)}</p>
                      </div>
                    </div>
                    <CustomComparisonDialog />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">전고점 대비 회복률</p>
                      <Badge className={getRecoveryColor(apt.recovery)}>{apt.recovery}%</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">전고점 (21-22년)</p>
                      <p className="font-bold text-sm">{formatKRW(apt.peak)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">필요 실투자금 (LTV 적용)</p>
                      <p className="font-bold text-sm text-primary">{formatKRW(apt.investment)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Deep Report Section */}
      <div className="pt-12 border-t space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">심층 분석 리포트</h2>
          <p className="text-muted-foreground">투자 구조부터 미래 가치까지 정밀하게 비교 분석합니다.</p>
        </div>

        <Tabs defaultValue="report" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="report" className="py-3">심층 분석 리포트 보기</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="report">
            <Suspense fallback={<ReportSkeleton />}>
              <DeepReport />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
