# SeedFit AI Harness 재정립 — 완료 Walkthrough

## 수행 요약

PRD v0.3 / SRS-001 v1.2 문서를 기반으로 **SeedFit 프로젝트의 AI 개발 체계(Harness)를 처음부터 재정립**했습니다. 기존 템플릿("Submission Wizard")을 모두 제거하고 SeedFit 전용 콘텐츠로 교체했습니다.

---

## 변경 파일 트리 (17개)

```
SeedFit-project-root/
├── AGENTS.md                    ← [수정] Cross-tool 글로벌 규칙
├── CLAUDE.md                    ← [수정] Claude Code 전용 컨텍스트
├── .agents/
│   ├── rules/
│   │   ├── 001-project-overview.md    ← [신규] 프로젝트 개요
│   │   ├── 002-tech-stack.md          ← [신규] 기술 스택
│   │   └── 003-development-guidelines.md ← [신규] 개발 가이드라인
│   ├── workflows/
│   │   └── update-zone-data.md        ← [신규] 데이터 업데이트 절차
│   └── skills/
│       └── fix-error/
│           └── SKILL.md               ← [신규] 에러 진단 7단계
├── .claude/
│   └── agents/
│       ├── react-frontend.md          ← [신규] Next.js 프론트엔드
│       ├── java-spring.md             ← [신규] Spring Boot 백엔드
│       └── data-curation.md           ← [신규] 데이터 큐레이션
├── .gemini/
│   └── agents/
│       ├── code-reviewer.md           ← [신규] 코드 리뷰 (읽기전용)
│       └── data-pipeline.md           ← [신규] 데이터 파이프라인
└── .cursor/
    └── rules/
        ├── 001-project-overview.mdc   ← [신규]
        ├── 002-tech-stack.mdc         ← [신규]
        ├── 003-development-guidelines.mdc ← [신규]
        ├── 100-react-nextjs.mdc       ← [신규] React 코딩 규칙
        └── 200-spring-boot.mdc        ← [신규] Spring 코딩 규칙
```

---

## 핵심 설계 결정

### 1. 지식의 중앙화 + 제어의 분산화

| 계층 | 내용(Content) | 행동(Behavior) |
|:---|:---|:---|
| **공통** | `AGENTS.md` — 모든 도구가 읽는 글로벌 규칙 | `.agents/rules/` — Antigravity 자동 규칙 |
| **Cursor** | — | `.cursor/rules/*.mdc` — globs 기반 자동 적용 |
| **Claude** | `CLAUDE.md` — 매 세션 자동 로드 | `.claude/agents/` — 서브에이전트 위임 |
| **Gemini** | — | `.gemini/agents/` — Hub-and-Spoke 모델 |

### 2. 서브에이전트 설계 원칙

| 에이전트 | 도구 | 역할 | 도구 제한 |
|:---|:---|:---|:---|
| `code-reviewer` | Gemini CLI | 안전한 코드 감사 | `read_file`, `grep_search` (읽기 전용) |
| `data-pipeline` | Gemini CLI | CSV→TS 데이터 변환 | 읽기+쓰기+실행 |
| `react-frontend` | Claude Code | Next.js UI 개발 | Full tools |
| `java-spring` | Claude Code | Spring Boot API 개발 | Full tools |
| `data-curation` | Claude Code | 데이터 큐레이션 | Full tools |

### 3. PRD/SRS → Harness 매핑

| PRD/SRS 요구사항 | Harness 반영 위치 |
|:---|:---|
| 역산 API p95 ≤ 1.5s | `AGENTS.md` §003, `.agents/rules/003` |
| 실투자금 오차 ±5% | `AGENTS.md` §003, `.cursor/rules/200` |
| AES-256 + RBAC | `AGENTS.md` §003, `.claude/agents/java-spring.md` |
| LTV 파라미터화 (하드코딩 금지) | `AGENTS.md` §003, `.cursor/rules/200` |
| Curated DB (수동 큐레이션) | `AGENTS.md` §003, `.claude/agents/data-curation.md` |
| 덤벨 마커 + Position Dodge | `.cursor/rules/100`, `.claude/agents/react-frontend.md` |

---

## 검증 결과

- ✅ 13개 핵심 키워드 AGENTS.md 내 존재 확인 (SeedFit, Reverse Filter, Verified, LTV, AES-256 등)
- ✅ 17개 파일 전량 생성 완료
- ✅ YAML 프론트매터 구조 정상 (`.mdc` 파일 `globs`/`alwaysApply`, `.gemini/agents` `tools`/`model` 필드)

---

## 사용법

### Antigravity (메인)
- Rules는 자동 적용됨 (`alwaysApply: true`)
- Customizations → Rules 패널에서 확인 가능
- 워크플로우: 채팅창에서 `/update-zone-data` 실행

### Gemini CLI (추가 사용 예정)
```bash
# 코드 리뷰 서브에이전트 사용
gemini ask "프론트엔드 코드를 리뷰해줘" --context .gemini/agents/code-reviewer.md

# 데이터 파이프라인 작업
gemini ask "CSV를 프론트엔드 데이터로 변환해줘" --context .gemini/agents/data-pipeline.md
```

### Cursor (사용 가능성)
- `.cursor/rules/` 자동 로드. `001~003` 은 항상 적용, `100`/`200`은 해당 파일 편집 시 적용.

### Claude Code (사용 가능성)
- `CLAUDE.md` 자동 로드. 서브에이전트는 `> use the react-frontend subagent` 형태로 호출.
