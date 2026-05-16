"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
function CTAButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <Link
      href="/app"
      className={`group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {children}
      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LANDING PAGE                                                      */
/* ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

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
            🏗️ 예산 맞춤 재개발 투자 분석 플랫폼
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

          <CTAButton className="mb-8">내 예산으로 구역 찾기</CTAButton>

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
              { step: "1", icon: "💰", title: "가용 현금 입력", desc: "내가 쓸 수 있는 현금을 입력합니다.", color: "from-blue-500/20 to-blue-600/5" },
              { step: "2", icon: "⚡", title: "씨드핏 엔진 분석", desc: "필요 초기투자금을 자동 역산합니다.", color: "from-indigo-500/20 to-indigo-600/5" },
              { step: "3", icon: "📊", title: "맞춤 구역 리스트", desc: "진입 가능한 구역 + 기축 비교 리포트!", color: "from-purple-500/20 to-purple-600/5" },
            ].map((item, i) => (
              <div key={item.step} className="group relative">
                {i < 2 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-2xl text-gray-600 sm:block">→</div>
                )}
                <div className={`rounded-2xl border border-white/5 bg-gradient-to-b ${item.color} p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:scale-[1.03]`}>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">{item.icon}</div>
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
              { icon: "🔄", title: "역방향 필터링", desc: "구역을 먼저 찾는 게 아니라, 내 예산이 먼저. 진입 가능한 구역만 자동 도출합니다.", highlight: true },
              { icon: "⚖️", title: "1:1 대조 분석", desc: "재개발 구역 vs 기축 아파트를 동일 예산 기준으로 비교. 기회비용을 명확히 파악하세요." },
              { icon: "✅", title: "Verified 매물", desc: "현지 파트너 중개사가 교차 검증한 매물만 노출. 허위매물로 인한 헛걸음이 없습니다." },
              { icon: "📐", title: "오차율 ±5% 이내", desc: "국토부 실거래가 기반의 정밀 역산 엔진. 시세 오차를 최소화했습니다." },
              { icon: "⏱️", title: "3초 이내 결과", desc: "주 15시간 걸리던 구역 탐색을 3초로. 시간 빈곤한 직장인에게 최적화." },
              { icon: "🛡️", title: "리스크 시각화", desc: "사업 단계, 분담금 변동, 전고점 회복률까지. 투자 리스크를 숫자로 보여드립니다." },
            ].map((card) => (
              <div key={card.title} className={`rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${card.highlight ? "border-blue-500/30 bg-blue-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"}`}>
                <div className="mb-3 text-2xl">{card.icon}</div>
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
                  <th className="px-5 py-4 font-semibold text-red-400">기존 방식 😩</th>
                  <th className="px-5 py-4 font-semibold text-blue-400">씨드핏 🚀</th>
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
      <section className="border-y border-white/5 bg-[#0D1225] py-20 px-5 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-3 inline-block text-sm font-semibold text-blue-400">RESULT PREVIEW</span>
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">이런 결과를 받아보실 수 있습니다</h2>
          <p className="mx-auto mb-14 max-w-lg text-gray-400">가용 현금 3억 입력 시 실제 분석 결과 예시</p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { zone: "수택 2구역", district: "구리시", stage: "조합설립인가", match: "95%", price: "5.6억", stageColor: "bg-purple-500/20 text-purple-300" },
              { zone: "전농 10구역", district: "동대문구", stage: "연번 부여", match: "82%", price: "6.3억", stageColor: "bg-blue-500/20 text-blue-300" },
              { zone: "장위 15구역", district: "성북구", stage: "시공사선정", match: "65%", price: "9.0억", stageColor: "bg-amber-500/20 text-amber-300" },
            ].map((r) => (
              <div key={r.zone} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECTION 7 — Mid CTA ══════════ */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold sm:text-4xl">지금 바로 확인해 보세요</h2>
          <p className="mb-8 text-gray-400">가입 없이, 무료로 시작할 수 있습니다.</p>
          <CTAButton>무료로 분석 시작하기</CTAButton>
        </div>
      </section>

      {/* ══════════ SECTION 8 — Partner Logos ══════════ */}
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

      {/* ══════════ SECTION 9 — Final CTA ══════════ */}
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
          <p>⚠️ 본 서비스의 데이터는 국토부 실거래가 기준이며 현장 호가와 다를 수 있습니다. 투자 판단의 책임은 이용자에게 있습니다.</p>
        </div>
      </footer>
    </div>
  );
}
