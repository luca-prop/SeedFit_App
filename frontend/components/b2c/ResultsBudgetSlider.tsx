"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import {
  BUDGET_QUICK_RANGES,
  applyBudgetToResultsHref,
  formatBudgetEokRange,
  normalizeBudgetRange,
} from "@/lib/resultsBudgetHref";
import {
  REVERSE_FILTER_CASH_STEP_KRW,
  REVERSE_FILTER_MAX_CASH_KRW,
  REVERSE_FILTER_MIN_CASH_KRW,
} from "@/lib/reverseFilterDto";

type ResultsBudgetSliderProps = {
  budgetMinKrw: number;
  budgetMaxKrw: number;
  preservedSearch: string;
};

function sameRange(left: readonly [number, number], right: readonly [number, number]) {
  return left[0] === right[0] && left[1] === right[1];
}

export function ResultsBudgetSlider({
  budgetMinKrw,
  budgetMaxKrw,
  preservedSearch,
}: ResultsBudgetSliderProps) {
  const router = useRouter();
  const applied: [number, number] = [budgetMinKrw, budgetMaxKrw];
  const [[draftMin, draftMax], setDraftRange] = useState<[number, number]>(applied);
  const draftRef = useRef<[number, number]>([draftMin, draftMax]);
  const formattedRange = formatBudgetEokRange(draftMin, draftMax);
  const appliedRange = formatBudgetEokRange(budgetMinKrw, budgetMaxKrw);
  const isDirty = !sameRange([draftMin, draftMax], applied);

  function setRangeIfChanged(next: [number, number]) {
    draftRef.current = next;
    setDraftRange((current) => (sameRange(current, next) ? current : next));
  }

  function commitRange(nextMin: number, nextMax: number) {
    if (nextMin === budgetMinKrw && nextMax === budgetMaxKrw) {
      return;
    }

    router.push(applyBudgetToResultsHref(preservedSearch, nextMin, nextMax), { scroll: false });
  }

  function parseSliderValues(values: number | readonly number[]) {
    return normalizeBudgetRange(Array.isArray(values) ? [...values] : [values], applied);
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-flex items-center text-sm font-bold text-slate-950">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-indigo-600" />
            예산 범위 조절
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-950" aria-live="polite">
            {formattedRange}
          </p>
        </div>
        <p id="results-budget-help" className="text-xs leading-relaxed text-slate-500">
          1억~25억, 5천만 원 단위
          <br />
          손잡이를 놓거나 아래 범위를 누르면 결과가 바뀝니다.
        </p>
      </div>

      <Slider
        aria-label="가용 현금 범위"
        aria-describedby="results-budget-help"
        min={REVERSE_FILTER_MIN_CASH_KRW}
        max={REVERSE_FILTER_MAX_CASH_KRW}
        step={REVERSE_FILTER_CASH_STEP_KRW}
        value={[draftMin, draftMax]}
        onValueChange={(values) => setRangeIfChanged(parseSliderValues(values))}
        onValueCommitted={(values) => {
          const next = parseSliderValues(values);
          setRangeIfChanged(next);
          commitRange(next[0], next[1]);
        }}
        className="py-4 [&_[data-slot=slider-range]]:bg-indigo-600 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-indigo-600"
      />

      <div className="mb-4 flex justify-between text-xs font-medium text-slate-400">
        <span>1억</span>
        <span>5억</span>
        <span>10억</span>
        <span>15억</span>
        <span>20억</span>
        <span>25억</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6" role="group" aria-label="빠른 예산 범위 선택">
        {BUDGET_QUICK_RANGES.map((range) => {
          const active = range.min === draftMin && range.max === draftMax;
          const href = applyBudgetToResultsHref(preservedSearch, range.min, range.max);

          return (
            <Link
              key={range.label}
              href={href}
              scroll={false}
              aria-current={active ? "true" : undefined}
              aria-label={`${range.label} 예산 범위 선택`}
              className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
              }`}
            >
              {range.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        {isDirty
          ? `${formattedRange} 기준으로 결과를 다시 맞추는 중입니다.`
          : `현재 결과는 ${appliedRange} 기준입니다.`}
      </p>
    </div>
  );
}
