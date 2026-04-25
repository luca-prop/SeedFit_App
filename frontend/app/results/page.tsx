"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bell, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const MOCK_RESULTS = [
  { id: "zone-1", name: "노량진 1구역", district: "동작구", stage: "관리처분인가", minBudget: 100000000, price: "5억 2,000만", matchRate: 95, verified: 3 },
  { id: "zone-2", name: "한남 3구역", district: "용산구", stage: "이주/철거", minBudget: 300000000, price: "12억", matchRate: 80, verified: 5 },
  { id: "zone-3", name: "흑석 9구역", district: "동작구", stage: "조합설립인가", minBudget: 200000000, price: "7억 8,000만", matchRate: 72, verified: 1 },
  { id: "zone-4", name: "수색 3구역", district: "은평구", stage: "시공사선정", minBudget: 150000000, price: "6억 1,000만", matchRate: 65, verified: 2 },
];

const STAGE_COLORS: Record<string, string> = {
  "관리처분인가": "bg-purple-100 text-purple-800",
  "이주/철거": "bg-red-100 text-red-800",
  "조합설립인가": "bg-blue-100 text-blue-800",
  "시공사선정": "bg-yellow-100 text-yellow-800",
};

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const budget = Number(searchParams.get("budget") || "0");

  const filtered = MOCK_RESULTS.filter((r) => r.minBudget <= budget);
  const formatBudget = (n: number) =>
    n >= 100000000 ? `${(n / 100000000).toFixed(1)}억` : `${(n / 10000).toLocaleString()}만`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          예산 다시 입력하기
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">검색 결과</h1>
        <p className="text-gray-500 mt-1">
          예산 <span className="font-semibold text-gray-900">{formatBudget(budget)}</span> 기준 ·{" "}
          <span className="font-semibold text-primary">{filtered.length}개</span> 구역 발견
        </p>
      </div>

      {/* Freshness Alert */}
      <Alert className="mb-6 bg-orange-50 border-orange-200 text-orange-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>데이터 갱신 지연 안내</AlertTitle>
        <AlertDescription>마지막 데이터 갱신일: 2026.03.01 (45일 전). 실제 시세와 차이가 있을 수 있습니다.</AlertDescription>
      </Alert>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
              onClick={() => router.push(`/comparison/${item.id}?budget=${budget}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{item.district}</Badge>
                      <Badge className={STAGE_COLORS[item.stage] || "bg-gray-100 text-gray-700"}>
                        {item.stage}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    매물 {item.verified}건
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">예상 초기투자금</p>
                  <p className="text-xl font-bold">{item.price}원</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500">매칭 적합도</span>
                    <span className="font-semibold text-primary">{item.matchRate}%</span>
                  </div>
                  <Progress value={item.matchRate} className="h-1.5" />
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-2 group-hover:bg-primary/5">
                  비교 분석 보기 →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-white">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">현재 예산 범위 내 진입 가능한 구역이 없습니다</h3>
          <p className="text-gray-500 mb-6">예산을 높이거나 알림을 설정해 새 매물 출현 시 알림을 받아보세요.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              매물 출현 알림 받기
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>예산 수정하기</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">검색 결과를 불러오는 중...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
