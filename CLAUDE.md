# SeedFit — Claude Code Context

이 파일은 Claude Code가 매 세션 시작 시 자동 로드하는 최소 컨텍스트입니다.
상세 규칙은 `AGENTS.md`와 `.agents/rules/`를 참조합니다.

---

## Project
**씨드핏 (SeedFit)** — 예산 맞춤 재개발 투자 분석 플랫폼.
가용 현금 입력 → 역산 → 진입 가능 구역 산출 → Verified 매물 연결 → 기축 아파트 1:1 비교.

## Tech Stack (핵심)
- **Framework:** Next.js 16.x (App Router, Server Actions)
- **Language/Styling:** TypeScript, Tailwind CSS, shadcn/ui
- **Database/ORM:** Supabase (PostgreSQL), Prisma
- **AI Engine:** Python 3.10+ + FastAPI + LangChain + Gemini
- **Infra:** Vercel (Edge, Cron)

## Development Rules
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Comments: 비즈니스 로직은 한국어, 기술/프레임워크는 영어
- 핵심 비즈니스 로직(역산 엔진, LTV 계산기)은 Server Action으로 캡슐화
- LTV/DSR 정책값 하드코딩 절대 금지 (DB Parameterization)
- 민감 데이터 보안: Supabase RLS (Row Level Security) 적용

## Key Documents
- PRD: `SeedFit_app/docs/00_PRD_v0.1.md`
- SRS: `SeedFit_app/docs/01_SRS-001_v1.2.md`
- Data Spec: `SeedFit_app/docs/DATA_CURATION_SPEC.v.2.md`
- Task List: `09_TASK_목록_명세서.md`

## Subagent Routing
| Agent | 사용 시점 |
|---|---|
| `nextjs-fullstack` | Next.js Server Actions, API Routes, Prisma 스키마, UI 컴포넌트 등 전체 개발 |
| `data-curation` | CSV 데이터 처리, 큐레이션 스크립트, DATA_CURATION_SPEC 업데이트 |

수동 호출: `> use the <agent-name> subagent`
