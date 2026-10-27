export const BUDGET_QUICK_RANGES = [
  { label: "1~3억", min: 100_000_000, max: 300_000_000 },
  { label: "3~5억", min: 300_000_000, max: 500_000_000 },
  { label: "5~10억", min: 500_000_000, max: 1_000_000_000 },
  { label: "10~15억", min: 1_000_000_000, max: 1_500_000_000 },
  { label: "15~20억", min: 1_500_000_000, max: 2_000_000_000 },
  { label: "20억+", min: 2_000_000_000, max: 4_000_000_000 },
] as const;

export const BUDGET_SCALE_LABEL = "0~40억, 5천만 원 단위";

export const BUDGET_SLIDER_TICKS_KRW = [
  0,
  1_000_000_000,
  2_000_000_000,
  3_000_000_000,
  4_000_000_000,
] as const;

export function formatBudgetEok(value: number) {
  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

export function formatBudgetEokRange(minKrw: number, maxKrw: number) {
  return `${formatBudgetEok(minKrw)} ~ ${formatBudgetEok(maxKrw)}`;
}

export function normalizeBudgetRange(values: number[], fallback: readonly [number, number]) {
  const [first = fallback[0], second = fallback[1]] = values;
  const min = Math.min(first, second);
  const max = Math.max(first, second);

  return [min, max] as [number, number];
}

export function applyBudgetToResultsHref(
  preservedSearch: string,
  budgetMinKrw: number,
  budgetMaxKrw: number,
) {
  const params = new URLSearchParams(preservedSearch);

  params.set("budgetMin", String(budgetMinKrw));
  params.set("budgetMax", String(budgetMaxKrw));
  params.delete("budget");

  return `/app/results?${params.toString()}`;
}
