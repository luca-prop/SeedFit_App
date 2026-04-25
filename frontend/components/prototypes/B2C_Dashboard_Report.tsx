"use client";

import React, { Suspense, useState } from "react";
import { Info, AlertTriangle, ArrowRightRight, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  );
}

function DeepAnalysisReport() {
  // Simulate data loading
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>심층 분석 리포트</CardTitle>
        <CardDescription>투자 구조, 주거 비용, 현금 흐름, 미래 가치를 상세히 비교합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구분</TableHead>
              <TableHead>재개발 구역 (노량진 1구역)</TableHead>
              <TableHead>기축 아파트 (상도 푸르지오)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">투자 구조</TableCell>
              <TableCell>조합원 분양가 + 프리미엄</TableCell>
              <TableCell>매매가 전액</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">초기 필요 자금</TableCell>
              <TableCell>5.2억 (LTV 적용)</TableCell>
              <TableCell>8.5억 (LTV 적용)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">기대 수익률 (5년)</TableCell>
              <TableCell className="text-green-600 font-semibold">+ 45%</TableCell>
              <TableCell className="text-blue-600 font-semibold">+ 15%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

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
          
          {[
            { id: 1, name: "상도 래미안 1차", price: "12억 5,000만", recovery: 85, status: "good" },
            { id: 2, name: "흑석 센트레빌", price: "15억 2,000만", recovery: 72, status: "warning" },
            { id: 3, name: "대방 대림", price: "11억 8,000만", recovery: 55, status: "danger" },
          ].map((apt) => (
            <Card key={apt.id} className="relative group">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{apt.name}</h3>
                  <p className="text-sm text-gray-500">최근 실거래: {apt.price}원</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    className={
                      apt.status === "good" ? "bg-green-100 text-green-800" :
                      apt.status === "warning" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    전고점 회복 {apt.recovery}%
                  </Badge>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900 group-hover:opacity-100 opacity-0 transition-opacity absolute top-2 right-2">
                        <Settings2 className="h-4 w-4 mr-1" />
                        변경
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>비교 아파트 변경</DialogTitle>
                        <DialogDescription>
                          비교 대상을 다른 아파트로 변경할 수 있습니다.
                        </DialogDescription>
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
                </div>
              </CardContent>
            </Card>
          ))}
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
