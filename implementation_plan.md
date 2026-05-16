# SeedFit AI Harness 전면 재정립 구현 계획

PRD v0.3 및 SRS-001 v1.2에 기반하여 프로젝트의 AI 개발 체계(Harness)를 처음부터 재정립합니다.
기존 AGENTS.md/CLAUDE.md는 템플릿(SeedFit 프로젝트의 비전 아닌 "Submission Wizard" 등)으로 남아 있는 상태이므로 **전면 교체**합니다.

---

## User Review Required

> [!IMPORTANT]
> 현재 AGENTS.md와 CLAUDE.md는 **다른 프로젝트(창업 사업계획서 AI)의 템플릿**이 그대로 남아 있습니다. SeedFit 프로젝트에 맞게 전면 교체됩니다.

> [!WARNING]
> `.cursor/` 디렉토리는 현재 프로젝트 루트에 존재하지 않습니다. 새로 생성합니다. Cursor를 사용하시지 않는다면 `.cursor/` 생성을 건너뛸 수 있습니다.

---

## Open Questions

> [!IMPORTANT]
> 1. **Cursor 사용 여부**: `.cursor/rules/` 디렉토리를 생성할까요? Cursor를 사용하지 않으시면 생략합니다.
> 2. **Gemini CLI 사용 여부**: `.gemini/agents/`에 서브에이전트를 생성할까요?
> 3. **Claude Code 사용 여부**: `.claude/agents/`에 서브에이전트를 생성할까요?
> 4. **AGENTS.md 위치**: 현재 프로젝트 루트(`SeedFit-project-root/`)에 배치 예정입니다. `SeedFit_app/` 하위가 더 적합한지 확인 부탁드립니다.

---

## 현황 분석 (As-Is)

| 파일 | 상태 | 문제점 |
|:---|:---|:---|
| `AGENTS.md` | ❌ 템플릿 그대로 | Vision, Features, Tech Stack 모두 다른 프로젝트("Submission Wizard") 내용 |
| `CLAUDE.md` | ❌ 템플릿 그대로 | Kafka, Flutter 등 SeedFit과 무관한 기술스택 나열. 서브에이전트도 무관함 |
| `.agents/rules/` | ❌ 미존재 | 공통 규칙 부재 |
| `.cursor/rules/` | ❌ 미존재 | Cursor 규칙 부재 |
| `.claude/agents/` | ❌ 미존재 | Claude 서브에이전트 부재 |
| `.gemini/agents/` | ❌ 미존재 | Gemini 서브에이전트 부재 |

---

## Proposed Changes

### 1. 범용 글로벌 규칙 (Cross-Tool)

---

#### [MODIFY] [AGENTS.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/AGENTS.md)

**SeedFit 프로젝트에 맞게 전면 재작성:**

- **§001 Project Overview**: 
  - Vision → "투자금 맞춤 재개발 투자 분석 플랫폼"
  - Core Features → ① 역방향 필터 ② 1:1 대조 ③ Verified 매물 ④ 단일검색 ⑤ 스캐터 차트
  - Target Audience → 스마트 비기너(B2C) + 공인중개사(B2B)
  - Success Metrics → 북극성 KPI(검색 완료율 65%), Verified CTR 40%

- **§002 Technical Stack**:
  - Frontend: Next.js 16.x + TypeScript + Tailwind CSS + shadcn/ui + Recharts
  - Backend: Spring Boot 4.0 + Java 21 + MySQL 8.x + Spring Data JPA
  - AI Engine: Python 3.10+ + FastAPI + LangChain + Gemini
  - Infra: Docker, Swagger/OpenAPI 3.0, Git

- **§003 Development Guidelines**:
  - Architecture: Micro-Service Ready (Core API ↔ AI Engine via REST)
  - Performance: 역산 API p95 ≤ 1.5s, 랜딩 렌더링 ≤ 1s, 리포트 렌더링 ≤ 0.5s
  - Priorities: ① 데이터 정확성(±5%) ② 보안(AES-256, RBAC) ③ UX(Auto-save <10s)
  - Code Style: WHY 중심 주석, Conventional Commits, Feature Branch 워크플로우

---

#### [NEW] [.agents/rules/001-project-overview.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.agents/rules/001-project-overview.md)

SeedFit 프로젝트 개요 규칙. `alwaysApply: true`로 모든 대화에 자동 주입.
PRD §0~§2의 핵심 내용을 압축.

---

#### [NEW] [.agents/rules/002-tech-stack.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.agents/rules/002-tech-stack.md)

기술 스택 정의. `alwaysApply: true`.
SRS §1.2.3 Constraints 반영.

---

#### [NEW] [.agents/rules/003-development-guidelines.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.agents/rules/003-development-guidelines.md)

개발 가이드라인 및 아키텍처 원칙. `alwaysApply: true`.
SRS §4.2 NFR + PRD §5 기반.

---

### 2. Claude Code 전용

---

#### [MODIFY] [CLAUDE.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/CLAUDE.md)

SeedFit 프로젝트 전용으로 전면 재작성:
- §1 Project: SeedFit 비전/핵심기능/타겟
- §2 Tech Stack: Next.js + Spring Boot + FastAPI
- §3 Dev Guidelines: 코드 스타일, 문제해결 프로토콜
- §4 Subagent & Command Routing: SeedFit 전용 서브에이전트 테이블

---

#### [NEW] [.claude/agents/react-frontend.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.claude/agents/react-frontend.md)

Next.js + TypeScript + shadcn/ui + Recharts 전문 서브에이전트.
SeedFit 프론트엔드의 스캐터 차트, 대시보드, 검색 UI 작업 담당.

---

#### [NEW] [.claude/agents/java-spring.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.claude/agents/java-spring.md)

Spring Boot 4.0 + JPA + MySQL 백엔드 서브에이전트.
역산 엔진 API, LTV 계산기, Verified 검증 로직 담당.

---

#### [NEW] [.claude/agents/data-curation.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.claude/agents/data-curation.md)

CSV/MD 데이터 큐레이션 + 프론트엔드 동기화 전문 서브에이전트.
golden_samples CSV → scatterData.ts/mockData.ts 파이프라인 담당.

---

### 3. Gemini / Antigravity 전용

---

#### [NEW] [.gemini/agents/code-reviewer.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.gemini/agents/code-reviewer.md)

코드 리뷰 전문 서브에이전트. `read_file`, `grep_search` 도구만 허용하여 안전한 읽기 전용 감사.

---

#### [NEW] [.gemini/agents/data-pipeline.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.gemini/agents/data-pipeline.md)

데이터 파이프라인 전문가. CSV 파싱, DB 스키마 설계, 배치 수집 로직 담당.

---

### 4. Cursor 전용

---

#### [NEW] [.cursor/rules/001-project-overview.mdc](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.cursor/rules/001-project-overview.mdc)

SeedFit 프로젝트 개요. `alwaysApply: true`.

---

#### [NEW] [.cursor/rules/002-tech-stack.mdc](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.cursor/rules/002-tech-stack.mdc)

기술 스택 정의. `alwaysApply: true`.

---

#### [NEW] [.cursor/rules/003-development-guidelines.mdc](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.cursor/rules/003-development-guidelines.mdc)

개발 가이드라인. `alwaysApply: true`.

---

#### [NEW] [.cursor/rules/100-react-nextjs.mdc](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.cursor/rules/100-react-nextjs.mdc)

Next.js + React + TypeScript 코딩 규칙. `globs: "*.tsx, *.ts, *.jsx"`.

---

#### [NEW] [.cursor/rules/200-spring-boot.mdc](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.cursor/rules/200-spring-boot.mdc)

Spring Boot + JPA 코딩 규칙. `globs: "*.java"`.

---

### 5. 공통 워크플로우 & 스킬

---

#### [NEW] [.agents/workflows/update-zone-data.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.agents/workflows/update-zone-data.md)

재개발 구역 데이터 업데이트 워크플로우:
1. CSV 데이터 검증
2. 비교 기축 아파트 공란 채우기
3. DATA_CURATION_SPEC.v.2.md 업데이트
4. scatterData.ts / mockData.ts 동기화
5. 프론트엔드 빌드 검증

---

#### [NEW] [.agents/skills/fix-error/SKILL.md](file:///c:/Users/82104/.gemini/antigravity/playground/SeedFit-project-root/.agents/skills/fix-error/SKILL.md)

에러 진단 7단계 절차 스킬.

---

## 생성될 파일 요약

| # | 파일 경로 | 유형 | 대상 도구 |
|:---:|:---|:---:|:---:|
| 1 | `AGENTS.md` | 수정 | Cross-Tool |
| 2 | `CLAUDE.md` | 수정 | Claude Code |
| 3 | `.agents/rules/001-project-overview.md` | 신규 | Antigravity |
| 4 | `.agents/rules/002-tech-stack.md` | 신규 | Antigravity |
| 5 | `.agents/rules/003-development-guidelines.md` | 신규 | Antigravity |
| 6 | `.agents/workflows/update-zone-data.md` | 신규 | Antigravity |
| 7 | `.agents/skills/fix-error/SKILL.md` | 신규 | Cross-Tool |
| 8 | `.claude/agents/react-frontend.md` | 신규 | Claude Code |
| 9 | `.claude/agents/java-spring.md` | 신규 | Claude Code |
| 10 | `.claude/agents/data-curation.md` | 신규 | Claude Code |
| 11 | `.gemini/agents/code-reviewer.md` | 신규 | Gemini CLI |
| 12 | `.gemini/agents/data-pipeline.md` | 신규 | Gemini CLI |
| 13 | `.cursor/rules/001-project-overview.mdc` | 신규 | Cursor |
| 14 | `.cursor/rules/002-tech-stack.mdc` | 신규 | Cursor |
| 15 | `.cursor/rules/003-development-guidelines.mdc` | 신규 | Cursor |
| 16 | `.cursor/rules/100-react-nextjs.mdc` | 신규 | Cursor |
| 17 | `.cursor/rules/200-spring-boot.mdc` | 신규 | Cursor |

---

## Verification Plan

### Automated Tests
- AGENTS.md가 SeedFit의 핵심 키워드(역방향 필터, Verified, 스캐터 차트 등)를 포함하는지 grep 검증
- 모든 `.mdc` 파일의 YAML 프론트매터가 유효한지 구조 검증
- `.claude/agents/` 내 서브에이전트의 `tools`, `model` 필드 존재 확인

### Manual Verification
- Antigravity 에디터에서 Rules 패널에 새 규칙이 정상 로드되는지 확인
- Cursor에서 `.mdc` 파일이 `Customizations > Rules`에 나타나는지 확인
