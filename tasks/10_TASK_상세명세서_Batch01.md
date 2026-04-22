# TASK 상세 명세서 — Batch 01 (INIT-001 ~ INIT-004, DB-001)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 1 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**작성 현황**: INIT-001, INIT-002, INIT-003, INIT-004, DB-001 (5/89)

---

## Issue #1: INIT-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Setup] INIT-001: Next.js App Router 프로젝트 초기화 (Tailwind CSS + shadcn/ui + Prisma)"
labels: 'setup, infra, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [INIT-001] Next.js App Router 프로젝트 초기화
- **목적**: 전체 시스템의 기술 스택 기반(C-TEC-001~004)을 확립한다. Next.js App Router 풀스택 프레임워크 위에 Tailwind CSS, shadcn/ui, Prisma ORM을 세팅하여 모든 후속 태스크가 이 기반 위에서 개발될 수 있도록 단일 진실 공급원(SSOT) 프로젝트 구조를 생성한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`07_SRS_v1.0.md#1.2.3 C-TEC-001~004`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 기술 제약 전체: C-TEC-001(Next.js App Router), C-TEC-003(Prisma+SQLite/Supabase), C-TEC-004(Tailwind+shadcn/ui)
- 인프라 비용 설계: [`07_SRS_v1.0.md#6.10`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` 실행
- [ ] `npx shadcn@latest init` 실행 → `components.json` 생성 확인
- [ ] `npm install prisma @prisma/client` → `npx prisma init --datasource-provider sqlite` 실행
- [ ] `prisma/schema.prisma` 에 `provider = "sqlite"` (로컬) / 배포 시 `postgresql` 전환 가능하도록 주석 명시
- [ ] `.gitignore`에 `.env`, `prisma/*.db` 추가
- [ ] `package.json`에 `prisma:generate`, `prisma:migrate`, `prisma:seed` 스크립트 추가
- [ ] `tsconfig.json` path alias `@/*` → `./src/*` 확인
- [ ] 프로젝트 루트에 `README.md` 작성 (기술 스택 요약, 로컬 실행 가이드)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 로컬 개발 서버 기동 확인**
- **Given**: 프로젝트 초기화가 완료된 상태
- **When**: `npm run dev` 명령을 실행함
- **Then**: `localhost:3000`에서 Next.js 기본 페이지가 에러 없이 렌더링된다.

**Scenario 2: Prisma 초기화 확인**
- **Given**: Prisma가 설치된 상태
- **When**: `npx prisma generate` 명령을 실행함
- **Then**: `node_modules/.prisma/client`가 생성되고, TypeScript 타입이 정상적으로 추론된다.

**Scenario 3: shadcn/ui 컴포넌트 추가 확인**
- **Given**: shadcn/ui가 초기화된 상태
- **When**: `npx shadcn@latest add button` 명령을 실행함
- **Then**: `src/components/ui/button.tsx`가 생성되고, 컴파일 에러 없이 import 가능하다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-001**: Next.js App Router만 사용 (Pages Router 금지)
- **C-TEC-003**: 로컬은 SQLite, 배포는 Supabase PostgreSQL. PostGIS 확장 미사용
- **C-TEC-004**: Tailwind CSS v3+ / shadcn/ui 최신 안정 버전
- **비용**: 모든 패키지는 MIT/Apache2 무료 라이선스만 사용

### :checkered_flag: Definition of Done (DoD)
- [ ] `npm run dev`로 로컬 서버가 에러 없이 기동되는가?
- [ ] Prisma Client가 정상 생성되는가?
- [ ] shadcn/ui Button 컴포넌트를 import하여 렌더링할 수 있는가?
- [ ] Tailwind CSS 유틸리티 클래스가 페이지에서 정상 적용되는가?
- [ ] `.env.example` 파일이 존재하며 필요 변수가 주석과 함께 명시되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: None (최초 태스크)
- **Blocks**: INIT-002, INIT-003, INIT-004, DB-001~009, LIB-001~005, API-SPEC-001~008 (모든 후속 태스크)

---

## Issue #2: INIT-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Setup] INIT-002: Route Group 디렉토리 구조 생성 — /(b2c), /(b2b), /(admin)"
labels: 'setup, frontend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [INIT-002] Route Group 디렉토리 구조 및 레이아웃 파일 생성
- **목적**: Next.js App Router의 Route Group 기능을 활용하여 B2C(비로그인 개방), B2B(패스코드 인증), Admin(패스코드 인증)의 3개 독립적인 라우트 그룹을 생성한다. 각 그룹은 고유한 레이아웃을 가지며, 향후 모든 페이지가 이 구조 안에서 개발된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`07_SRS_v1.0.md#3.2 Client Applications`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 시스템 모드: [`07_SRS_v1.0.md#6.5 System Modes`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- Route Groups: CLI-01 `/(b2c)/*`, CLI-02 `/(b2b)/*`, CLI-03 `/(admin)/*`

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/layout.tsx` 생성: B2C 공용 레이아웃 (비로그인, 면책 조항 Footer 포함)
- [ ] `src/app/(b2c)/page.tsx` 생성: 랜딩 페이지 placeholder
- [ ] `src/app/(b2b)/layout.tsx` 생성: B2B 공용 레이아웃 (PasscodeGuard wrapper 예약)
- [ ] `src/app/(b2b)/page.tsx` 생성: B2B 대시보드 placeholder
- [ ] `src/app/(admin)/layout.tsx` 생성: Admin 공용 레이아웃 (PasscodeGuard wrapper 예약)
- [ ] `src/app/(admin)/page.tsx` 생성: Admin 대시보드 placeholder
- [ ] `src/app/layout.tsx` (루트 레이아웃) 수정: Google Fonts (Inter), 메타데이터, 공통 HTML 구조
- [ ] 각 Route Group에 `loading.tsx` 스켈레톤 UI 생성

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: B2C 라우트 접근**
- **Given**: 프로젝트가 빌드된 상태
- **When**: 브라우저에서 `localhost:3000/` (루트)에 접속함
- **Then**: B2C 레이아웃이 렌더링되고 면책 조항이 Footer에 표시된다.

**Scenario 2: B2B 라우트 격리 확인**
- **Given**: B2B Route Group이 생성된 상태
- **When**: `localhost:3000/listing/new`에 접속함 (향후 B2B 경로)
- **Then**: B2B 레이아웃이 렌더링되고, B2C 레이아웃과 독립적이다.

**Scenario 3: Admin 라우트 격리 확인**
- **Given**: Admin Route Group이 생성된 상태
- **When**: `localhost:3000/ltv-policy`에 접속함 (향후 Admin 경로)
- **Then**: Admin 레이아웃이 렌더링되고, B2C/B2B 레이아웃과 독립적이다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-001**: Next.js App Router Route Group `(groupName)` 괄호 구문 사용
- **구조 규칙**: Route Group 폴더명에 괄호를 사용하여 URL 경로에 그룹명이 노출되지 않도록 함
- **CON-05**: B2C 레이아웃의 Footer에 면책 조항 텍스트 고정 노출 (REQ-FUNC-020)

### :checkered_flag: Definition of Done (DoD)
- [ ] 3개 Route Group (`/(b2c)`, `/(b2b)`, `/(admin)`)이 각각 독립된 `layout.tsx`를 보유하는가?
- [ ] 각 Route Group의 placeholder 페이지가 렌더링되는가?
- [ ] B2C 레이아웃 Footer에 면책 조항 텍스트가 노출되는가?
- [ ] `loading.tsx` 스켈레톤이 각 그룹에 존재하는가?
- [ ] 빌드(`npm run build`) 시 에러가 없는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (프로젝트 초기화)
- **Blocks**: FE-F-001~005 (랜딩 UI), FE-G-001~005 (대시보드 UI), FE-H-001~005 (B2B UI), FE-I-001~004 (Admin UI)

---

## Issue #3: INIT-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Setup] INIT-003: 환경 변수(.env) 스키마 정의"
labels: 'setup, config, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [INIT-003] 환경 변수(.env) 스키마 정의
- **목적**: 시스템 전체에서 사용되는 외부 연결 정보, 시크릿 패스코드, API 키를 `.env` 파일에 체계적으로 정의하고, `.env.example`을 통해 개발자와 AI 에이전트가 어떤 변수가 필요한지 즉시 파악할 수 있도록 한다. 배포(Vercel) 시 환경 변수 설정의 기준 문서 역할을 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`07_SRS_v1.0.md#1.2.3 C-TEC-009`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (시크릿 패스코드)
- 외부 시스템: [`07_SRS_v1.0.md#3.1 External Systems`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 시스템 모드: [`07_SRS_v1.0.md#6.5 System Modes`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (SECRET_B2B, SECRET_ADMIN)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `.env.example` 파일 생성 (아래 변수 스키마 포함, 실제 값은 placeholder)
- [ ] `.env.local` 파일 생성 (개발용 실제 값 채움, `.gitignore`에 등록 확인)
- [ ] 환경 변수 유효성 검증 유틸 `src/lib/env.ts` 작성: Zod를 사용하여 런타임에 필수 변수 누락 시 즉시 에러 throw

**정의할 환경 변수 목록:**

| 변수명 | 용도 | SRS 근거 | 필수 여부 |
|---|---|---|---|
| `DATABASE_URL` | Prisma DB 연결 문자열 (SQLite/PostgreSQL) | C-TEC-003 | 필수 |
| `DIRECT_URL` | Supabase Direct Connection (Prisma migrate용) | C-TEC-003 | 배포 시 필수 |
| `SECRET_B2B` | B2B 중개사 접근 패스코드 | C-TEC-009, §6.5 MODE-02 | 필수 |
| `SECRET_ADMIN` | Admin 관리자 접근 패스코드 | C-TEC-009, §6.5 MODE-04 | 필수 |
| `MOLIT_API_KEY` | 국토부 실거래가 API 인증키 | §3.1 EXT-01 | 필수 |
| `SLACK_WEBHOOK_URL` | Slack #dev-alert 채널 Webhook URL | §3.1 EXT-05 | 선택 |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY` | Amplitude SDK 초기화 키 | §3.1 EXT-03 | 선택 |

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 필수 환경 변수 누락 시 에러**
- **Given**: `.env.local`에서 `DATABASE_URL`을 삭제한 상태
- **When**: `npm run dev`를 실행함
- **Then**: `src/lib/env.ts`의 Zod 검증이 동작하여 "DATABASE_URL is required" 에러를 즉시 throw 한다.

**Scenario 2: 정상 환경 변수 설정**
- **Given**: `.env.local`에 모든 필수 변수가 설정된 상태
- **When**: `npm run dev`를 실행함
- **Then**: env 검증을 통과하고 서버가 정상 기동된다.

**Scenario 3: .env.example 검증**
- **Given**: `.env.example` 파일이 존재하는 상태
- **When**: 파일 내용을 확인함
- **Then**: 7개 변수명이 모두 명시되어 있고, 각 변수에 대한 주석 설명이 포함되어 있다.

### :gear: Technical & Non-Functional Constraints
- **보안**: `.env.local` 파일은 절대 Git에 커밋되어서는 안 됨
- **C-TEC-009**: SECRET_B2B, SECRET_ADMIN은 `process.env`에서만 접근 (클라이언트 노출 금지)
- **네이밍**: `NEXT_PUBLIC_` 접두사는 클라이언트 노출이 허용되는 변수에만 사용

### :checkered_flag: Definition of Done (DoD)
- [ ] `.env.example`에 7개 변수가 주석과 함께 명시되어 있는가?
- [ ] `src/lib/env.ts`가 Zod 기반 런타임 검증을 수행하는가?
- [ ] 필수 변수 누락 시 명확한 에러 메시지와 함께 프로세스가 종료되는가?
- [ ] `.gitignore`에 `.env.local`, `.env` 패턴이 등록되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (프로젝트 초기화)
- **Blocks**: LIB-003 (PasscodeGuard - SECRET_B2B/ADMIN 사용), LIB-005 (Slack Webhook - SLACK_WEBHOOK_URL 사용), BE-J-001 (배치 Cron - MOLIT_API_KEY 사용)

---

## Issue #4: INIT-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Setup] INIT-004: Vercel 프로젝트 생성 및 Git Push 자동 배포 파이프라인 연결"
labels: 'setup, infra, devops, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [INIT-004] Vercel 프로젝트 생성 및 CI/CD 파이프라인 연결
- **목적**: C-TEC-007(Vercel 플랫폼 단일화)에 따라 Git 저장소와 Vercel 프로젝트를 연결하여, `git push`만으로 Production/Preview 배포가 자동 실행되는 CI/CD 파이프라인을 확립한다. 별도의 CI/CD 스크립트 작성 없이 Vercel 내장 빌드 파이프라인에 의존한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`07_SRS_v1.0.md#1.2.3 C-TEC-007`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (Vercel 플랫폼 단일화)
- 인프라 비용: [`07_SRS_v1.0.md#6.10.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (Vercel Hobby ₩0)
- 배포 방식: [`07_SRS_v1.0.md#6.7.2 Rollout`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] GitHub 저장소 생성 (Private, `redev-navigator`)
- [ ] Vercel 대시보드에서 프로젝트 생성 → GitHub 저장소 연결
- [ ] Vercel 프로젝트 설정: Framework Preset = `Next.js`, Root Directory = `./`
- [ ] Vercel 환경 변수 설정: `DATABASE_URL`, `DIRECT_URL`, `SECRET_B2B`, `SECRET_ADMIN`, `MOLIT_API_KEY` (Production/Preview 분리)
- [ ] `main` 브랜치 Push → Production 배포 자동 트리거 확인
- [ ] Feature 브랜치 PR → Preview 배포 자동 생성 확인
- [ ] Vercel Analytics 자동 활성화 확인
- [ ] 배포된 URL에서 기본 페이지 정상 렌더링 확인

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Production 자동 배포**
- **Given**: Vercel과 GitHub가 연결된 상태
- **When**: `main` 브랜치에 코드를 push함
- **Then**: Vercel에서 자동 빌드가 트리거되고, 성공 시 Production URL(`*.vercel.app`)에서 페이지가 렌더링된다.

**Scenario 2: Preview 배포**
- **Given**: Feature 브랜치에서 PR을 생성한 상태
- **When**: PR이 GitHub에 올라가면
- **Then**: Vercel이 자동으로 Preview 배포를 생성하고, 고유 Preview URL이 PR 코멘트에 표시된다.

**Scenario 3: 환경 변수 적용 확인**
- **Given**: Vercel 대시보드에 `SECRET_B2B`가 설정된 상태
- **When**: 배포된 앱에서 `process.env.SECRET_B2B`에 접근하는 Server Action을 실행함
- **Then**: 환경 변수 값이 정상적으로 읽힌다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-007**: 배포는 오직 Vercel 플랫폼으로만. Docker, AWS, GCP 등 별도 인프라 사용 금지
- **비용**: Vercel Hobby 플랜(무료) 사용. 월간 Serverless Function 제한 확인 필요 (Hobby: 100GB-Hours)
- **REQ-NF-028**: 배포, 호스팅, Cron, Analytics를 Vercel 플랫폼으로 단일 관리

### :checkered_flag: Definition of Done (DoD)
- [ ] `git push origin main` 시 Vercel Production 배포가 자동 실행되는가?
- [ ] PR 생성 시 Preview 배포가 자동 생성되는가?
- [ ] Production 배포 URL에서 Next.js 페이지가 정상 렌더링되는가?
- [ ] Vercel 대시보드에서 환경 변수가 Production/Preview로 분리 설정되어 있는가?
- [ ] Vercel Analytics가 활성화되어 Web Vitals 수집이 시작되는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (프로젝트 초기화 — push할 코드가 존재해야 함)
- **Blocks**: NFR-004 (Vercel Firewall 설정), NFR-005 (Cloudflare 설정), NFR-006 (HTTPS 확인), NFR-010 (Vercel Analytics), NFR-012 (비용 모니터링), BE-J-002 (Cron 스케줄 설정)

---

## Issue #5: DB-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-001: Prisma Schema — User 테이블 정의 및 마이그레이션"
labels: 'database, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-001] User 테이블 Prisma Schema 작성
- **목적**: 시스템의 모든 사용자(B2C, B2B 중개사, Admin)를 식별하는 기반 테이블을 생성한다. 이 테이블은 Listing(매물)의 `agent_id`, LTV_Policy의 `updated_by`, Lead_Alert_Subscription의 `user_id`, Curated_Actual_Price_DB의 `last_updated_by`, B2B_Partner의 `user_id` 등 6개 이상의 외래 키 참조 대상이 되는 핵심 엔터티이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.1 User`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD: [`07_SRS_v1.0.md#6.2.9 ERD`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 인증 단순화: C-TEC-009 (패스코드 기반, Supabase Auth 미사용)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `User` 모델 정의:
  ```prisma
  model User {
    user_id           String   @id @default(uuid())
    role              Role     @default(B2C)
    available_cash    BigInt?
    interested_regions String[] @default([])
    loan_preference   Boolean  @default(false)
    created_at        DateTime @default(now())
    updated_at        DateTime @updatedAt
    
    // Relations (후속 DB 태스크에서 추가)
    listings          Listing[]
    partner           B2B_Partner?
    subscriptions     Lead_Alert_Subscription[]
  }
  
  enum Role {
    B2C
    B2B
    ADMIN
  }
  ```
- [ ] `npx prisma migrate dev --name init-user` 실행하여 로컬 SQLite DB에 테이블 생성
- [ ] `npx prisma generate` 실행하여 Prisma Client 업데이트
- [ ] Prisma Studio(`npx prisma studio`)로 테이블 구조 시각적 확인
- [ ] `src/lib/prisma.ts` 싱글턴 Prisma Client 인스턴스 유틸 생성 (dev 환경 Hot Reload 대응)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 마이그레이션 성공**
- **Given**: `User` 모델이 `schema.prisma`에 정의된 상태
- **When**: `npx prisma migrate dev --name init-user`를 실행함
- **Then**: `prisma/migrations/` 디렉토리에 마이그레이션 SQL 파일이 생성되고, 로컬 SQLite DB에 `User` 테이블이 생성된다.

**Scenario 2: Prisma Client 타입 추론**
- **Given**: `npx prisma generate`가 실행된 상태
- **When**: TypeScript 파일에서 `prisma.user.create({ data: { role: 'B2C' } })`를 작성함
- **Then**: `role` 필드에 `'B2C' | 'B2B' | 'ADMIN'` ENUM 타입이 자동 완성되고, 컴파일 에러가 없다.

**Scenario 3: 필수 필드 검증**
- **Given**: User 테이블이 존재하는 상태
- **When**: `role` 없이 User 레코드 생성을 시도함
- **Then**: `role`에는 `@default(B2C)`가 적용되어 기본값으로 생성된다.

**Scenario 4: Prisma Client 싱글턴**
- **Given**: `src/lib/prisma.ts`가 존재하는 상태
- **When**: 두 개의 Server Action에서 동시에 `prisma`를 import하여 사용함
- **Then**: 동일한 Prisma Client 인스턴스가 재사용되고, 커넥션 풀 초과 에러가 발생하지 않는다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-003**: Prisma + SQLite (로컬) / Supabase PostgreSQL (배포). PostGIS 확장 사용 금지
- **타입 안전성**: ENUM 타입은 Prisma `enum` 키워드로 정의하여 런타임·컴파일타임 모두에서 유효성 보장
- **관계 정의**: User는 다른 테이블의 FK 참조 대상이 되므로, 후속 DB 태스크(DB-003, DB-006~008)에서 Relations를 점진적으로 추가한다. 이 태스크에서는 Listing, B2B_Partner, Lead_Alert_Subscription 관계를 **주석으로만 예약**하고, 실제 모델이 생성된 후 연결한다.
- **싱글턴**: Next.js dev 모드에서 Hot Reload 시 Prisma Client가 다수 생성되는 문제를 `globalThis` 패턴으로 방어

### :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/schema.prisma`에 User 모델이 SRS §6.2.1 명세와 완전히 일치하는가?
- [ ] `Role` ENUM이 정의되고 `B2C`, `B2B`, `ADMIN` 3개 값을 가지는가?
- [ ] `npx prisma migrate dev`가 에러 없이 실행되는가?
- [ ] `src/lib/prisma.ts` 싱글턴 인스턴스 유틸이 생성되어 있는가?
- [ ] Prisma Studio에서 User 테이블 구조를 시각적으로 확인할 수 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Prisma 초기화 완료 상태)
- **Blocks**: DB-003 (Listing - FK→User), DB-004 (Curated DB - FK→User), DB-006 (LTV_Policy - FK→User), DB-007 (Lead_Alert - FK→User), DB-008 (B2B_Partner - FK→User)

---

## 작성 현황 추적표

> 89개 전체 태스크 중 상세 명세서 작성 진행 현황

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001, INIT-002, INIT-003, INIT-004, DB-001 | ✅ **완료** |
| Batch 02 | DB-002, DB-003, DB-004, DB-005, DB-006 | ⬜ 대기 |
| Batch 03 | DB-007, DB-008, DB-009, DB-010, API-SPEC-001 | ⬜ 대기 |
| Batch 04 | API-SPEC-002, API-SPEC-003, API-SPEC-004, API-SPEC-005, API-SPEC-006 | ⬜ 대기 |
| Batch 05 | API-SPEC-007, API-SPEC-008, MOCK-001, MOCK-002, MOCK-003 | ⬜ 대기 |
| Batch 06 | MOCK-004, MOCK-005, MOCK-006, LIB-001, LIB-002 | ⬜ 대기 |
| Batch 07 | LIB-003, LIB-004, LIB-005, FE-F-001, FE-F-002 | ⬜ 대기 |
| Batch 08 | FE-F-003, FE-F-004, FE-F-005, BE-F-001, BE-F-002 | ⬜ 대기 |
| Batch 09 | FE-G-001, FE-G-002, FE-G-003, FE-G-004, FE-G-005 | ⬜ 대기 |
| Batch 10 | BE-G-001, BE-G-002, FE-H-001, FE-H-002, FE-H-003 | ⬜ 대기 |
| Batch 11 | FE-H-004, FE-H-005, BE-H-001, BE-H-002, BE-H-003 | ⬜ 대기 |
| Batch 12 | BE-H-004, FE-I-001, FE-I-002, FE-I-003, FE-I-004 | ⬜ 대기 |
| Batch 13 | BE-I-001, BE-I-002, BE-I-003, BE-J-001, BE-J-002 | ⬜ 대기 |
| Batch 14 | TEST-001, TEST-002, TEST-003, TEST-004, TEST-005 | ⬜ 대기 |
| Batch 15 | TEST-006, TEST-007, TEST-INT-001, TEST-INT-002, TEST-INT-003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004, TEST-INT-005, NFR-001, NFR-002, NFR-003 | ⬜ 대기 |
| Batch 17 | NFR-004, NFR-005, NFR-006, NFR-007, NFR-008 | ⬜ 대기 |
| Batch 18 | NFR-009, NFR-010, NFR-011, NFR-012 | ⬜ 대기 |
