"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_BUDGETS = [
  { label: "5천만원", value: 50000000 },
  { label: "1억원", value: 100000000 },
  { label: "3억원", value: 300000000 },
  { label: "5억원", value: 500000000 },
  { label: "7억원", value: 700000000 },
  { label: "10억원", value: 1000000000 },
];

const formatCurrency = (value: string) => {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
};

/**
 * B2C 랜딩 페이지 (Landing Page) — Mobile-First
 * 
 * @description
 * 사용자(스마트 비기너)가 처음 진입하여 "가용 현금"을 입력하는 시작 지점입니다.
 * 복잡한 지도나 필터 대신 단일 입력창 구조(Single Input)를 사용하여 사용성을 높였습니다.
 * 
 * @mobile_first
 * - 입력창과 검색 버튼이 모바일에서는 세로 스택으로 배치되어 한 손 조작이 편리합니다.
 * - 빠른 선택 버튼은 2열 그리드로 터치 타겟(min-h-[44px])을 확보합니다.
 * - 데스크톱(md+)에서는 기존의 가로 배치를 유지합니다.
 * 
 * @logic
 * - 사용자가 직접 금액을 입력하거나 `QUICK_BUDGETS` 버튼을 통해 예산을 설정합니다.
 * - '시작하기'를 누르면 `/results?budget={budget}` 라우트로 이동하여 역방향 필터링을 수행합니다.
 */
export default function HomePage() {
  const router = useRouter();
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");

  const handleSearch = () => {
    const raw = Number(budget.replace(/,/g, ""));
    if (!raw || raw < 1000000) {
      setError("최소 100만원 이상의 예산을 입력해주세요.");
      return;
    }
    setError("");
    router.push(`/results?budget=${raw}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8 md:py-16">
      {/* Hero */}
      <div className="text-center mb-8 md:mb-12 max-w-2xl">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3 md:mb-4">
          예산 맞춤 투자 분석 플랫폼
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-3 md:mb-4">
          내 가용 현금으로<br />
          진입 가능한 재개발 구역은?
        </h1>
        <p className="text-base md:text-lg text-gray-500">
          예산을 입력하면 진입 가능한 구역을 즉시 분석해 드립니다.
        </p>
      </div>

      {/* Search Box — 모바일: 세로 스택, md+: 가로 배치 */}
      <div className="w-full max-w-xl space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="가용 현금 입력 (예: 300,000,000)"
              className="w-full h-14 text-lg pl-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-primary transition-colors"
              value={budget}
              onChange={(e) => {
                setBudget(formatCurrency(e.target.value));
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">원</span>
          </div>
          <Button 
            size="lg" 
            className="h-14 px-6 rounded-xl text-base w-full md:w-auto min-h-[44px]" 
            onClick={handleSearch}
          >
            <Search className="h-5 w-5 mr-2" />
            검색
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Quick select — 모바일: 3열 그리드, md+: 가로 나열 */}
        <div>
          <span className="text-sm text-gray-400 block mb-2">빠른 선택:</span>
          <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2">
            {QUICK_BUDGETS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => {
                  setBudget(value.toLocaleString("ko-KR"));
                  setError("");
                }}
                className="text-sm px-3 py-2.5 md:py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 active:bg-gray-100 transition-colors text-gray-700 min-h-[44px] md:min-h-0"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature hints — 모바일: 단일 열, sm: 3열 */}
      <div className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl w-full text-center">
        {[
          { icon: "💰", title: "초기투자금", desc: "어느 구역까지 진입 가능할까?" },
          { icon: "🔍", title: "1:1 비교", desc: "재개발 vs 기축아파트 투자 비교" },
          { icon: "✅", title: "Verified 매물", desc: "검증된 매물 우선 노출 및 안전 거래" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl p-4 md:p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
