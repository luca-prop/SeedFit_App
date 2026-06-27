"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { BarChart3, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type ReverseFilterZone } from "@/lib/reverseFilterDto";

type SortOption = {
  value: string;
  label: string;
};

type ResultsScatterExplorerProps = {
  zones: ReverseFilterZone[];
  budgetMinKrw: number;
  budgetMaxKrw: number;
  selectedDistricts: string[];
  selectedStageGroups: string[];
  selectedSort: string;
  sortOptions: SortOption[];
};

type StageAxis = {
  index: number;
  label: string;
  color: string;
  colorGroup: string;
};

type ChartPoint = ReverseFilterZone & {
  stageIndex: number;
  stageAxisLabel: string;
  stageColor: string;
  stageColorGroup: string;
  stageX: number;
  yMinEok: number;
  yMaxEok: number;
  avgEok: number;
  showLabel: boolean;
  labelSide: "left" | "right";
};

const STAGE_AXIS: StageAxis[] = [
  { index: 1, label: "추진준비", color: "#ef4444", colorGroup: "준비" },
  { index: 2, label: "구역지정", color: "#f59e0b", colorGroup: "지정·조합" },
  { index: 3, label: "조합설립", color: "#f59e0b", colorGroup: "지정·조합" },
  { index: 4, label: "시공사", color: "#10b981", colorGroup: "시공사·사시" },
  { index: 5, label: "사업시행", color: "#10b981", colorGroup: "시공사·사시" },
  { index: 6, label: "관리처분", color: "#3b82f6", colorGroup: "관처·이주·착공" },
  { index: 7, label: "이주철거", color: "#3b82f6", colorGroup: "관처·이주·착공" },
  { index: 8, label: "착공", color: "#3b82f6", colorGroup: "관처·이주·착공" },
];

const STAGE_LABELS = Object.fromEntries(STAGE_AXIS.map((stage) => [stage.index, stage.label]));
const ALL_STAGE_LABELS = STAGE_AXIS.map((stage) => stage.label);
const NONE_FILTER_VALUE = "__none";

function formatBudget(value: number) {
  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatBudgetEok(value: number) {
  return Number.isInteger(value) ? `${value}억` : `${value.toFixed(1)}억`;
}

function buildZoneHref(path: string, zone: ChartPoint, budgetMinKrw: number, budgetMaxKrw: number, selectedSort: string) {
  const params = new URLSearchParams({
    budgetMin: String(budgetMinKrw),
    budgetMax: String(budgetMaxKrw),
    sort: selectedSort,
    zoneName: zone.zoneName,
  });

  return `${path}?${params.toString()}`;
}

function stageAxisFor(stage: string): StageAxis {
  const normalized = stage.replace(/\s+/g, "");

  if (normalized.includes("착공")) return STAGE_AXIS[7];
  if (normalized.includes("이주") || normalized.includes("철거")) return STAGE_AXIS[6];
  if (normalized.includes("관리처분")) return STAGE_AXIS[5];
  if (normalized.includes("사업시행")) return STAGE_AXIS[4];
  if (normalized.includes("시공사") || normalized.includes("건축심의")) return STAGE_AXIS[3];
  if (normalized.includes("조합설립") || normalized.includes("사업시행자지정")) return STAGE_AXIS[2];
  if (normalized.includes("구역지정") || normalized.includes("관리계획고시") || normalized.includes("추진위")) {
    return STAGE_AXIS[1];
  }

  return STAGE_AXIS[0];
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right, "ko"));
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function toParam(values: string[], allValues: string[]) {
  if (values.length === 0) {
    return NONE_FILTER_VALUE;
  }

  if (values.length === allValues.length) {
    return null;
  }

  return values.join(",");
}

function normalizeSelected(values: string[], allValues: string[]) {
  if (values.includes(NONE_FILTER_VALUE)) {
    return [];
  }

  return values.length > 0 ? values.filter((value) => allValues.includes(value)) : allValues;
}

function shortZoneName(name: string) {
  return name.replace(/\s+/g, "").replace(/구역.*$/, "").replace(/동([A-Z0-9])/g, "$1");
}

function selectLabelZoneIds(points: Omit<ChartPoint, "showLabel" | "labelSide">[]) {
  if (points.length <= 8) {
    return new Set(points.map((point) => point.zoneId));
  }

  const selected = new Set<string>();
  const perStageCount = new Map<number, number>();
  const sorted = [...points].sort((left, right) => {
    const statusDiff =
      (right.budgetStatus === "within_budget" ? 1 : 0) - (left.budgetStatus === "within_budget" ? 1 : 0);
    if (statusDiff !== 0) return statusDiff;

    const scoreDiff = right.matchScore - left.matchScore;
    if (scoreDiff !== 0) return scoreDiff;

    return Math.abs(left.budgetGapKrw) - Math.abs(right.budgetGapKrw);
  });

  for (const point of sorted) {
    if (selected.size >= 6) break;

    const stageCount = perStageCount.get(point.stageIndex) ?? 0;
    if (stageCount >= 2) continue;

    selected.add(point.zoneId);
    perStageCount.set(point.stageIndex, stageCount + 1);
  }

  return selected;
}

function applyPositionDodge(points: Array<Omit<ChartPoint, "showLabel" | "labelSide">>) {
  const groups = new Map<string, Array<Omit<ChartPoint, "showLabel" | "labelSide">>>();

  for (const point of points) {
    const key = `${point.stageIndex}-${Math.round(point.avgEok * 10)}`;
    groups.set(key, [...(groups.get(key) ?? []), point]);
  }

  return Array.from(groups.values()).flatMap((group) => {
    const sorted = [...group].sort((left, right) => left.zoneName.localeCompare(right.zoneName, "ko"));
    const width = Math.min(0.13, 0.6 / Math.max(sorted.length, 1));

    return sorted.map((point, index) => ({
      ...point,
      stageX: point.stageX + (index - (sorted.length - 1) / 2) * width,
    }));
  });
}

function buildChartData(zones: ReverseFilterZone[]) {
  const basePoints = zones.map((zone) => {
    const stageAxis = stageAxisFor(zone.stage);
    const yMinEok = zone.requiredCashMinKrw / 100_000_000;
    const yMaxEok = (zone.requiredCashMaxKrw ?? zone.requiredCashMinKrw) / 100_000_000;

    return {
      ...zone,
      stageIndex: stageAxis.index,
      stageAxisLabel: stageAxis.label,
      stageColor: stageAxis.color,
      stageColorGroup: stageAxis.colorGroup,
      stageX: stageAxis.index,
      yMinEok,
      yMaxEok,
      avgEok: (yMinEok + yMaxEok) / 2,
    };
  });
  const dodged = applyPositionDodge(basePoints);
  const labelZoneIds = selectLabelZoneIds(dodged);

  return dodged.map((point, index) => ({
    ...point,
    showLabel: labelZoneIds.has(point.zoneId),
    labelSide: (index % 2 === 0 ? "right" : "left") as "left" | "right",
  }));
}

function ZoneDumbbellShape(props: {
  cx?: number;
  cy?: number;
  yAxis?: { scale?: (value: number) => number };
  payload?: ChartPoint;
  onSelect?: (zoneId: string) => void;
  selectedZoneId?: string | null;
}) {
  const { cx, yAxis, payload, onSelect, selectedZoneId } = props;

  if (typeof cx !== "number" || !payload) return null;

  const selected = selectedZoneId === payload.zoneId;
  const yMin = yAxis?.scale?.(payload.yMinEok) ?? props.cy ?? 0;
  const yMax = yAxis?.scale?.(payload.yMaxEok) ?? props.cy ?? 0;
  const topY = Math.min(yMin, yMax);
  const bottomY = Math.max(yMin, yMax);
  const samePrice = Math.abs(bottomY - topY) < 3;
  const color = selected ? "#4f46e5" : payload.stageColor;
  const labelVisible = payload.showLabel || selected;
  const labelOffset = payload.labelSide === "left" ? -7 : 7;
  const labelAnchor = payload.labelSide === "left" ? "end" : "start";

  return (
    <g
      opacity={selectedZoneId && !selected ? 0.3 : 0.92}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(payload.zoneId);
      }}
      style={{ cursor: "pointer" }}
    >
      {!samePrice ? (
        <line x1={cx} y1={topY} x2={cx} y2={bottomY} stroke={color} strokeWidth={selected ? 4 : 2.5} strokeLinecap="round" />
      ) : null}
      <circle cx={cx} cy={topY} r={selected ? 5.5 : 4} fill={color} stroke="#fff" strokeWidth={1.5} />
      {!samePrice ? <circle cx={cx} cy={bottomY} r={selected ? 5.5 : 4} fill={color} stroke="#fff" strokeWidth={1.5} /> : null}
      {labelVisible ? (
        <text
          x={cx + labelOffset}
          y={topY - 6}
          fill={selected ? "#312e81" : "#475569"}
          fontSize={selected ? 13 : 11}
          fontWeight={selected ? 900 : 700}
          textAnchor={labelAnchor}
        >
          {shortZoneName(payload.zoneName)}
        </text>
      ) : null}
    </g>
  );
}

function ScatterTooltip({
  active,
  payload,
  budgetMinKrw,
  budgetMaxKrw,
  selectedSort,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  budgetMinKrw: number;
  budgetMaxKrw: number;
  selectedSort: string;
}) {
  if (!active || !payload?.length) return null;

  const zone = payload[0].payload;
  const zoneDetailHref = buildZoneHref(`/app/zones/${zone.zoneId}`, zone, budgetMinKrw, budgetMaxKrw, selectedSort);
  const comparisonHref = buildZoneHref(`/app/comparison/${zone.zoneId}`, zone, budgetMinKrw, budgetMaxKrw, selectedSort);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-950">{zone.zoneName}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{zone.district}</span>
      </div>
      <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
        <p>
          X축 단계: <span className="font-semibold text-slate-800">{zone.stageAxisLabel}</span>
        </p>
        <p>
          사업 단계: <span className="font-semibold text-slate-800">{zone.stage}</span>
        </p>
        <p>
          필요 현금:{" "}
          <span className="font-semibold text-slate-800">
            {formatBudget(zone.requiredCashMinKrw)}
            {zone.requiredCashMaxKrw && zone.requiredCashMaxKrw !== zone.requiredCashMinKrw
              ? ` ~ ${formatBudget(zone.requiredCashMaxKrw)}`
              : ""}
          </span>
        </p>
      </div>
      <div className="mt-3 grid gap-2">
        <a
          href={zoneDetailHref}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          구역 상세 보기
        </a>
        <a
          href={comparisonHref}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          같은 예산 기축단지 비교 보기
        </a>
      </div>
    </div>
  );
}

function PinnedTooltip({
  zone,
  onClear,
  budgetMinKrw,
  budgetMaxKrw,
  selectedSort,
}: {
  zone: ChartPoint;
  onClear: () => void;
  budgetMinKrw: number;
  budgetMaxKrw: number;
  selectedSort: string;
}) {
  const zoneDetailHref = buildZoneHref(`/app/zones/${zone.zoneId}`, zone, budgetMinKrw, budgetMaxKrw, selectedSort);
  const comparisonHref = buildZoneHref(`/app/comparison/${zone.zoneId}`, zone, budgetMinKrw, budgetMaxKrw, selectedSort);

  return (
    <div
      className="absolute right-3 top-3 z-10 w-[min(21rem,calc(100%-1.5rem))] rounded-2xl border border-indigo-100 bg-white p-4 text-sm shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-indigo-600">선택 구역</p>
          <p className="mt-1 font-bold text-slate-950">{zone.zoneName}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="선택 해제"
        >
          해제
        </button>
      </div>
      <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>
          X축 단계: <span className="font-semibold text-slate-800">{zone.stageAxisLabel}</span>
        </p>
        <p>
          사업 단계: <span className="font-semibold text-slate-800">{zone.stage}</span>
        </p>
        <p>
          필요 현금:{" "}
          <span className="font-semibold text-slate-800">
            {formatBudget(zone.requiredCashMinKrw)}
            {zone.requiredCashMaxKrw && zone.requiredCashMaxKrw !== zone.requiredCashMinKrw
              ? ` ~ ${formatBudget(zone.requiredCashMaxKrw)}`
              : ""}
          </span>
        </p>
      </div>
      <div className="mt-3 grid gap-2">
        <a
          href={zoneDetailHref}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          구역 상세 보기
        </a>
        <a
          href={comparisonHref}
          className="inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          같은 예산 기축단지 비교 보기
        </a>
      </div>
    </div>
  );
}

export function ResultsScatterExplorer({
  zones,
  budgetMinKrw,
  budgetMaxKrw,
  selectedDistricts,
  selectedStageGroups,
  selectedSort,
  sortOptions,
}: ResultsScatterExplorerProps) {
  const router = useRouter();
  const allDistricts = useMemo(() => uniqueSorted(zones.map((zone) => zone.district)), [zones]);
  const activeDistricts = normalizeSelected(selectedDistricts, allDistricts);
  const activeStageLabels = normalizeSelected(selectedStageGroups, ALL_STAGE_LABELS);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const districtCounts = countBy(zones.map((zone) => zone.district));
  const stageCounts = countBy(zones.map((zone) => stageAxisFor(zone.stage).label));
  const filteredZones = zones.filter(
    (zone) => activeDistricts.includes(zone.district) && activeStageLabels.includes(stageAxisFor(zone.stage).label),
  );
  const chartData = buildChartData(filteredZones);
  const selectedPoint = chartData.find((point) => point.zoneId === selectedZoneId) ?? null;
  const budgetMinEok = budgetMinKrw / 100_000_000;
  const budgetMaxEok = budgetMaxKrw / 100_000_000;
  const isSingleBudget = budgetMinKrw === budgetMaxKrw;

  function pushFilters(nextDistricts: string[], nextStages: string[], nextSort = selectedSort) {
    const params = new URLSearchParams({
      budgetMin: String(budgetMinKrw),
      budgetMax: String(budgetMaxKrw),
      sort: nextSort,
    });
    const districtsParam = toParam(nextDistricts, allDistricts);
    const stagesParam = toParam(nextStages, ALL_STAGE_LABELS);

    if (districtsParam) params.set("districts", districtsParam);
    if (stagesParam) params.set("stageGroups", stagesParam);

    router.push(`/app/results?${params.toString()}`);
  }

  function toggleDistrict(district: string) {
    const next = activeDistricts.includes(district)
      ? activeDistricts.filter((value) => value !== district)
      : [...activeDistricts, district];

    pushFilters(next, activeStageLabels);
  }

  function toggleStage(stageLabel: string) {
    const next = activeStageLabels.includes(stageLabel)
      ? activeStageLabels.filter((value) => value !== stageLabel)
      : [...activeStageLabels, stageLabel];

    pushFilters(activeDistricts, next);
  }

  function toggleAllDistricts() {
    pushFilters(activeDistricts.length === allDistricts.length ? [] : allDistricts, activeStageLabels);
  }

  function toggleAllStages() {
    pushFilters(activeDistricts, activeStageLabels.length === ALL_STAGE_LABELS.length ? [] : ALL_STAGE_LABELS);
  }

  function handleSelectZone(zoneId: string) {
    setSelectedZoneId(zoneId);
  }

  return (
    <section className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center text-sm font-bold text-slate-950">
            <BarChart3 className="mr-2 h-4 w-4 text-indigo-600" />
            예산 맞춤 구역 분포
          </p>
          <p className="mt-1 text-sm text-slate-500">
            X축은 사업 단계, Y축은 구역별 최소~최대 실투자금입니다. 파란 예산선 안에 가까울수록 현재 예산과 맞습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="results-sort" className="sr-only">
            결과 정렬 기준
          </label>
          <select
            id="results-sort"
            value={selectedSort}
            onChange={(event) => pushFilters(activeDistricts, activeStageLabels, event.target.value)}
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {sortOptions.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            onClick={() => router.push(`/app/results?budgetMin=${budgetMinKrw}&budgetMax=${budgetMaxKrw}&sort=budgetFitAsc`)}
            aria-label="필터 초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3" role="group" aria-label="자치구 필터">
        <button
          type="button"
          onClick={toggleAllDistricts}
          aria-pressed={activeDistricts.length === allDistricts.length}
          aria-label={`전체 자치구 보기, 현재 ${zones.length}개 구역`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            activeDistricts.length === allDistricts.length ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-indigo-600"
          }`}
        >
          전체 <span className="ml-0.5 opacity-70">{zones.length}</span>
        </button>
        {allDistricts.map((district) => {
          const active = activeDistricts.includes(district);

          return (
            <button
              key={district}
              type="button"
              onClick={() => toggleDistrict(district)}
              aria-pressed={active}
              aria-label={`${district} 필터 ${active ? "해제" : "선택"}, ${districtCounts[district]}개 구역`}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                active ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:text-indigo-600"
              }`}
            >
              {district} <span className="ml-0.5 opacity-70">{districtCounts[district]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3" role="group" aria-label="사업 단계 필터">
        <button
          type="button"
          onClick={toggleAllStages}
          aria-pressed={activeStageLabels.length === ALL_STAGE_LABELS.length}
          aria-label={`전체 사업 단계 보기, 현재 ${zones.length}개 구역`}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            activeStageLabels.length === ALL_STAGE_LABELS.length
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-500 hover:text-indigo-600"
          }`}
        >
          전체 단계 <span className="ml-0.5 opacity-70">{zones.length}</span>
        </button>
        {STAGE_AXIS.map((stage) => {
          const active = activeStageLabels.includes(stage.label);

          return (
            <button
              key={stage.label}
              type="button"
              onClick={() => toggleStage(stage.label)}
              aria-pressed={active}
              aria-label={`${stage.label} 단계 필터 ${active ? "해제" : "선택"}, ${stageCounts[stage.label] ?? 0}개 구역`}
              style={active ? { backgroundColor: stage.color } : undefined}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                active ? "text-white shadow-sm" : "bg-white text-slate-500 hover:text-indigo-600"
              }`}
            >
              {stage.label} <span className="ml-0.5 opacity-70">{stageCounts[stage.label] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <p id="results-chart-description" className="sr-only">
        예산 맞춤 구역 분포 차트입니다. 표시 결과는 {chartData.length}개이고, 예산 범위는 {formatBudget(budgetMinKrw)}
        부터 {formatBudget(budgetMaxKrw)}까지입니다. 차트 아래 구역 카드 목록에서도 같은 구역 상세와 비교 링크를 이용할 수 있습니다.
      </p>
      <div
        className="relative h-[430px] rounded-[1.5rem] border border-slate-100 bg-white p-2 md:h-[540px] md:p-4"
        onClick={() => setSelectedZoneId(null)}
        aria-describedby="results-chart-description"
      >
        {selectedPoint ? (
          <PinnedTooltip
            zone={selectedPoint}
            onClear={() => setSelectedZoneId(null)}
            budgetMinKrw={budgetMinKrw}
            budgetMaxKrw={budgetMaxKrw}
            selectedSort={selectedSort}
          />
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 28, right: 24, bottom: 28, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              dataKey="stageX"
              domain={[0.5, 8.5]}
              ticks={STAGE_AXIS.map((stage) => stage.index)}
              tickFormatter={(value) => STAGE_LABELS[value] ?? ""}
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="avgEok"
              unit="억"
              domain={[Math.max(0, budgetMinEok - 0.5), Math.max(budgetMaxEok + 1, 5)]}
              tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            {isSingleBudget ? (
              <ReferenceLine
                y={budgetMinEok}
                stroke="#2563eb"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: `예산 ${formatBudgetEok(budgetMinEok)}`, fill: "#2563eb", fontSize: 11, fontWeight: 700 }}
              />
            ) : (
              <>
                <ReferenceArea y1={budgetMinEok} y2={budgetMaxEok} fill="#dbeafe" fillOpacity={0.38} strokeOpacity={0} />
                <ReferenceLine
                  y={budgetMinEok}
                  stroke="#2563eb"
                  strokeDasharray="5 5"
                  strokeWidth={1.2}
                  label={{ value: `최소 ${formatBudgetEok(budgetMinEok)}`, fill: "#2563eb", fontSize: 11, fontWeight: 700 }}
                />
                <ReferenceLine
                  y={budgetMaxEok}
                  stroke="#2563eb"
                  strokeDasharray="5 5"
                  strokeWidth={1.2}
                  label={{ value: `최대 ${formatBudgetEok(budgetMaxEok)}`, fill: "#2563eb", fontSize: 11, fontWeight: 700 }}
                />
              </>
            )}
            <ZAxis type="number" range={[64, 64]} />
            <Tooltip
              content={
                <ScatterTooltip budgetMinKrw={budgetMinKrw} budgetMaxKrw={budgetMaxKrw} selectedSort={selectedSort} />
              }
              cursor={false}
              wrapperStyle={{ outline: "none" }}
            />
            <Scatter
              data={chartData}
              shape={<ZoneDumbbellShape onSelect={handleSelectZone} selectedZoneId={selectedZoneId} />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-500">
        {[
          { label: "준비", color: "#ef4444" },
          { label: "지정·조합", color: "#f59e0b" },
          { label: "시공사·사시", color: "#10b981" },
          { label: "관처·이주·착공", color: "#3b82f6" },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        파란 영역은 입력한 예산 범위입니다. 각 점은 구역 실투자금 범위의 대표 위치이며, 상세 금액은 툴팁과 구역 상세에서 확인할 수 있습니다.
      </p>
    </section>
  );
}
