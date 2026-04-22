# TASK 상세 명세서 — Batch 17 (NFR-004 ~ NFR-008)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 17 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 85/89

---

## Issue #81: NFR-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-004: RSC Streaming 리포트 첫 섹션 0.5초 이내 렌더링 검증"
labels: 'nfr, performance, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-004] RSC Streaming 리포트 체감 속도 검증
- **목적**: REQ-NF-004에 따라 심층 리포트 페이지의 **첫 번째 섹션(투자 구조)**이 0.5초 이내에 사용자에게 표시되는지 검증한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] React `<Suspense>` boundary가 4개 섹션별로 분리되어 있는지 확인
- [ ] Fallback Skeleton이 즉시 표시되는지 확인
- [ ] Chrome DevTools Performance 탭으로 TTFB + Streaming 시점 측정
- [ ] Server Action 내 `Promise.all` 병렬 쿼리 확인
- [ ] 0.5초 초과 시: generateReport 내부 느린 쿼리 식별 → 인덱스/쿼리 최적화

### :test_tube: Acceptance Criteria
- [ ] 첫 Suspense 섹션이 0.5초 이내에 브라우저에 표시되는가?
- [ ] 4개 섹션이 독립 Suspense boundary로 분리되어 있는가?
- [ ] Skeleton fallback이 즉시 표시되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-G-005, BE-G-002

---

## Issue #82: NFR-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-005: next-sitemap 자동 생성 + robots.txt SEO 설정"
labels: 'nfr, seo, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-005] SEO — sitemap.xml + robots.txt 자동 생성
- **목적**: REQ-NF-005에 따라 `next-sitemap` 패키지로 빌드 시 자동으로 `sitemap.xml`과 `robots.txt`를 생성하여, B2C 랜딩 페이지가 검색 엔진에 올바르게 색인되도록 한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `next-sitemap` 패키지 설치: `npm install next-sitemap`
- [ ] `next-sitemap.config.js` 생성:
  ```javascript
  /** @type {import('next-sitemap').IConfig} */
  module.exports = {
    siteUrl: process.env.SITE_URL || 'https://navigator.vercel.app',
    generateRobotsTxt: true,
    exclude: ['/b2b/*', '/admin/*'], // B2B/Admin은 크롤링 제외
    robotsTxtOptions: {
      policies: [
        { userAgent: '*', allow: '/', disallow: ['/b2b/', '/admin/', '/api/'] },
      ],
    },
  };
  ```
- [ ] `package.json` postbuild 스크립트 추가: `"postbuild": "next-sitemap"`
- [ ] SEO 메타 태그 확인: `/(b2c)/layout.tsx`에 `<title>`, `<meta name="description">` 설정

### :test_tube: Acceptance Criteria
- [ ] `npm run build` 후 `public/sitemap.xml`이 생성되는가?
- [ ] `robots.txt`에 `/b2b/`, `/admin/`이 Disallow되어 있는가?
- [ ] B2C 페이지에 적절한 SEO 메타 태그가 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Next.js 기본 설정)

---

## Issue #83: NFR-006

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-006: Vercel Preview + Production 배포 파이프라인 구성"
labels: 'nfr, ci-cd, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-006] Vercel 배포 파이프라인 구성
- **목적**: REQ-NF-006에 따라 GitHub main 브랜치 push → Vercel Production 자동 배포, PR → Preview 배포 파이프라인을 구성한다. ₩0 인프라 제약 내에서 CI/CD를 완성한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] GitHub 저장소 생성 및 Vercel 프로젝트 연결
- [ ] Vercel Dashboard 설정:
  - Framework Preset: Next.js
  - Build Command: `npm run build` (기본값)
  - Output Directory: `.next` (기본값)
  - 환경 변수 설정: DATABASE_URL, DIRECT_URL, SECRET_B2B, SECRET_ADMIN, MOLIT_API_KEY, SLACK_WEBHOOK_URL
- [ ] Branch 전략:
  - `main` → Production 배포
  - `develop` / PR → Preview 배포
- [ ] `vercel.json` 확인: Cron 설정(BE-J-002) 포함
- [ ] 배포 후 Smoke Test: 랜딩 페이지 접속 + Health Check

### :test_tube: Acceptance Criteria
- [ ] `main` push 시 Production 자동 배포되는가?
- [ ] PR 생성 시 Preview URL이 생성되는가?
- [ ] 환경 변수가 올바르게 설정되어 있는가?
- [ ] 배포 후 랜딩 페이지가 정상 접속되는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (프로젝트), BE-J-002 (vercel.json)
- **Blocks**: NFR-010 (배포 후 Cron 검증)

---

## Issue #84: NFR-007

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-007: Amplitude 북극성 KPI 이벤트 트래킹 삽입"
labels: 'nfr, analytics, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-007] Amplitude 핵심 이벤트 트래킹 삽입
- **목적**: REQ-NF-022~024에 정의된 북극성 KPI 이벤트 5종을 프론트엔드에 삽입한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `@amplitude/analytics-browser` 패키지 설치
- [ ] `src/lib/analytics.ts` 초기화 모듈:
  ```typescript
  import * as amplitude from '@amplitude/analytics-browser';
  
  export function initAmplitude() {
    if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
      amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY);
    }
  }

  export function trackEvent(name: string, properties?: Record<string, any>) {
    amplitude.track(name, properties);
  }
  ```
- [ ] 5개 이벤트 삽입:
  | 이벤트명 | 삽입 위치 | 트리거 |
  |---|---|---|
  | `View_Landing_Page` | FE-F-001 `page.tsx` | 페이지 로드 |
  | `Submit_Cash_Input` | FE-F-001 `cash-input-form.tsx` | 검색 버튼 클릭 |
  | `View_Filtered_Result_List` | FE-F-002 `search/page.tsx` | 결과 페이지 로드 |
  | `Click_Zone_Card` | FE-F-002 `zone-result-list.tsx` | 구역 카드 클릭 |
  | `View_Dashboard` | FE-G-001 `comparison/[zoneId]/page.tsx` | 대시보드 로드 |

### :test_tube: Acceptance Criteria
- [ ] Amplitude Dashboard에서 5개 이벤트가 수신되는가?
- [ ] API Key 미설정 시에도 에러 없이 동작하는가 (graceful skip)?
- [ ] 이벤트에 cash, zone_id 등 속성이 포함되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-001, FE-F-002, FE-G-001 (이벤트 삽입 대상 UI 완성)

---

## Issue #85: NFR-008

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-008: Amplitude 비즈니스 이벤트 — Verified 매물/Lead Gen 전환 트래킹"
labels: 'nfr, analytics, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-008] Amplitude 비즈니스 전환 이벤트 트래킹
- **목적**: REQ-NF-024에 정의된 비즈니스 전환 이벤트(Verified 매물 클릭, Lead Gen 구독 완료)를 삽입한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] 추가 이벤트 삽입:
  | 이벤트명 | 삽입 위치 | 트리거 |
  |---|---|---|
  | `Click_Verified_Listing` | FE-H-004 | Verified 뱃지 매물 클릭 |
  | `Impression_All_Listings` | FE-H-004 | 매물 리스트 페이지 로드 |
  | `Submit_Lead_Subscription` | FE-F-003 | Lead Gen 구독 완료 |
  | `View_Report` | FE-G-005 | 심층 리포트 페이지 로드 |

### :test_tube: Acceptance Criteria
- [ ] 4개 비즈니스 이벤트가 Amplitude에 수신되는가?
- [ ] `Click_Verified_Listing`에 listing_id가 포함되는가?

### :construction: Dependencies & Blockers
- **Depends on**: NFR-007 (Amplitude 초기화), FE-H-004, FE-F-003, FE-G-005

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~16** | INIT~NFR-003 | ✅ 완료 (80개) |
| **Batch 17** | NFR-004~008 | ✅ **완료** |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
