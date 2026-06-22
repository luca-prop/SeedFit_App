"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  REVERSE_FILTER_CASH_STEP_KRW,
  REVERSE_FILTER_MAX_CASH_KRW,
  REVERSE_FILTER_MIN_CASH_KRW,
} from "@/lib/reverseFilterDto";

const DEFAULT_RANGE = [250_000_000, 350_000_000] as const;

const QUICK_RANGES = [
  { label: "2.5~3.5억", min: 250_000_000, max: 350_000_000 },
  { label: "3~5억", min: 300_000_000, max: 500_000_000 },
  { label: "5~10억", min: 500_000_000, max: 1_000_000_000 },
  { label: "10~15억", min: 1_000_000_000, max: 1_500_000_000 },
  { label: "15~25억", min: 1_500_000_000, max: 2_500_000_000 },
  { label: "3억 단일", min: 300_000_000, max: 300_000_000 },
];

function formatEok(value: number) {
  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function normalizeRange(values: number[]) {
  const [first = DEFAULT_RANGE[0], second = DEFAULT_RANGE[1]] = values;
  const min = Math.min(first, second);
  const max = Math.max(first, second);

  return [min, max] as [number, number];
}

export function BudgetRangeSearch() {
  const router = useRouter();
  const [[budgetMinKrw, budgetMaxKrw], setBudgetRange] = useState<[number, number]>([
    DEFAULT_RANGE[0],
    DEFAULT_RANGE[1],
  ]);

  const formattedRange = useMemo(
    () => `${formatEok(budgetMinKrw)} ~ ${formatEok(budgetMaxKrw)}`,
    [budgetMinKrw, budgetMaxKrw],
  );

  function handleSearch() {
    const params = new URLSearchParams({
      budgetMin: String(budgetMinKrw),
      budgetMax: String(budgetMaxKrw),
    });

    router.push(`/app/results?${params.toString()}`);
  }

  return (
    <div
      id="budget-search"
      className="mx-auto mb-8 w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-left shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:p-6"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-200">내 가용 현금 범위</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-white">{formattedRange}</p>
        </div>
        <p className="text-xs leading-relaxed text-gray-400">
          1억~25억, 5천만 원 단위
          <br />
          단일 금액도 선택할 수 있습니다.
        </p>
      </div>

      <Slider
        aria-label="가용 현금 범위"
        min={REVERSE_FILTER_MIN_CASH_KRW}
        max={REVERSE_FILTER_MAX_CASH_KRW}
        step={REVERSE_FILTER_CASH_STEP_KRW}
        value={[budgetMinKrw, budgetMaxKrw]}
        onValueChange={(values) => setBudgetRange(normalizeRange(Array.isArray(values) ? values : [values]))}
        className="py-4 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-track]]:bg-slate-800"
      />

      <div className="mb-5 flex justify-between text-xs font-medium text-gray-500">
        <span>1억</span>
        <span>5억</span>
        <span>10억</span>
        <span>15억</span>
        <span>20억</span>
        <span>25억</span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_RANGES.map((range) => (
          <button
            key={range.label}
            type="button"
            onClick={() => setBudgetRange([range.min, range.max])}
            className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-gray-200 transition hover:border-blue-300/40 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            {range.label}
          </button>
        ))}
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handleSearch}
        className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-indigo-500"
      >
        <Search className="mr-2 h-5 w-5" />
        이 예산 범위로 구역 찾기
      </Button>
    </div>
  );
}
