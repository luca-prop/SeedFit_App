"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Calculator,
  Clock3,
  LineChart,
  RotateCcw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BudgetRangeSearch } from "@/components/b2c/BudgetRangeSearch";
import { scatterData } from "@/app/lib/scatterData";
import { PROGRESS_DATES } from "@/app/lib/scatterDates";
import { COMPARISON_APTS } from "@/lib/mockData";

/* ───────────────────────── Animated Counter ───────────────────────── */
function Counter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = Math.ceil(end / (duration / 16));
      const id = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(id); }
        else setCount(start);
      }, 16);
      observer.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ───────────────────────── CTA Button ───────────────────────── */
function CTAButton({ className = "", children, href = "#budget-search" }: { className?: string; children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {children}
      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
    </Link>
  );
}

function LineIcon({ icon: Icon, tone = "blue" }: { icon: LucideIcon; tone?: "blue" | "indigo" | "purple" | "cyan" }) {
  const toneClass = {
    blue: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
    indigo: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/20",
    purple: "bg-purple-500/10 text-purple-300 ring-purple-400/20",
    cyan: "bg-cyan-500/10 text-cyan-300 ring-cyan-400/20",
  }[tone];

  return (
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${toneClass}`}>
      <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}

const RESULT_PREVIEW_BUDGET_KRW = 300_000_000;

const RESULT_PREVIEW_ZONES = [
  {
    id: "zone-9",
    zone: "청파3구역",
    scatterName: "청파 3구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    match: "100%",
    price: "3.0억",
    futureValue: "30.2억 / 30.6억",
    referenceApts: [
      { name: "이촌한가람", price: "30.2억" },
      { name: "마포자이힐스테이트라첼스", price: "30.6억", note: "분양권" },
    ],
    stageColor: "bg-blue-500/20 text-blue-300",
    chartColor: "#60a5fa",
  },
  {
    id: "zone-73",
    zone: "신정1구역",
    scatterName: "신정 1구역",
    district: "양천구",
    stage: "신속통합기획 대상지 선정",
    match: "100%",
    price: "3.0억",
    futureValue: "21.3억",
    referenceApts: [
      { name: "목동힐스테이트", price: "21.3억" },
    ],
    stageColor: "bg-blue-500/20 text-blue-300",
    chartColor: "#22d3ee",
  },
  {
    id: "zone-71",
    zone: "수택 2구역",
    scatterName: "수택 2구역",
    district: "구리시",
    stage: "조합설립인가",
    match: "87%",
    price: "2.6억",
    futureValue: "13.5억",
    referenceApts: [
      { name: "e편한세상인창어반포레", price: "13.5억" },
    ],
    stageColor: "bg-purple-500/20 text-purple-300",
    chartColor: "#a78bfa",
  },
];

const RESULT_PREVIEW_ZONE_BY_SCATTER_NAME = new Map(RESULT_PREVIEW_ZONES.map((zone) => [zone.scatterName, zone]));

const COMPARISON_PREVIEW_APTS = COMPARISON_APTS.filter((apt) =>
  ["월계동신", "다산e편한세상자이", "주공뜨란채"].includes(apt.name),
).sort((left, right) => left.numInvestment - right.numInvestment);

function getScatterCollisionKey(zone: { stage: number; investmentMin: number }) {
  return `${zone.stage}-${zone.investmentMin}`;
}

function getProgressAdjustedStages<T extends { id: string; name: string; stage: number; investmentMin: number }>(zones: T[]) {
  const groups = new Map<string, T[]>();

  zones.forEach((zone) => {
    const key = getScatterCollisionKey(zone);
    groups.set(key, [...(groups.get(key) ?? []), zone]);
  });

  const adjustedStages = new Map<string, number>();

  groups.forEach((group) => {
    const sorted = [...group].sort((left, right) => {
      const leftDate = PROGRESS_DATES[left.name] ?? 99999999;
      const rightDate = PROGRESS_DATES[right.name] ?? 99999999;

      if (leftDate !== rightDate) {
        return leftDate - rightDate;
      }

      return left.name.localeCompare(right.name, "ko");
    });

    const centerIndex = (sorted.length - 1) / 2;
    sorted.forEach((zone, index) => {
      // 같은 단계/예산이면 더 빠른 진행일을 오른쪽에 두고, 동일일자도 미세 분산해 겹침을 피합니다.
      adjustedStages.set(zone.id, zone.stage + (centerIndex - index) * 0.04);
    });
  });

  return adjustedStages;
}

const rawScatterPreviewData = scatterData
  .filter((zone) => zone.investmentMin <= 3 && zone.investmentMax >= 3);

const adjustedScatterStages = getProgressAdjustedStages(rawScatterPreviewData);

const scatterPreviewData = rawScatterPreviewData
  .filter((zone) => zone.investmentMin <= 3 && zone.investmentMax >= 3)
  .map((zone) => ({
    ...zone,
    previewZone: RESULT_PREVIEW_ZONE_BY_SCATTER_NAME.get(zone.name),
    previewLabel: RESULT_PREVIEW_ZONE_BY_SCATTER_NAME.get(zone.name)?.zone ?? "",
    adjustedStage: adjustedScatterStages.get(zone.id) ?? zone.stage,
    displayInvestment: `${zone.investmentMin.toFixed(1)}억 ~ ${zone.investmentMax.toFixed(1)}억`,
  }))
  .sort((left, right) => Number(Boolean(left.previewZone)) - Number(Boolean(right.previewZone)));

type ScatterPreviewPoint = (typeof scatterPreviewData)[number];

function formatComparisonHref(zoneId: string) {
  return `/app/comparison/${zoneId}?budget=${RESULT_PREVIEW_BUDGET_KRW}`;
}

function formatScatterHref() {
  return `/app/scatter?budgetMin=${RESULT_PREVIEW_BUDGET_KRW}&budgetMax=${RESULT_PREVIEW_BUDGET_KRW}`;
}

function ScatterPreviewTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScatterPreviewPoint }> }) {
  const point = payload?.[0]?.payload;

  if (!active || !point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 shadow-xl">
      <p className="text-sm font-black">{point.name}</p>
      <p className="mt-1 text-xs text-slate-500">사업단계: <span className="font-bold text-slate-800">{point.stageStr}</span></p>
      <p className="mt-1 text-xs text-slate-500">초기투자금: <span className="font-bold text-blue-700">{point.displayInvestment}</span></p>
    </div>
  );
}

function ScatterPreviewLabel({ x, y, index }: { x?: number | string; y?: number | string; index?: number }) {
  const point = typeof index === "number" ? scatterPreviewData[index] : null;

  if (!point?.previewZone || !point.previewLabel) {
    return null;
  }

  const numericX = Number(x);
  const numericY = Number(y);

  if (!Number.isFinite(numericX) || !Number.isFinite(numericY)) {
    return null;
  }

  const labelPosition = {
    "zone-9": { dx: -8, dy: -18, textAnchor: "end" as const },
    "zone-73": { dx: 8, dy: -18, textAnchor: "start" as const },
    "zone-71": { dx: 0, dy: -18, textAnchor: "middle" as const },
  }[point.previewZone.id] ?? { dx: 0, dy: -18, textAnchor: "middle" as const };

  return (
    <text
      x={numericX + labelPosition.dx}
      y={numericY + labelPosition.dy}
      textAnchor={labelPosition.textAnchor}
      fill="#e2e8f0"
      fontSize={12}
      fontWeight={800}
    >
      {point.previewLabel}
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LANDING PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedPreviewZoneId, setSelectedPreviewZoneId] = useState(RESULT_PREVIEW_ZONES[0].id);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const selectedPreviewZone = RESULT_PREVIEW_ZONES.find((zone) => zone.id === selectedPreviewZoneId) ?? RESULT_PREVIEW_ZONES[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0F1C] text-white">
      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrollY > 60 ? "bg-[#0A0F1C]/90 backdrop-blur-lg shadow-lg shadow-black/20 border-b border-white/5" : ""}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/seedfit_logo2_Favicon_navy_backdel.png" alt="씨드핏" width={36} height={36} priority className="rounded-lg drop-shadow-[0_0_8px_rgba(99,102,241,.4)]" />
            <span className="text-xl font-extrabold tracking-tight">씨드핏</span>
          </Link>
          <CTAButton className="!px-5 !py-2.5 !text-sm !rounded-xl">지금 시작하기</CTAButton>
        </div>
      </nav>

      {/* ══════════ SECTION 1 — Hero ══════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-5 pt-20 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute right-1/4 top-2/3 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <span className="mb-5 inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-300 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              예산 맞춤 재개발 투자 분석 플랫폼
            </span>
          </span>

          <h1 className="mb-6 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            가용 현금만 입력하면<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              타겟 구역이 즉시 나옵니다
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
            엑셀 노가다, 찌라시, 허위매물에 지치셨나요?<br className="hidden sm:block" />
            씨드핏이 <strong className="text-white">3초 안에</strong> 내 예산으로 진입 가능한 재개발 구역을 찾아드립니다.
          </p>

          <BudgetRangeSearch />

          <p className="text-xs text-gray-500">가입 없이 무료로 시작 · 30초 만에 결과 확인</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* ══════════ SECTION 2 — Social Proof (Numbers) ══════════ */}
      <section className="relative border-y border-white/5 bg-[#0D1225] py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-5 sm:grid-cols-4">
          {[
            { value: 1247, suffix: "개", label: "분석 대상 구역" },
            { value: 15, suffix: "시간→30초", label: "탐색 시간 단축" },
            { value: 5, suffix: "%", label: "실투자금 오차 이내" },
            { value: 0, suffix: "%", label: "허위매물 노출률" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white sm:text-4xl">
                <Counter end={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ SECTION 3 — Input → Output Diagram (C유형 핵심) ══════════ */}
      <section className="py-20 px-5 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold text-blue-400">HOW IT WORKS</span>
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">입력 한 번, 결과는 즉시</h2>
          <p className="mx-auto mb-14 max-w-lg text-gray-400">
            복잡한 과정은 씨드핏 엔진이 알아서 처리합니다. 당신은 가용 현금만 입력하세요.
          </p>

          {/* 3-Step Diagram */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: "1", icon: WalletCards, title: "가용 현금 입력", desc: "내가 쓸 수 있는 현금을 입력합니다.", color: "from-blue-500/20 to-blue-600/5", tone: "blue" as const },
              { step: "2", icon: Calculator, title: "씨드핏 엔진 분석", desc: "필요 초기투자금을 자동 역산합니다.", color: "from-indigo-500/20 to-indigo-600/5", tone: "indigo" as const },
              { step: "3", icon: BarChart3, title: "맞춤 구역 리스트", desc: "진입 가능한 구역 + 기축 비교 리포트!", color: "from-purple-500/20 to-purple-600/5", tone: "purple" as const },
            ].map((item, i) => (
              <div key={item.step} className="group relative">
                {i < 2 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-2xl text-gray-600 sm:block">→</div>
                )}
                <div className={`rounded-2xl border border-white/5 bg-gradient-to-b ${item.color} p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:scale-[1.03]`}>
                  <div className="mb-3">
                    <LineIcon icon={item.icon} tone={item.tone} />
                  </div>
                  <div className="mb-1 text-xs font-bold text-blue-400">STEP {item.step}</div>
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 4 — Value Proposition (Benefits) ══════════ */}
      <section className="border-y border-white/5 bg-[#0D1225] py-20 px-5 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="mb-3 inline-block text-sm font-semibold text-indigo-400">WHY SEEDFIT</span>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">엑셀 노가다는 이제 그만</h2>
            <p className="mx-auto max-w-lg text-gray-400">씨드핏은 기존 방식과 완전히 다른 접근법으로 재개발 투자의 문턱을 낮춥니다.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: RotateCcw, title: "역방향 필터링", desc: "구역을 먼저 찾는 게 아니라, 내 예산이 먼저. 진입 가능한 구역만 자동 도출합니다.", highlight: true, tone: "blue" as const },
              { icon: Scale, title: "1:1 대조 분석", desc: "재개발 구역 vs 기축 아파트를 동일 예산 기준으로 비교. 기회비용을 명확히 파악하세요.", tone: "indigo" as const },
              { icon: BadgeCheck, title: "Verified 매물", desc: "현지 파트너 중개사가 교차 검증한 매물만 노출. 허위매물로 인한 헛걸음이 없습니다.", tone: "cyan" as const },
              { icon: LineChart, title: "오차율 ±5% 이내", desc: "국토부 실거래가 기반의 정밀 역산 엔진. 시세 오차를 최소화했습니다.", tone: "purple" as const },
              { icon: Clock3, title: "3초 이내 결과", desc: "주 15시간 걸리던 구역 탐색을 3초로. 시간 빈곤한 직장인에게 최적화.", tone: "blue" as const },
              { icon: ShieldCheck, title: "리스크 시각화", desc: "사업 단계, 분담금 변동, 전고점 회복률까지. 투자 리스크를 숫자로 보여드립니다.", tone: "indigo" as const },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${card.highlight ? "border-blue-500/30 bg-blue-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"}`}>
                <div className="mb-3">
                  <LineIcon icon={card.icon} tone={card.tone} />
                </div>
                <h3 className="mb-2 text-lg font-bold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 5 — Before & After (C유형: ROI) ══════════ */}
      <section className="py-20 px-5 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold text-purple-400">BEFORE & AFTER</span>
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">도입 전후, 이 정도 차이납니다</h2>
          <p className="mx-auto mb-14 max-w-lg text-gray-400">같은 목표, 완전히 다른 과정과 시간.</p>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-5 py-4 font-semibold text-gray-400">항목</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">기존 방식</th>
                  <th className="px-5 py-4 font-semibold text-blue-400">씨드핏</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["타겟 구역 탐색", "주 15시간 (엑셀 수작업)", "30초 (자동 역산)"],
                  ["기축 vs 재개발 비교", "직접 조사·계산 (3일+)", "원클릭 리포트 (즉시)"],
                  ["매물 신뢰도", "찌라시·허위매물 60%", "Verified 검증 100%"],
                  ["초기투자금 오차", "감으로 추정 (±30%)", "데이터 기반 (±5%)"],
                  ["LTV·취득세 반영", "수동 계산 (오류 빈번)", "자동 역산 (정책 실시간 반영)"],
                ].map(([item, before, after]) => (
                  <tr key={item} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-medium text-gray-300">{item}</td>
                    <td className="px-5 py-3.5 text-gray-500">{before}</td>
                    <td className="px-5 py-3.5 font-semibold text-blue-300">{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 6 — Outcome Showcase (C유형: 결과물 갤러리) ══════════ */}
      <section className="border-t border-white/5 bg-[#0D1225] pt-20 pb-6 px-5 sm:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold text-blue-400">RESULT PREVIEW</span>
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">3억 예산 기준 맞춤 구역 3곳</h2>
          <p className="mx-auto mb-8 max-w-lg text-gray-400">가용 현금 2.5~3억 기준으로 진입 가능한 구역을 선별한 결과 예시입니다.</p>

          <div className="grid gap-4 sm:grid-cols-3">
            {RESULT_PREVIEW_ZONES.map((r) => (
              <button
                key={r.zone}
                type="button"
                onClick={() => setSelectedPreviewZoneId(r.id)}
                onMouseEnter={() => setSelectedPreviewZoneId(r.id)}
                onFocus={() => setSelectedPreviewZoneId(r.id)}
                className={`group rounded-2xl border p-5 text-left transition-all hover:border-blue-300/40 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                  selectedPreviewZoneId === r.id ? "border-blue-300/50 bg-blue-400/10" : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${r.stageColor}`}>{r.stage}</span>
                  <span className="text-xs text-gray-500">{r.district}</span>
                </div>
                <h3 className="mb-1 text-lg font-bold">{r.zone}</h3>
                <p className="mb-3 text-sm text-gray-500">예상 초기투자금 <span className="font-bold text-white">{r.price}</span></p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700" style={{ width: r.match }} />
                  </div>
                  <span className="text-sm font-bold text-blue-400">{r.match}</span>
                </div>
                <p className="mt-4 text-xs font-semibold text-blue-200">선택하면 아래 1:1 프리뷰가 바뀝니다</p>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/app/results?budgetMin=300000000&budgetMax=300000000"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-blue-50"
            >
              3억 검색 결과 전체 보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="text-sm font-semibold text-gray-500">카드에 마우스를 올리거나 클릭해 비교 프리뷰를 바꿔보세요.</span>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 7 — Comparison Preview ══════════ */}
      <section id="comparison-preview" className="border-b border-white/5 bg-[#0D1225] pt-0 pb-20 px-5 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 text-center">
            <span className="mb-3 inline-block text-sm font-semibold text-cyan-400">ZONE DETAIL PREVIEW</span>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">구역 정보는 이렇게 비교됩니다</h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              3억 예산으로 선택한 구역을 실제 상세 화면에서 재개발 구역과 기축 레퍼런스 기준으로 나란히 확인합니다.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-blue-950/20">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-300/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-200">Preview · 1:1 비교 대시보드</span>
            </div>

            <div className="space-y-5 p-5 lg:p-7">
              <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-blue-400/20 px-3 py-1 text-xs font-black text-blue-200">재개발구역</span>
                  <span className="text-xs font-semibold text-gray-400">예산 3.0억 기준</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedPreviewZone.zone}</h3>
                      <p className="mt-1 text-sm text-gray-400">{selectedPreviewZone.district} · {selectedPreviewZone.stage}</p>
                    </div>
                    <span className="rounded-full bg-blue-400/15 px-3 py-1 text-sm font-black text-blue-200">{selectedPreviewZone.match}</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <p className="text-xs text-gray-500">예상 초기투자금</p>
                      <p className="mt-1 text-xl font-black text-white">{selectedPreviewZone.price}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-4">
                      <p className="text-xs text-gray-500">매칭 적합도</p>
                      <p className="mt-1 text-xl font-black text-blue-200">{selectedPreviewZone.match}</p>
                    </div>
                  </div>
                  <Link
                    href={formatComparisonHref(selectedPreviewZone.id)}
                    className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:from-blue-400 hover:to-indigo-500"
                  >
                    {selectedPreviewZone.zone} 비교 페이지로 이동
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-lg bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-200">기축 레퍼런스</span>
                  <Scale className="h-5 w-5 text-cyan-200" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-semibold text-gray-500">{selectedPreviewZone.zone} 잠재 미래 가치 비교 기준</p>
                  <div className="mt-3 space-y-3">
                    {selectedPreviewZone.referenceApts.map((apt) => (
                      <div key={`${selectedPreviewZone.id}-${apt.name}`} className="rounded-xl bg-white/[0.04] p-4">
                        <p className="text-sm font-bold text-white">{apt.name}</p>
                        <p className="mt-1 text-xl font-black text-blue-300">
                          {apt.price}
                          {apt.note ? <span className="ml-1 text-sm font-bold text-blue-200">({apt.note})</span> : null}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    레퍼런스 단지는 재개발 후 예상 시세를 가늠하기 위한 비교군이며, 동일 예산으로 살 수 있는 기축 아파트 대조군과는 별도 개념입니다.
                  </p>
                </div>
                <Link
                  href={formatComparisonHref(selectedPreviewZone.id)}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:from-blue-400 hover:to-indigo-500"
                >
                  실제 1:1 비교 페이지로 이동
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="rounded-lg bg-indigo-400/15 px-3 py-1 text-xs font-black text-indigo-200">기축 아파트 비교군</span>
                    <p className="mt-3 text-sm text-gray-400">동일 3억 예산으로 검토 가능한 기축 아파트 대조군 예시입니다.</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">필요 실투자금은 생애최초 LTV 70% 가정</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {COMPARISON_PREVIEW_APTS.map((apt) => (
                    <div key={apt.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{apt.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{apt.aptType}타입</p>
                        </div>
                        <span className="rounded-full bg-blue-400/15 px-2.5 py-1 text-xs font-black text-blue-200">LTV</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-xs text-gray-500">필요 실투자금</p>
                          <p className="mt-1 font-black text-blue-300">{apt.requiredInvestment}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-xs text-gray-500">최근시세</p>
                          <p className="mt-1 font-black text-white">{apt.recentPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 8 — Scatter Preview ══════════ */}
      <section id="scatter-preview" className="border-y border-white/5 bg-[#0D1225] py-20 px-5 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block text-sm font-semibold text-purple-400">SCATTER CHART PREVIEW</span>
            <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">3억 예산 구역을 한눈에 보기</h2>
            <p className="mx-auto max-w-2xl text-gray-400">
              실제 스캐터 데이터에서 3억 예산선에 걸리는 구역을 사업 단계와 초기투자금 기준으로 표시합니다.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white">사업 단계 × 예상 초기투자금</p>
                  <p className="text-xs text-gray-500">강조점: 청파3구역, 신정1구역, 수택 2구역</p>
                </div>
                <Link
                  href={formatScatterHref()}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-purple-300/20 bg-purple-400/10 px-4 py-2 text-sm font-bold text-purple-100 transition hover:border-purple-200/40 hover:bg-purple-400/15"
                >
                  전체 스캐터 차트 보기
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 16, right: 16, bottom: 20, left: 0 }}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="adjustedStage"
                      name="사업 단계"
                      domain={[1, 4]}
                      ticks={[1.3, 2.1, 3.1]}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (value === 1.3) return "신속통합기획 대상지 선정";
                        if (value === 2.1) return "정비구역 지정";
                        if (value === 3.1) return "조합설립인가";
                        return String(value);
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="investmentMin"
                      name="초기투자금"
                      domain={[0, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickFormatter={(value) => `${value}억`}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={<ScatterPreviewTooltip />}
                    />
                    <ReferenceLine y={3} stroke="#f8fafc" strokeDasharray="4 4" label={{ value: "3억", fill: "#e2e8f0", fontSize: 12 }} />
                    <Scatter data={scatterPreviewData} name="3억 예산 후보" dataKey="investmentMin">
                      {scatterPreviewData.map((zone) => (
                        <Cell
                          key={zone.id}
                          fill={zone.previewZone?.chartColor ?? "rgba(148, 163, 184, 0.28)"}
                          stroke={zone.previewZone ? "#e0f2fe" : "rgba(148, 163, 184, 0.18)"}
                          strokeWidth={zone.previewZone ? 2 : 1}
                        />
                      ))}
                      <LabelList
                        dataKey="previewLabel"
                        content={<ScatterPreviewLabel />}
                      />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-black text-white">3억 예산 매칭 구역</p>
              <div className="mt-4 space-y-3">
                {RESULT_PREVIEW_ZONES.map((zone) => (
                  <Link
                    key={zone.id}
                    href={formatComparisonHref(zone.id)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-blue-300/40"
                  >
                    <div>
                      <p className="font-black text-white">{zone.zone}</p>
                      <p className="mt-1 text-xs text-gray-500">{zone.stage}</p>
                    </div>
                    <span className="text-sm font-black text-blue-300">{zone.price}</span>
                  </Link>
                ))}
              </div>
              <Link
                href={formatScatterHref()}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-purple-50"
              >
                스캐터 차트로 이동
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 9 — Mid CTA ══════════ */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">지금 바로 확인해 보세요</h2>
          <p className="mb-8 text-gray-400">가입 없이, 무료로 시작할 수 있습니다.</p>
          <CTAButton>무료로 분석 시작하기</CTAButton>
        </div>
      </section>

      {/* ══════════ SECTION 10 — Partner Logos ══════════ */}
      <section className="border-y border-white/5 bg-[#0D1225] py-14 px-5">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-sm font-medium text-gray-500">데이터 파트너 & 신뢰 기반</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["국토교통부", "한국부동산원", "서울시 정비사업", "공인중개사협회"].map((name) => (
              <span key={name} className="text-sm font-bold tracking-wider text-gray-400">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 11 — Final CTA ══════════ */}
      <section className="relative py-24 px-5 sm:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-black sm:text-5xl">
            재개발 투자,<br />더 이상 어렵지 않습니다
          </h2>
          <p className="mb-10 text-lg text-gray-400">내 가용 현금 하나로 시작하는 스마트 투자 분석</p>
          <CTAButton className="!text-xl !px-10 !py-5">지금 무료로 시작하기</CTAButton>
          <p className="mt-4 text-xs text-gray-600">회원가입 불필요 · 즉시 결과 확인 가능</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#070B16] py-8 px-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-xs text-gray-600">
          <p>© 2026 씨드핏(Seed Fit). All rights reserved.</p>
          <p className="inline-flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            본 서비스의 데이터는 국토부 실거래가 기준이며 현장 호가와 다를 수 있습니다. 투자 판단의 책임은 이용자에게 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
