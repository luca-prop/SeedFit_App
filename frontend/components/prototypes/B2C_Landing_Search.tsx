"use client";

import React, { useState } from "react";
import { Search, AlertCircle, AlertTriangle, ArrowRight } from "lucide-react";
// mock shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function B2CLandingSearch() {
  const [budget, setBudget] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<{ id: number; name: string; district: string; stage: string; price: string; matchRate: number; }[]>([]);

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("ko-KR");
  };

  const handleSearch = () => {
    setHasSearched(true);
    // Mock logic: empty if < 1억, else some results
    if (Number(budget.replace(/,/g, "")) < 100000000) {
      setResults([]);
    } else {
      setResults([
        { id: 1, name: "노량진 1구역", district: "동작구", stage: "관리처분인가", price: "500,000,000", matchRate: 95 },
        { id: 2, name: "한남 3구역", district: "용산구", stage: "이주/철거", price: "1,200,000,000", matchRate: 80 },
      ]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mt-20">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
              내 가용 현금으로 진입 가능한 재개발 구역은?
            </h1>
            <div className="flex w-full gap-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="가용 현금을 입력하세요 (예: 100,000,000)"
                  className="w-full text-lg p-6 pr-12 rounded-xl border-2 border-primary/20 focus:border-primary transition-colors"
                  value={budget}
                  onChange={(e) => setBudget(formatCurrency(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
              </div>
              <Button size="lg" className="h-auto px-8 text-lg rounded-xl" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>데이터 갱신 지연 안내</AlertTitle>
              <AlertDescription>
                마지막 데이터 갱신일: 2026.03.01 (45일 전). 데이터가 최신이 아닐 수 있습니다.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between mt-4 mb-2">
              <h2 className="text-2xl font-bold">검색 결과</h2>
              <Button variant="outline" onClick={() => setHasSearched(false)}>예산 다시 입력하기</Button>
            </div>

            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-1">{item.name}</CardTitle>
                            <Badge variant="secondary" className="mr-2">{item.district}</Badge>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{item.stage}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">예상 실투자금</p>
                          <p className="text-2xl font-bold text-gray-900">{item.price}원</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>매칭 적합도</span>
                            <span className="font-medium">{item.matchRate}%</span>
                          </div>
                          <Progress value={item.matchRate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                    <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationNext href="#" /></PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">현재 예산 범위 내 진입 가능한 구역이 없습니다.</h3>
                <p className="text-gray-500 mb-6">입력하신 금액으로는 추천할 만한 재개발 구역을 찾지 못했어요.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-primary hover:bg-primary/90">
                    예산 내 매물 출현 시 알림 받기
                  </Button>
                  <Button variant="outline" onClick={() => { setHasSearched(false); setTimeout(() => document.querySelector('input')?.focus(), 100); }}>
                    예산 수정하기
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="container mx-auto flex items-start gap-2 text-sm text-gray-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            ⚠️ 본 데이터는 국토부 실거래가 및 동일 행정구 기준 비교이며, 현장 호가와 다를 수 있습니다. 투자 판단의 책임은 이용자에게 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
