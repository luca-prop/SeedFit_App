"use client";

import React, { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, X, SlidersHorizontal, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { scatterData } from "../../lib/scatterData";
import { REFERENCE_COMPLEXES } from "../../lib/referenceComplexes";
import { PROGRESS_DATES } from "../../lib/scatterDates";

// 데이터에서 고유 구 목록 자동 추출
const ALL_DISTRICTS = Array.from(new Set(scatterData.map((d) => d.district)));
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

const STAGE_LABELS: Record<number, string> = {
  1: "추진준비",
  2: "구역지정",
  3: "조합설립",
  4: "시공사선정",
  5: "사업시행",
  6: "관리처분",
  7: "이주철거",
  8: "착공",
  9: "기축(비교군)",
};

// 모바일 축약 라벨 (item 2-B)
const STAGE_LABELS_SHORT: Record<number, string> = {
  1: "준비",
  2: "지정",
  3: "조합",
  4: "시공",
  5: "시행",
  6: "처분",
  7: "이주",
  8: "착공",
  9: "기축",
};

const TIER_COLORS: Record<string, string> = {
  T1: "#3b82f6",
  T2: "#10b981",
  T3: "#f59e0b",
  T4: "#ef4444",
  T_REF: "#8b5cf6",
};

/**
 * Position Dodge 로직: 동일 X축(stage) 값을 가진 마커들을 좌우로 미세하게 분산
 */
/**
 * Position Dodge 로직 (개선): 동일 stageStr 그룹 내에서 날짜순으로 X축 분산
 * - 선정일이 빠를수록 X축 오른쪽 배치 (더 진행된 것으로 간주)
 * - 동일 날짜인 경우 구역명 알파벳순 타이브레이커로 고유 순서 보장
 * - 모든 구역이 고유한 X 좌표를 가짐 (겹침 제로)
 */
function applyPositionDodge(data: any[]) {
  // stageStr 기준으로 그룹핑 (같은 단계명끼리 묶음)
  const stageGroups: Record<string, any[]> = {};
  data.forEach((d) => {
    const key = d.stageStr || String(d.stage);
    if (!stageGroups[key]) stageGroups[key] = [];
    stageGroups[key].push(d);
  });

  const dodged: any[] = [];
  const DODGE_WIDTH = 0.06; // 각 마커 간 X축 오프셋

  for (const [, group] of Object.entries(stageGroups)) {
    // 날짜순 정렬: 빠른 날짜(작은 숫자) → 더 진행 → 오른쪽(큰 offset)
    // 동일 날짜 시 구역명 알파벳순 타이브레이커
    group.sort((a: any, b: any) => {
      const dateA = PROGRESS_DATES[a.name] ?? 99999999;
      const dateB = PROGRESS_DATES[b.name] ?? 99999999;
      if (dateA !== dateB) return dateA - dateB; // 빠른 날짜가 앞 (idx 작음 → 오른쪽)
      return (a.name || "").localeCompare(b.name || ""); // 타이브레이커
    });
    const count = group.length;
    group.forEach((item: any, idx: number) => {
      // 가장 빠른 날짜(idx=0)가 오른쪽(+), 가장 늦은(idx=count-1)이 왼쪽(-)
      const offset = ((count - 1) / 2 - idx) * DODGE_WIDTH * -1;
      dodged.push({
        ...item,
        stageDodged: item.stage + offset,
      });
    });
  }
  return dodged;
}

/**
 * Dumbbell (덤벨) 형태 마커 렌더러
 * - 얇은 실선 + 양 끝 작은 점(Min/Max)
 * - 투명도(Alpha) 적용으로 겹침 시 밀도 표현
 */
function DumbbellShape(props: any) {
  const { cx, payload, yAxis, onPointClick } = props;

  if (!payload || isNaN(cx)) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPointClick) onPointClick({ ...payload, cx, cy: 0 });
  };

  // Reference point (triangle)
  if (payload.isRef) {
    let cy = 0;
    if (yAxis && typeof yAxis.scale === "function") {
      cy = yAxis.scale(payload.investmentMin);
    }
    return (
      <g opacity={0.9} onClick={handleClick} style={{ cursor: "pointer" }}>
        <polygon
          points={`${cx},${cy - 9} ${cx + 7},${cy + 5} ${cx - 7},${cy + 5}`}
          fill={TIER_COLORS.T_REF}
          stroke="#fff"
          strokeWidth={1}
        />
      </g>
    );
  }

  const fill = TIER_COLORS[payload.tier as keyof typeof TIER_COLORS] || "#888";
  const opacity = payload.isOut ? 0.08 : 0.55;

  // Calculate Y positions from yAxis scale
  let yMin = 0, yMax = 0;
  if (yAxis && typeof yAxis.scale === "function") {
    yMin = yAxis.scale(payload.investmentMin);
    yMax = yAxis.scale(payload.investmentMax);
    // Ensure yMin is below yMax in pixel space (inverted Y)
    if (yMin < yMax) [yMin, yMax] = [yMax, yMin];
  } else {
    const midCy = props.cy || 0;
    const diff = payload.investmentMax - payload.investmentMin;
    yMax = midCy - diff * 13;
    yMin = midCy + diff * 13;
  }

  const lineHeight = Math.abs(yMin - yMax);
  const samePrice = lineHeight < 3;

  // For the click handler, set cy to midpoint
  const midY = (yMin + yMax) / 2;

  return (
    <g opacity={opacity} onClick={(e) => {
      e.stopPropagation();
      if (onPointClick) onPointClick({ ...payload, cx, cy: midY });
    }} style={{ cursor: "pointer" }}>
      {/* Vertical line (stem) */}
      <line
        x1={cx}
        y1={yMax}
        x2={cx}
        y2={yMin}
        stroke={fill}
        strokeWidth={samePrice ? 0 : 2}
        strokeLinecap="round"
      />
      {/* Top dot (Max) */}
      <circle cx={cx} cy={yMax} r={samePrice ? 4 : 3.5} fill={fill} stroke="#fff" strokeWidth={1} />
      {/* Bottom dot (Min) */}
      {!samePrice && (
        <circle cx={cx} cy={yMin} r={3.5} fill={fill} stroke="#fff" strokeWidth={1} />
      )}
    </g>
  );
}

function ScatterChartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Support both range and legacy single budget
  const budgetMinParam = searchParams.get("budgetMin");
  const budgetMaxParam = searchParams.get("budgetMax");
  const legacyBudget = searchParams.get("budget");
  
  const initMin = budgetMinParam ? Number(budgetMinParam) / 100000000 : (legacyBudget ? Number(legacyBudget) * 0.85 / 100000000 : 1);
  const initMax = budgetMaxParam ? Number(budgetMaxParam) / 100000000 : (legacyBudget ? Number(legacyBudget) * 1.05 / 100000000 : 15);

  // 예산 슬라이더용 로컬 상태 (실시간 조절 가능)
  const [budgetRange, setBudgetRange] = useState<[number, number]>([initMin, initMax]);
  const budgetMinEok = budgetRange[0];
  const budgetMaxEok = budgetRange[1];
  const hasBudget = budgetMinEok > 0 || budgetMaxEok > 0;
  const [showBudgetSlider, setShowBudgetSlider] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [showAllZones, setShowAllZones] = useState(!(budgetMinParam || legacyBudget));
  const [pinnedData, setPinnedData] = useState<any>(null);

  // 모바일 자동 줌 토글 (도메인 기반)
  const [mobileAutoZoom, setMobileAutoZoom] = useState(true);

  // 모바일 감지: X축 라벨 축약용 (item 2-B)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // 구별 필터: 선택된 구 목록 (비어있으면 전체 표시)
  const [activeDistricts, setActiveDistricts] = useState<Set<string>>(new Set());
  const handleToggleDistrict = useCallback((district: string) => {
    setActiveDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(district)) {
        next.delete(district);
      } else {
        next.add(district);
      }
      return next;
    });
    // 구별 필터와 개별 구역 줌인은 별도 기능이므로 줌인 해제
    setSelectedDistrict(null);
    setPinnedData(null);
  }, []);

  const displayData = useMemo(() => {
    let data = scatterData.map((d) => {
      const avg = (d.investmentMin + d.investmentMax) / 2;
      const isOut = hasBudget && (d.investmentMin > budgetMaxEok * 1.1 || d.investmentMax < budgetMinEok * 0.9);
      return { ...d, avg, isOut };
    });

    // 구별 필터 적용 (선택된 구가 있으면 해당 구만 표시)
    if (activeDistricts.size > 0 && !selectedDistrict) {
      data = data.filter((d) => activeDistricts.has(d.district));
    }

    if (!showAllZones && !selectedDistrict) {
      data = data.filter((d) => !d.isOut);
    }

    if (selectedDistrict) {
      data = scatterData.map((d) => {
        const avg = (d.investmentMin + d.investmentMax) / 2;
        const isOut = hasBudget && (d.investmentMin > budgetMaxEok * 1.1 || d.investmentMax < budgetMinEok * 0.9);
        return { ...d, avg, isOut };
      }).filter((d) => d.district === selectedDistrict);
      
      const refs = REFERENCE_COMPLEXES[selectedDistrict] || [];
      const refPoints = refs.map((ref, idx) => {
        const offset = refs.length > 1 ? (idx - (refs.length - 1) / 2) * 0.25 : 0;
        return {
          id: `ref-${selectedDistrict}-${idx}`,
          name: ref.name,
          district: selectedDistrict,
          tier: "T_REF",
          stage: 9 + offset,
          stageStr: "기축 (비교군)",
          investmentMin: ref.price,
          investmentMax: ref.price,
          avg: ref.price,
          isOut: false,
          isRef: true,
        };
      });
      data = [...data, ...refPoints];
    }

    return applyPositionDodge(data);
  }, [hasBudget, budgetMinEok, budgetMaxEok, showAllZones, selectedDistrict, activeDistricts]);

  // 모바일 자동 줌 도메인: 예산 범위 구역이 화면의 85%를 차지하도록
  const autoZoomDomains = useMemo(() => {
    if (!isMobile || !hasBudget || !mobileAutoZoom) return null;
    const budgetZones = displayData.filter((d: any) => !d.isOut && !d.isRef);
    if (budgetZones.length === 0) return null;

    const stages = budgetZones.map((d: any) => d.stage);
    const invMins = budgetZones.map((d: any) => d.investmentMin);
    const invMaxs = budgetZones.map((d: any) => d.investmentMax);

    const sMin = Math.min(...stages);
    const sMax = Math.max(...stages);
    const iMin = Math.min(...invMins);
    const iMax = Math.max(...invMaxs);

    // 패딩 15%: 구역이 화면의 ~85% 차지
    const sPad = Math.max((sMax - sMin) * 0.15, 0.8);
    const iPad = Math.max((iMax - iMin) * 0.15, 1);

    return {
      x: [Math.max(0.5, Math.floor(sMin - sPad)), Math.min(9.5, Math.ceil(sMax + sPad))] as [number, number],
      y: [Math.max(0, Math.floor(iMin - iPad)), Math.ceil(iMax + iPad)] as [number, number],
    };
  }, [isMobile, hasBudget, mobileAutoZoom, displayData]);

  const handlePointClick = useCallback((payload: any) => {
    setPinnedData(payload);
  }, []);

  // 웹: 호버 툴팁 표시 / 모바일: 비활성화 (클릭 핀 방식만)
  const renderTooltip = useCallback(
    ({ active, payload }: any) => {
      if (isMobile) return null;
      if (pinnedData) return null;
      if (!active || !payload || !payload.length) return null;

      const data = payload[0].payload;
      if (data.isRef) {
        return (
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{data.name}</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                레퍼런스 단지
              </span>
            </div>
            <div className="space-y-1.5 border-t border-gray-100 pt-2 mt-2">
              <p className="text-sm text-gray-900 font-bold">
                <span className="text-gray-400 font-normal mr-2">시세 (84타입)</span> {data.investmentMin}억
              </p>
            </div>
          </div>
        );
      }
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-100 min-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg">{data.name}</h3>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              {data.district}
            </span>
          </div>
          <div className="space-y-1.5 border-t border-gray-100 pt-2 mt-2">
            <p className="text-sm text-gray-600">
              <span className="text-gray-400 mr-2">단계</span> {data.stageStr}
            </p>
            <p className="text-sm text-gray-900 font-bold">
              <span className="text-gray-400 font-normal mr-2">투자금</span> {data.investmentMin}억 ~{" "}
              {data.investmentMax}억
            </p>
          </div>
        </div>
      );
    },
    [pinnedData, isMobile]
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl min-h-screen flex flex-col bg-gray-50/30">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 -ml-2 text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            결과 목록으로 돌아가기
          </Button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">📊</span>
            입지 및 예산별 구역 비교
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            X축: 사업 단계 (우측일수록 안전) · Y축: 예상 실투자금 (억 단위)
          </p>
        </div>

        <div className="flex items-center gap-3 self-start flex-wrap">
          {hasBudget && !showAllZones && (
            <Button variant="outline" onClick={() => setShowAllZones(true)} className="bg-white">
              전체 구역 보기
            </Button>
          )}
          {/* 예산 표시 + 슬라이더 토글 */}
          <div className="relative">
            <button
              onClick={() => setShowBudgetSlider(!showBudgetSlider)}
              className="bg-white border border-indigo-100 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <div className="text-sm font-semibold">
                내 예산 <span className="text-indigo-600">{budgetMinEok.toFixed(1)}억 ~ {budgetMaxEok.toFixed(1)}억</span>
              </div>
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            </button>
            {/* 예산 슬라이더 드롭다운 */}
            {showBudgetSlider && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-indigo-100 rounded-2xl shadow-xl p-5 z-50 w-[320px] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700">예산 범위 조절</span>
                  <button onClick={() => setShowBudgetSlider(false)} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <Slider
                  value={budgetRange}
                  onValueChange={(v) => setBudgetRange(v as [number, number])}
                  min={0.5}
                  max={20}
                  step={0.5}
                  className="mb-3"
                />
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>최소 {budgetMinEok.toFixed(1)}억</span>
                  <span>최대 {budgetMaxEok.toFixed(1)}억</span>
                </div>
                {/* 빠른 범위 버튼 */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {[[1, 3], [3, 5], [5, 8], [8, 12], [10, 20]].map(([min, max]) => (
                    <button
                      key={`${min}-${max}`}
                      onClick={() => setBudgetRange([min, max])}
                      className={`px-2.5 py-1 text-xs rounded-full font-semibold transition-colors ${
                        budgetRange[0] === min && budgetRange[1] === max
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      {min}~{max}억
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 구별 필터 칩 */}
      <div className="mb-4 flex flex-wrap gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => { setActiveDistricts(new Set()); setSelectedDistrict(null); }}
          className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all ${
            activeDistricts.size === 0 && !selectedDistrict
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        {ALL_DISTRICTS.map((district) => {
          const isActive = activeDistricts.has(district) || selectedDistrict === district;
          // 예산 범위 내 구역 수만 카운트 (피드백: 0개 구는 숨김)
          const budgetCount = hasBudget
            ? scatterData.filter((d) =>
                d.district === district &&
                !(d.investmentMin > budgetMaxEok * 1.1 || d.investmentMax < budgetMinEok * 0.9)
              ).length
            : scatterData.filter((d) => d.district === district).length;
          // 예산 필터 활성화 시 0개 구역인 구는 숨김 (전체 보기 모드 제외)
          if (hasBudget && !showAllZones && budgetCount === 0 && !isActive) return null;
          return (
            <button
              key={district}
              onClick={() => handleToggleDistrict(district)}
              className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {district} <span className={`ml-0.5 ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>{budgetCount}</span>
            </button>
          );
        })}
      </div>

      {selectedDistrict && (
        <div className="mb-4 flex items-center gap-3 bg-indigo-600 p-4 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4">
          <MapPin className="h-5 w-5 text-white" />
          <span className="font-bold text-white text-lg">
            &apos;{selectedDistrict}&apos; 구역 집중 분석 중
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDistrict(null)}
            className="ml-auto bg-white/20 hover:bg-white/40 text-white border-none font-bold"
          >
            전체 구역 보기
            <X className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* 모바일 줌 토글 */}
      {isMobile && hasBudget && (
        <div className="mb-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setMobileAutoZoom(!mobileAutoZoom)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              mobileAutoZoom
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 shadow-sm'
            }`}
          >
            {mobileAutoZoom ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {mobileAutoZoom ? '전체 보기' : '예산 맞춤 줌'}
          </button>
        </div>
      )}

      {/* Chart */}
      <div
        className="w-full shadow-2xl border border-gray-100 bg-white rounded-[2rem] overflow-visible relative"
        style={{ height: isMobile ? '450px' : '600px' }}
        onClick={() => setPinnedData(null)}
      >
        <div style={{ width: '100%', height: '100%', padding: isMobile ? '8px' : '32px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: isMobile && autoZoomDomains ? 40 : 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              type="number"
              dataKey="stageDodged"
              domain={autoZoomDomains ? autoZoomDomains.x : [0.5, 9.5]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
              tickFormatter={(val) => (isMobile ? STAGE_LABELS_SHORT : STAGE_LABELS)[val] || ""}
              tick={{ fontSize: isMobile ? 11 : 13, fill: autoZoomDomains ? '#94a3b880' : '#64748b', fontWeight: 600 }}
              axisLine={{ stroke: '#f1f5f9' }}
              tickLine={false}
              dy={15}
            />

            <YAxis
              type="number"
              dataKey="avg"
              unit="억"
              domain={
                autoZoomDomains
                  ? autoZoomDomains.y
                  : [
                      hasBudget && !showAllZones
                        ? Math.max(0, Math.floor(budgetMinEok * 0.5))
                        : 0,
                      hasBudget && !showAllZones
                        ? Math.ceil(budgetMaxEok * 1.8)
                        : 32
                    ]
              }
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
            />

            <ZAxis type="number" range={[64, 64]} />

            <Tooltip
              content={renderTooltip}
              cursor={{ strokeDasharray: "3 3", stroke: "#cbd5e1", strokeWidth: 1 }}
              trigger="hover"
            />

            {/* Budget range band as a reference area */}
            {hasBudget && (
              <rect
                x="0%"
                y="0"
                width="100%"
                height="100%"
                fill="none"
              />
            )}

            <Scatter
              name="재개발 구역"
              data={displayData}
              shape={<DumbbellShape onPointClick={handlePointClick} />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
        </div>

        {pinnedData && pinnedData.cx && (
          <div
            className="absolute z-50 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-indigo-200 min-w-[240px] max-w-[300px] animate-in zoom-in-95 pointer-events-auto"
            style={{ 
              left: pinnedData.cx, 
              top: pinnedData.cy, 
              transform: 'translate(-50%, -100%)', 
              marginTop: '-16px' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{pinnedData.name}</h3>
              <button
                className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setPinnedData(null)}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {pinnedData.isRef ? (
              <div className="space-y-1.5 border-t border-gray-100 pt-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                  레퍼런스 기축 단지
                </span>
                <p className="text-sm text-gray-900 font-bold mt-1.5">
                  <span className="text-gray-400 font-normal mr-2">시세 (84타입)</span>{" "}
                  {pinnedData.investmentMin}억
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 border-t border-gray-100 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {pinnedData.district}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="text-gray-400 mr-2">단계</span>
                  <span className="font-semibold text-gray-800">{pinnedData.stageStr}</span>
                </p>
                <p className="text-sm text-gray-900 font-bold">
                  <span className="text-gray-400 font-normal mr-2">투자금</span>
                  {pinnedData.investmentMin}억
                  {pinnedData.investmentMax !== pinnedData.investmentMin
                    ? ` ~ ${pinnedData.investmentMax}억`
                    : ""}
                </p>

                {/* item 3: 구역 자세히 보기 → 비교분석 페이지 연결 */}
                <div className="pt-2 mt-1 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => {
                      router.push(`/app/comparison/${encodeURIComponent(pinnedData.id)}?budget=${Math.round(budgetMinEok * 100000000)}`);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    &apos;{pinnedData.name}&apos; 자세히 보기
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDistrict(pinnedData.district);
                      setPinnedData(null);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition-colors"
                  >
                    &apos;{pinnedData.district}&apos; 모아보기
                  </button>
                </div>
              </div>
            )}
            
            {/* Tooltip arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-indigo-200 transform rotate-45"></div>
          </div>
        )}
      </div>

      {/* 모바일 자동 줌 시 하단 단계 바 (반투명 오버레이) */}
      {isMobile && autoZoomDomains && (
        <div className="mt-2 flex justify-between items-center bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((s) => (
            <span key={s} className="text-[10px] font-bold text-gray-400/70 text-center leading-tight">
              {STAGE_LABELS_SHORT[s]}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 md:mt-8 flex flex-wrap gap-4 md:gap-8 justify-center text-sm font-bold text-gray-500 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100">
        {Object.entries(TIER_COLORS)
          .filter(([k]) => k !== "T_REF")
          .map(([tier, color]) => (
            <div key={tier} className="flex items-center gap-2">
              <svg width="14" height="18" viewBox="0 0 14 18">
                <circle cx="7" cy="3" r="2.5" fill={color} />
                <line x1="7" y1="3" x2="7" y2="15" stroke={color} strokeWidth="1.5" />
                <circle cx="7" cy="15" r="2.5" fill={color} />
              </svg>
              <span className="text-xs md:text-sm">
                {tier === "T1" ? "1~3억" : tier === "T2" ? "3~5억" : tier === "T3" ? "5~10억" : "10억+"}
              </span>
            </div>
          ))}
        <div className="flex items-center gap-2">
          <div
            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] shadow-sm"
            style={{ borderBottomColor: TIER_COLORS.T_REF }}
          />
          <span className="text-xs md:text-sm">레퍼런스 기축 단지</span>
        </div>
      </div>

      {/* Chart reading guide */}
      <div className="mt-3 md:mt-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-[11px] md:text-xs text-gray-400">
          💡 각 점은 재개발 구역의 <span className="font-semibold text-gray-600">실투자금 범위(Min~Max)</span>를 덤벨 형태로 표시합니다.
          {isMobile ? '' : ' 동일 단계의 구역은 좌우로 나란히 배치되어 겹침 없이 비교할 수 있습니다.'}
        </p>
      </div>
    </div>
  );
}

export default function ScatterChartPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400 font-medium animate-pulse">
          구역 데이터를 시각화하는 중...
        </div>
      }
    >
      <ScatterChartContent />
    </Suspense>
  );
}
