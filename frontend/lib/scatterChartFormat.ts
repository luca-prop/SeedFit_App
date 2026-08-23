/** Y-axis ticks for 억 amounts. Snaps floating leftovers like 7.500000000001 → 7.5. */
export function formatAxisEok(value: number): string {
  if (!Number.isFinite(value)) return "";

  const rounded = Math.round(value * 2) / 2;
  if (Math.abs(rounded) < 0.05) return "0억";

  return Number.isInteger(rounded) ? `${rounded}억` : `${rounded.toFixed(1)}억`;
}

/** 4–6 readable ticks inside [min, max], always on a 0.5억 grid. */
export function niceYTicks(min: number, max: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];

  const lo = Math.round(Math.min(min, max) * 2) / 2;
  const hi = Math.round(Math.max(min, max) * 2) / 2;
  const span = Math.max(hi - lo, 0.5);
  const step = span <= 6 ? 1 : span <= 12 ? 2 : Math.ceil(span / 5);
  const ticks: number[] = [];

  for (let value = lo; value <= hi + 1e-9; value = Math.round((value + step) * 10) / 10) {
    const snapped = Math.round(value * 2) / 2;
    if (ticks[ticks.length - 1] !== snapped) ticks.push(snapped);
    if (ticks.length > 12) break;
  }

  if (ticks[ticks.length - 1] !== hi) ticks.push(hi);
  return ticks;
}
