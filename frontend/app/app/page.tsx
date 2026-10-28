"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  REVERSE_FILTER_CASH_STEP_KRW,
  REVERSE_FILTER_MAX_CASH_KRW,
  REVERSE_FILTER_MIN_CASH_KRW,
} from "@/lib/reverseFilterDto";
import { BUDGET_QUICK_RANGES, BUDGET_SLIDER_TICKS_KRW } from "@/lib/resultsBudgetHref";

const formatCurrency = (value: string) => {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
};

const toEok = (v: number) => {
  const eok = v / 100000000;
  return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
};

/**
 * B2C 랜딩 페이지 (Landing Page) — Mobile-First
 * 
 * @description
 * 사용자(스마트 비기너)가 처음 진입하여 "가용 현금 범위"를 입력하는 시작 지점입니다.
 * 범위 슬라이더와 직접 입력을 통해 예산 범위를 지정할 수 있습니다.
 */
export default function HomePage() {
  const router = useRouter();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [error, setError] = useState("");

  const clampCash = (raw: string, fallback: number) => {
    if (!raw.trim()) return fallback;
    const parsed = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(REVERSE_FILTER_MIN_CASH_KRW, Math.min(REVERSE_FILTER_MAX_CASH_KRW, parsed));
  };
  const sliderMin = clampCash(budgetMin, 100000000);
  const sliderMax = clampCash(budgetMax, 500000000);

  const handleSearch = () => {
    const rawMin = Number(budgetMin.replace(/,/g, ""));
    const rawMax = Number(budgetMax.replace(/,/g, ""));
    if (budgetMin.trim() === "" || !Number.isFinite(rawMin) || rawMin < REVERSE_FILTER_MIN_CASH_KRW) {
      setError("최소 금액을 입력해주세요.");
      return;
    }
    if (budgetMax.trim() === "" || !Number.isFinite(rawMax) || rawMax < rawMin) {
      setError("최대 금액은 최소 금액보다 커야 합니다.");
      return;
    }
    setError("");
    router.push(`/app/results?budgetMin=${rawMin}&budgetMax=${rawMax}`);
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
          예산 범위를 입력하면 진입 가능한 구역을 즉시 분석해 드립니다.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-xl space-y-3 md:space-y-4">
        {/* Range Inputs */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <label className="text-xs text-gray-400 font-medium absolute -top-5 left-1">최소 예산</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="예: 200,000,000"
              className="w-full h-14 text-lg pl-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
              value={budgetMin}
              onChange={(e) => {
                setBudgetMin(formatCurrency(e.target.value));
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">원</span>
          </div>
          <span className="text-gray-400 text-2xl font-light self-center hidden md:block">~</span>
          <span className="text-gray-400 text-lg font-light self-center md:hidden">~</span>
          <div className="relative flex-1">
            <label className="text-xs text-gray-400 font-medium absolute -top-5 left-1">최대 예산</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="예: 500,000,000"
              className="w-full h-14 text-lg pl-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
              value={budgetMax}
              onChange={(e) => {
                setBudgetMax(formatCurrency(e.target.value));
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">원</span>
          </div>
        </div>

        <Button 
          size="lg" 
          className="h-14 px-6 rounded-xl text-base w-full min-h-[44px]" 
          onClick={handleSearch}
        >
          <Search className="h-5 w-5 mr-2" />
          검색
        </Button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Quick Range Select */}
        <div>
          <span className="text-sm text-gray-400 block mb-2">빠른 선택:</span>
          <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2 mb-6">
            {BUDGET_QUICK_RANGES.map(({ label, min, max }) => (
              <button
                key={label}
                onClick={() => {
                  setBudgetMin(min.toLocaleString("ko-KR"));
                  setBudgetMax(max.toLocaleString("ko-KR"));
                  setError("");
                }}
                className="text-sm px-3 py-2.5 md:py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 active:bg-gray-100 transition-colors text-gray-700 min-h-[44px] md:min-h-0"
              >
                {label}
              </button>
            ))}
          </div>

          <span className="text-sm text-gray-400 block mb-3">
            범위 슬라이더: <span className="text-gray-600 font-semibold">{toEok(sliderMin)} ~ {toEok(sliderMax)}</span>
          </span>
          <Slider
            value={[sliderMin, sliderMax]}
            max={REVERSE_FILTER_MAX_CASH_KRW}
            min={REVERSE_FILTER_MIN_CASH_KRW}
            step={REVERSE_FILTER_CASH_STEP_KRW}
            onValueChange={(v: any) => {
              const vals = Array.isArray(v) ? v : [v];
              if (vals.length >= 2) {
                setBudgetMin(vals[0].toLocaleString("ko-KR"));
                setBudgetMax(vals[1].toLocaleString("ko-KR"));
              }
              setError("");
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            {BUDGET_SLIDER_TICKS_KRW.map((tick) => (
              <span key={tick}>{toEok(tick)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Feature hints */}
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
