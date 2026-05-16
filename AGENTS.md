# Project Instructions

This is the cross-tool global rules file (AGENTS.md) supported by Google Antigravity (v1.20.3+), Cursor, and Claude Code.

## Code Style

- Maintain clean, readable, and well-documented code.
- Write comments in Korean for business logic; English for technical/framework-level comments.
- Follow Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.

---

## 🏗️ 001. Project Overview

**Product Name:** 씨드핏 (SeedFit) — 예산 맞춤 재개발 투자 분석 플랫폼

**Vision:** 투자금(예산) 맞춤 재개발 투자 플랫폼. 내 예산을 입력하면 진입 가능한 재개발 구역을 비교 분석해주고, 파트너 중개사의 Verified 매물을 연결합니다. 동일 예산으로 재개발 구역 vs 기축 아파트 비교 분석 기능을 제공합니다.

**Core Features (Phase 1 MVP):**

- ① Reverse Filter: 가용 현금 입력 → 취득세·대출 역산 → 진입 가능 구역 자동 산출
- ② 1:1 Comparison Dashboard: 기축 아파트 vs 재개발 구역 투자 구조·현금 흐름·미래 가치 심층 비교
- ③ B2B Verified Listings: 현지 중개사 보증 매물에 Verified 뱃지 부여, 교차검증 파이프라인
- ④ Single Search Landing: 복잡한 지도 탐색 대신 '가용 현금' 단일 입력창 중심 UX
- ⑤ Multi-Zone Scatter Chart: 사업단계(X축) vs 실투자금(Y축) Range 시각화, 덤벨 마커, Position Dodge

**Target Audience:**

- Primary (B2C): 스마트 비기너 — 재개발 예비 투자자 (30대, 본업이 바빠 정보 탐색에 어려움)
- Secondary (B2B): 공인중개사 — 디지털 브리핑 도구로 2030 세대 리드 전환

**Project Goals & Success Metrics:**

- North Star KPI: 가용 현금 쿼리 검색 완료율 ≥ 65% (Amplitude 퍼널)
- Verified 매물 CTR ≥ 40%
- 1:1 대조 대시보드 체류 시간 ≥ 3분
- 정보 탐색 시간 90% 단축 (주 15시간 → 1.5시간)
- 허위매물 오프라인 헛걸음 0%

**Key Documents:**

- PRD: `SeedFit_app/docs/00_PRD_v0.1.md`
- SRS: `SeedFit_app/docs/01_SRS-001_v1.2.md`
- Data Spec: `SeedFit_app/docs/DATA_CURATION_SPEC.v.2.md`
- Scatter Chart Spec: `SeedFit_app/docs/Phase2_scatter_chart검토.md`

---

## 🛠️ 002. Technical Stack

**Frontend & Backend Core (Next.js Full-stack):**

- Framework: Next.js 16.x (App Router, Turbopack, Server Actions)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui (Radix primitives)
- Data Fetching/Mutation: React Server Components (RSC) + Server Actions
- Database ORM: Prisma
- Database: Supabase (PostgreSQL) + RLS (Row Level Security)
- Package Manager: npm

**AI & Document Engine (Python):**

- Language: Python 3.10+
- Framework: FastAPI
- AI Orchestration: LangChain
- LLM Provider: Google Gemini (via Internal Gateway)

**Infrastructure:**

- Hosting/Deployment: Vercel (Edge Functions, Serverless)
- Batch Jobs: Vercel Cron
- Monitoring: Amplitude, Vercel Analytics, Datadog
- Version Control: Git

---

## 📋 003. Development Guidelines

**Architecture Principles:**

- Full-stack Monorepo: Next.js Server Actions를 통해 프론트엔드와 백엔드 로직 통합
- Server-side Reverse Calculation: 역산(취득세, 대출 산정) 로직은 반드시 Server Action 내부에서 처리 (ADR-01)
- Curated DB: 기축 아파트 비교군 데이터는 수동/반자동 큐레이션 방식 적용 (ADR-02)
- LTV Parameterization: LTV/DSR 정책은 하드코딩 금지, Admin 패널에서 전역 변수로 즉시 수정 가능

**Performance Standards (NFR):**

- Reverse Filter API: p95 ≤ 1.5s (VU 1,000 / TPS 500)
- Landing Render: ≤ 1.0s (LCP)
- Report Render: ≤ 0.5s
- Verified Badge Activation: ≤ 1.0s
- System Availability: ≥ 99.9% SLA

**Security:**

- Sensitive data (소유주 연락처, 동호수): AES-256 encryption at rest
- All transit: TLS 1.2+
- Access control: RBAC (B2C / B2B / Admin roles)
- WAF for bot/crawler blocking

**Data Integrity:**

- 실투자금 오차율: ±5% 이내 통제
- 면책 조항(Disclaimer): 모든 데이터 화면에 고정 노출
- External API fallback: 국토부 API 3초 초과 시 캐시 데이터 서빙 + UI Fallback 표시

**Code Quality:**

- Comments: WHY 중심 (WHAT은 코드로 표현)
- Unused/stale comments: 즉시 제거
- Naming: 서술적 변수/함수명 (한글 비즈니스 용어 허용)
- Testing: 핵심 비즈니스 로직(역산 엔진, LTV 계산)은 반드시 단위 테스트 작성

**Development Priorities:**

1. **Data Accuracy**: 역산 엔진 및 투자금 계산 로직의 정확성이 최우선
2. **Security**: B2B 민감 데이터 보호 및 RBAC 접근 제어
3. **UX Safety**: 데이터 손실 방지를 위한 Auto-save (<10s interval)

**Project Directory Structure:**

```
SeedFit-project-root/
├── AGENTS.md                    # ← Cross-tool global rules (이 파일)
├── CLAUDE.md                    # Claude Code context
├── .agents/                     # Antigravity rules, skills, workflows
│   ├── rules/                   # 001~008 프로젝트 규칙
│   ├── skills/                  # mattpocock/skills 기반 스킬
│   └── workflows/               # 워크플로우 매크로
├── .cursor/                     # Cursor-specific
│   ├── rules/                   # *.mdc 규칙 파일
│   └── agents/                  # 서브에이전트
├── .claude/agents/              # Claude Code subagents
├── .gemini/agents/              # Gemini CLI subagents
└── SeedFit_app/
    ├── docs/                    # PRD, SRS, Data Specs
    │   ├── 00_PRD_v0.1.md
    │   ├── 01_SRS-001_v1.2.md
    │   └── DATA_CURATION_SPEC.v.2.md
    └── frontend/                # Next.js 16.x Full-stack (App Router)
        ├── app/                 # App Router (Pages, Layouts, API Routes)
        │   └── actions/         # Server Actions (Reverse Filter, LTV Calc)
        ├── components/          # UI components (shadcn/ui)
        ├── lib/                 # Utilities, Shared logic
        └── prisma/              # Prisma schema & migrations
```
