"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Search } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import { hexafitZones, type HexafitZoneInput } from "@/app/lib/hexafitData";
import { HEXAFIT_ATTRIBUTES } from "@/lib/hexafit/attributes";
import { zoneMatchesQuery } from "@/lib/hexafit/zoneSearch";
import {
  scoreZone,
  buildInvestmentScale,
  investmentScaleCaption,
  HEX_AXIS_META,
  type HexAxis,
  type ZoneHexScore,
} from "@/lib/hexafit/scoring";

const COLORS = ["#ec4899", "#8b5cf6", "#10b981", "#f59e0b"]; // 핑크·보라·초록·앰버
const MAX_SELECT = 4;
const RADIUS_MAX = 10;

function plotValue(axis: HexAxis, score: ZoneHexScore): number {
  return score.axes[axis].value ?? 0;
}

export default function HexafitExplorer({ initialZones }: { initialZones?: string[] }) {
  const router = useRouter();

  const investmentScale = useMemo(
    () =>
      buildInvestmentScale(
        hexafitZones.flatMap((z) => (z.minInvestmentBillion == null ? [] : [z.minInvestmentBillion])),
      ),
    [],
  );

  // 전 구역 1회 채점. 투자금 점수는 이 데이터셋의 중간값·상위 25%·최고가에 고정한다.
  const scoredAll = useMemo(() => {
    const map = new Map<string, { input: HexafitZoneInput; score: ZoneHexScore }>();
    for (const z of hexafitZones) {
      map.set(z.zoneName, {
        input: z,
        score: scoreZone({ ...z, attributes: HEXAFIT_ATTRIBUTES[z.naturalKey] }, investmentScale),
      });
    }
    return map;
  }, [investmentScale]);

  const defaultSelection = useMemo(() => {
    const fromQuery = (initialZones ?? []).filter((n) => scoredAll.has(n));
    if (fromQuery.length) return fromQuery.slice(0, MAX_SELECT);
    // 6축 완결 구역 중 대비가 좋은 기본 2개
    const preferred = ["성수전략1구역", "미아 2구역"].filter((n) => scoredAll.has(n));
    if (preferred.length) return preferred;
    return [...scoredAll.keys()].slice(0, 2);
  }, [initialZones, scoredAll]);

  const [selected, setSelected] = useState<string[]>(defaultSelection);
  const [query, setQuery] = useState("");
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const coreZones = useMemo(
    () => hexafitZones.filter((z) => z.coverage === "CORE"),
    [],
  );

  const districts = useMemo(
    () => Array.from(new Set(coreZones.map((z) => z.district))),
    [coreZones],
  );

  const selectedScores = useMemo(
    () => selected.map((n) => scoredAll.get(n)!).filter(Boolean),
    [selected, scoredAll],
  );

  // recharts 레이더 데이터: 6축 × 선택 구역
  const radarData = useMemo(() => {
    return HEX_AXIS_META.map(({ key, label }) => {
      const row: Record<string, number | string> = { axis: label, fullMark: RADIUS_MAX };
      selectedScores.forEach(({ input }, idx) => {
        row[`z${idx}`] = plotValue(key, scoredAll.get(input.zoneName)!.score);
      });
      return row;
    });
  }, [selectedScores, scoredAll]);

  const filteredZones = useMemo(() => {
    return coreZones.filter((z) => {
      if (activeDistrict && z.district !== activeDistrict) return false;
      return zoneMatchesQuery(z, query);
    });
  }, [coreZones, query, activeDistrict]);

  const toggle = (zoneName: string) => {
    setSelected((prev) => {
      if (prev.includes(zoneName)) return prev.filter((n) => n !== zoneName);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, zoneName];
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl min-h-screen flex flex-col bg-gray-50/30">
      <div className="mb-5">
        <button
          onClick={() => router.back()}
          className="mb-2 -ml-1 inline-flex items-center text-sm text-gray-400 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> 뒤로
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <span className="p-1.5 bg-indigo-600 rounded-lg text-white">⬡</span>
          구역 육각형 비교
        </h1>
        <p className="text-gray-500 text-sm mt-1.5 font-medium">
          급지 · 상품성 · 규모 · 필요투자금 · 안정성 · 사업성 6개 축으로 최대 {MAX_SELECT}개 구역을 겹쳐 봅니다.
        </p>
      </div>

      {/* 선택 칩 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {selectedScores.map(({ input, score }, idx) => (
          <span
            key={input.zoneName}
            className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: COLORS[idx] }}
          >
            {input.zoneName}
            <span className="text-[11px] font-semibold opacity-80">{score.scoredCount}/6</span>
            <button
              onClick={() => toggle(input.zoneName)}
              className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-black/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {selected.length < MAX_SELECT && (
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" /> 구역 추가
          </button>
        )}
      </div>

      {/* 구역 선택기 */}
      {pickerOpen && (
        <div className="mb-5 bg-white border border-gray-100 rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="구역·구·동 검색"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button onClick={() => setPickerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setActiveDistrict(null)}
              className={`px-2.5 py-1 text-xs rounded-full font-semibold ${activeDistrict === null ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              전체
            </button>
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDistrict(d)}
                className={`px-2.5 py-1 text-xs rounded-full font-semibold ${activeDistrict === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-gray-50">
            {filteredZones.map((z) => {
              const sc = scoredAll.get(z.zoneName)!.score;
              const isSel = selected.includes(z.zoneName);
              const disabled = !isSel && selected.length >= MAX_SELECT;
              return (
                <button
                  key={z.naturalKey}
                  onClick={() => toggle(z.zoneName)}
                  disabled={disabled}
                  className={`w-full flex items-center justify-between py-2.5 px-2 text-left rounded-lg ${isSel ? "bg-indigo-50" : disabled ? "opacity-40" : "hover:bg-gray-50"}`}
                >
                  <div>
                    <div className="text-sm font-bold text-gray-800">{z.zoneName}</div>
                    <div className="text-xs text-gray-400">
                      {z.district} {z.dong} · {z.stage}
                      {z.minInvestmentBillion != null ? ` · 초투 ${z.minInvestmentBillion}억` : ""}
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.scoredCount === 6 ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                    {sc.scoredCount}/6
                  </span>
                </button>
              );
            })}
            {filteredZones.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-400">검색 결과 없음</div>
            )}
          </div>
        </div>
      )}

      {/* 레이더 */}
      {selectedScores.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-12 text-center text-gray-400">
          비교할 구역을 추가하세요.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-4 md:p-8">
          <div className="w-full" style={{ height: 460 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }} />
                <PolarRadiusAxis
                  domain={[0, RADIUS_MAX]}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickCount={4}
                  angle={90}
                />
                {selectedScores.map((_, idx) => (
                  <Radar
                    key={idx}
                    dataKey={`z${idx}`}
                    stroke={COLORS[idx]}
                    fill={COLORS[idx]}
                    fillOpacity={0.14}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-1">
            6축 모두 0~10점. 필요 투자금은 현재 {investmentScale?.count ?? 0}곳 기준{" "}
            {investmentScale ? investmentScaleCaption(investmentScale) : ""}. 데이터 갱신 때 기준이 다시 계산됩니다.
          </p>
        </div>
      )}

      {/* 구역별 상세 카드 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedScores.map(({ input, score }, idx) => (
          <div key={input.zoneName} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
              <h3 className="font-extrabold text-gray-900">{input.zoneName}</h3>
              <span className="ml-auto text-xs font-bold text-gray-400">{score.scoredCount}/6 축</span>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              {input.district} {input.dong} · {input.stage}
              {input.benchmarkName ? ` · 기축 ${input.benchmarkName} ${input.benchmarkPriceBillion ?? ""}억` : ""}
            </div>
            <ul className="space-y-1.5">
              {HEX_AXIS_META.map(({ key, label }) => {
                const a = score.axes[key];
                const missing = a.status === "missing";
                const display = missing ? "미지정" : `${a.value} / 10`;
                return (
                  <li key={key} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className={`text-right ${missing ? "text-gray-300" : "font-semibold text-gray-800"}`}>
                      {display}
                      <span className="block text-[10px] font-normal text-gray-400">{a.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {score.diagnosis.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {score.diagnosis.map((d, i) => (
                  <p key={i} className="text-xs text-indigo-700 bg-indigo-50 rounded-lg px-2.5 py-1.5 leading-snug">
                    {d}
                  </p>
                ))}
              </div>
            )}
            {input.memberEstimated && (
              <p className="mt-2 text-[10px] text-amber-600">
                ※ 조합원 세대수는 토지등소유자 기반 추정치 → 사업성(10시) 참고용
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] text-gray-400 leading-relaxed">
        12시 급지는 급지표 100점을 10으로 나눈 값입니다. 성수 1.6은 99점, 화면에는 9.9입니다.
        2시·4시 가점은 정비구역 지정 이후(CORE)로 승인한 구역만 반영합니다.
        값이 없는 축은 &quot;미지정&quot;으로 표기합니다.
      </p>
    </div>
  );
}
