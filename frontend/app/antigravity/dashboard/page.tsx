"use client";

import React, { Suspense, useState } from "react";
import { Info, AlertTriangle, Settings2, TrendingDown, TrendingUp, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  );
}

function DeepAnalysisReport() {
  return (
    <div className="mt-8 space-y-6">
      {/* 1. 투자 구조 비교 */}
      <Card>
        <CardHeader>
          <CardTitle>심층 분석 리포트</CardTitle>
          <CardDescription>투자 구조, 미래 가치를 상세히 비교합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">1</span>
              투자 구조 비교
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">구분</TableHead>
                  <TableHead className="font-semibold text-primary">재개발 구역</TableHead>
                  <TableHead className="font-semibold text-blue-700">기축 아파트 (평균)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">매매가</TableCell>
                  <TableCell className="font-semibold">4.5억</TableCell>
                  <TableCell className="font-semibold">9.2억</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">실투자금 (현금)</TableCell>
                  <TableCell className="font-semibold text-green-600">2.8억</TableCell>
                  <TableCell className="font-semibold">3.5억</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">전세금/대출 가능액 (LTV)</TableCell>
                  <TableCell className="font-semibold">1.5억</TableCell>
                  <TableCell className="font-semibold">5.4억</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">취득세 및 부대비용</TableCell>
                  <TableCell className="font-semibold">0.2억</TableCell>
                  <TableCell className="font-semibold">0.3억</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 2. 미래 가치 분석 */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">2</span>
              미래 가치 분석
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">구분</TableHead>
                  <TableHead className="font-semibold text-primary">재개발 구역</TableHead>
                  <TableHead className="font-semibold text-blue-700">기축 아파트 (평균)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">준공 후 예상 시세</TableCell>
                  <TableCell className="font-semibold">15억</TableCell>
                  <TableCell className="font-semibold">12억 (10년 후)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">잠재 수익금</TableCell>
                  <TableCell className="font-semibold text-green-600">10.5억</TableCell>
                  <TableCell className="font-semibold">2.8억</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-gray-600">연평균 수익률</TableCell>
                  <TableCell className="font-semibold text-green-600 text-base">18.5%</TableCell>
                  <TableCell className="font-semibold text-gray-500">3.2%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const apartments = [
  {
    id: 1,
    name: "상도 래미안 1차",
    peakPrice: "14억 8,000만",
    recentPrice: "12억 5,000만",
    recovery: 85,
    requiredInvestment: "3.1억",
    status: "good" as const,
  },
  {
    id: 2,
    name: "흑석 센트레빌",
    peakPrice: "21억 1,000만",
    recentPrice: "15억 2,000만",
    recovery: 72,
    requiredInvestment: "4.3억",
    status: "warning" as const,
  },
  {
    id: 3,
    name: "대방 대림",
    peakPrice: "21억 4,000만",
    recentPrice: "11억 8,000만",
    recovery: 55,
    requiredInvestment: "2.8억",
    status: "danger" as const,
  },
];

const statusConfig = {
  good: {
    barColor: "bg-green-500",
    textColor: "text-green-700",
    badgeBg: "bg-green-100 text-green-800",
    label: "회복 양호",
  },
  warning: {
    barColor: "bg-yellow-500",
    textColor: "text-yellow-700",
    badgeBg: "bg-yellow-100 text-yellow-800",
    label: "회복 중",
  },
  danger: {
    barColor: "bg-red-500",
    textColor: "text-red-700",
    badgeBg: "bg-red-100 text-red-800",
    label: "회복 저조",
  },
};

export default function B2CDashboardReport() {
  const [budget, setBudget] = useState(300000000);
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">1:1 비교 분석 대시보드</h1>

      <div className="space-y-4 mb-8">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>ℹ️ 참고</AlertTitle>
          <AlertDescription>
            도봉구 내 비교 데이터가 부족하여, 인접 행정구(노원구) 기준으로 산정되었습니다.
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>LTV 예산 미달 경고</AlertTitle>
          <AlertDescription className="flex flex-col gap-4 mt-2">
            <span>현재 설정된 가용 현금으로는 해당 구역 진입이 어렵습니다. 예산을 조정해 보세요.</span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-sm font-medium whitespace-nowrap">예산 조정 (최소 1억 ~ 최대 10억)</span>
              <Slider
                defaultValue={[budget]}
                max={1000000000}
                min={100000000}
                step={10000000}
                onValueChange={(vals) => setBudget(vals[0])}
                className="w-full sm:w-auto flex-grow"
              />
              <span className="font-bold whitespace-nowrap text-lg">{(budget / 100000000).toFixed(1)}억 원</span>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Redevelopment */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-2 rounded-lg text-sm">재개발</span>
            노량진 1구역
          </h2>
          <Card className="h-full border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">핵심 투자 지표</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-500">예상 비례율</span>
                <span className="text-xl font-bold">110.5%</span>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-gray-500">평균 권리가액</span>
                <span className="text-xl font-bold">3억 5,000만 원</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl mt-4">
                <p className="text-sm text-gray-500 mb-1">잠재 미래 가치 (참조: 흑석 아크로리버하임)</p>
                <p className="text-2xl font-bold text-primary">약 21억 원</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Existing Apartments */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg text-sm">기축 아파트</span>
            비교군 (3개)
          </h2>

          {apartments.map((apt) => {
            const cfg = statusConfig[apt.status];
            return (
              <Card key={apt.id} className="relative group border shadow-sm hover:shadow-md transition-shadow">
                {/* 변경 버튼 - hover 시 표시 */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-900 group-hover:opacity-100 opacity-0 transition-opacity absolute top-2 right-2 z-10"
                    >
                      <Settings2 className="h-4 w-4 mr-1" />
                      변경
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>비교 아파트 변경</DialogTitle>
                      <DialogDescription>비교 대상을 다른 아파트로 변경할 수 있습니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input placeholder="아파트 단지명 검색..." />
                      <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">상도 더샵 1차</div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">본동 래미안</div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">노량진 우성</div>
                      </div>
                      <Button className="w-full">적용하기</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <CardContent className="p-5">
                  {/* 아파트명 + 상태 뱃지 */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg">{apt.name}</h3>
                    <Badge className={`${cfg.badgeBg} text-xs`}>{cfg.label}</Badge>
                  </div>

                  {/* 3개 핵심 지표 */}
                  <div className="space-y-3">
                    {/* 1. 전고점 대비 회복률 */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <TrendingDown className="h-3.5 w-3.5" />
                          전고점 대비 회복률
                        </span>
                        <span className={`text-sm font-bold ${cfg.textColor}`}>{apt.recovery}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${cfg.barColor} transition-all`}
                          style={{ width: `${apt.recovery}%` }}
                        />
                      </div>
                    </div>

                    {/* 2. 전고점 (21~22년) */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <TrendingUp className="h-3.5 w-3.5" />
                        전고점 (21~22년)
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{apt.peakPrice}원</span>
                    </div>

                    {/* 3. 필요 실투자금 (LTV 적용) */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Landmark className="h-3.5 w-3.5" />
                        필요 실투자금 (LTV 적용)
                      </span>
                      <span className="text-sm font-bold text-primary">{apt.requiredInvestment}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        {!showReport ? (
          <Button size="lg" className="px-8" onClick={() => setShowReport(true)}>
            심층 분석 리포트 보기
          </Button>
        ) : (
          <Suspense fallback={<ReportSkeleton />}>
            <DeepAnalysisReport />
          </Suspense>
        )}
      </div>
    </div>
  );
}
