# TASK 상세 명세서 — Batch 18 (NFR-009 ~ NFR-012) — 최종 배치

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 18 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 89/89 ✅ 전체 완료

---

## Issue #86: NFR-009

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-009: Vercel Logs + Slack Webhook 모니터링 알림 통합"
labels: 'nfr, monitoring, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-009] Vercel Logs + Slack 모니터링 알림 통합
- **목적**: REQ-NF-014에 따라 p90 Latency 500ms 초과 시 Slack 경고를 자동 발송하는 모니터링 체계를 구축한다. Vercel Logs UI에서 주기적 확인 + 배치 Cron 실패 Slack 경고를 통합한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] Server Action/Route Handler에 성능 로깅 미들웨어 추가:
  ```typescript
  export function withPerformanceLog<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(`[PERF] ${name}: ${duration}ms (> 500ms threshold)`);
        await sendSlackAlert({
          title: `성능 경고: ${name}`,
          message: `p90 예상 초과: ${duration}ms`,
          level: 'warning',
          fields: [{ title: 'Duration', value: `${duration}ms` }],
        });
      }
      return result;
    } catch (error) {
      console.error(`[ERROR] ${name}:`, error);
      throw error;
    }
  }
  ```
- [ ] 주요 Server Action에 래핑 적용: `reverseFilter`, `generateDashboard`, `generateReport`
- [ ] Vercel Dashboard → Logs 탭에서 `[PERF]`, `[ERROR]` 검색 가능 확인

### :test_tube: Acceptance Criteria
- [ ] 500ms 초과 Server Action에 대해 Slack 경고가 발송되는가?
- [ ] Vercel Logs에서 `[PERF]` 로그가 검색 가능한가?
- [ ] 정상 범위 호출 시 경고가 발송되지 않는가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-005 (Slack), BE-F-001, BE-G-001, BE-G-002

---

## Issue #87: NFR-010

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-010: 배포 후 Smoke Test — 핵심 기능 수동 검증 체크리스트"
labels: 'nfr, qa, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-010] 배포 후 Smoke Test 체크리스트
- **목적**: Vercel Production 배포 후 핵심 기능이 정상 동작하는지 수동으로 검증하는 체크리스트를 작성하고 실행한다. Closed Beta 오픈 전 최종 Gate이다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] Smoke Test 체크리스트 작성 (`docs/smoke-test-checklist.md`):
  ```markdown
  ## Production Smoke Test Checklist

  ### B2C
  - [ ] 랜딩 페이지 접속 (LCP ≤ 2초)
  - [ ] 가용 현금 입력 + 검색 → 결과 리스트 표시
  - [ ] 구역 카드 클릭 → 대시보드 비교 표시
  - [ ] 대시보드에서 기축 아파트 3개+ 표시
  - [ ] 심층 리포트 4개 섹션 표시
  - [ ] 면책 조항 Footer 표시
  - [ ] 검색 0건 → Empty State + Lead Gen 버튼

  ### B2B
  - [ ] 올바른 패스코드 → 매물 등록 폼 접근
  - [ ] 매물 등록 → Verified 뱃지 확인
  - [ ] 잘못된 패스코드 → 접근 차단

  ### Admin
  - [ ] 올바른 Admin 패스코드 → 대시보드 접근
  - [ ] LTV 정책 수정 → 저장 성공
  - [ ] 매물 테이블 → Verified 토글/삭제

  ### 인프라
  - [ ] Cron Job 등록 확인 (Vercel Dashboard)
  - [ ] 환경 변수 설정 확인 (6개)
  - [ ] HTTPS 인증서 정상
  ```
- [ ] Beta 오픈 전 전체 항목 통과 확인

### :test_tube: Acceptance Criteria
- [ ] 체크리스트 문서가 존재하는가?
- [ ] 모든 항목이 ✅ 통과되었는가?

### :construction: Dependencies & Blockers
- **Depends on**: NFR-006 (Vercel 배포), 전체 기능 구현 완료

---

## Issue #88: NFR-011

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-011: 접근성(a11y) 기본 준수 — 키보드 탐색 + ARIA 라벨"
labels: 'nfr, accessibility, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-011] 접근성 기본 준수
- **목적**: REQ-NF-007에 따라 WCAG 2.1 Level AA 기본 수준의 접근성을 보장한다. 키보드 탐색, ARIA 라벨, 색상 대비를 점검한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `Tab` 키 탐색 순서 확인: 랜딩 → 입력창 → 버튼 → 결과 카드
- [ ] `aria-label` 추가: 검색 Input, 구역 카드, Verified 뱃지, 페이지네이션 버튼
- [ ] 색상 대비 확인: Lighthouse Accessibility 점수 ≥ 80
- [ ] `alt` 텍스트: 이미지/아이콘에 대체 텍스트 추가
- [ ] Focus 표시: 포커스 링 가시성 확인 (shadcn/ui 기본 제공)

### :test_tube: Acceptance Criteria
- [ ] Lighthouse Accessibility Score ≥ 80
- [ ] Tab 키로 모든 인터랙티브 요소 접근 가능
- [ ] 주요 요소에 aria-label이 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-001, FE-F-002, FE-G-001 (핵심 UI 완성)

---

## Issue #89: NFR-012

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-012: 에러 경계(Error Boundary) + 전역 에러 핸들링"
labels: 'nfr, error-handling, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-012] 에러 경계 + 전역 에러 핸들링
- **목적**: REQ-NF-015에 따라 예상치 못한 런타임 에러가 사용자에게 기술적 에러 메시지 대신 **친절한 안내 페이지**를 보여주도록 Error Boundary를 설정한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/error.tsx` 전역 Error Boundary:
  ```typescript
  'use client';
  export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">일시적인 오류가 발생했습니다</h1>
        <p className="text-muted-foreground">페이지를 새로고침하거나, 잠시 후 다시 시도해 주세요.</p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    );
  }
  ```
- [ ] `src/app/not-found.tsx` 404 페이지:
  ```typescript
  export default function NotFoundPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <Link href="/">홈으로 돌아가기</Link>
      </div>
    );
  }
  ```
- [ ] `src/app/global-error.tsx` (root layout 에러용):
  ```typescript
  'use client';
  export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <html><body>
        <h1>오류가 발생했습니다</h1>
        <button onClick={reset}>다시 시도</button>
      </body></html>
    );
  }
  ```
- [ ] Server Action 에러 → 클라이언트 사용자 친화적 메시지 변환 유틸:
  ```typescript
  export function parseActionError(error: unknown): string {
    if (error instanceof Error) {
      try { return JSON.parse(error.message).message; } catch {}
      return '요청 처리 중 오류가 발생했습니다.';
    }
    return '알 수 없는 오류가 발생했습니다.';
  }
  ```

### :test_tube: Acceptance Criteria
- [ ] `error.tsx`가 존재하고, 런타임 에러 시 친절한 안내가 표시되는가?
- [ ] `not-found.tsx`가 존재하고, 잘못된 URL 접근 시 404 페이지가 표시되는가?
- [ ] "다시 시도" 버튼이 `reset()`을 호출하여 컴포넌트를 복구하는가?
- [ ] 기술적 에러 메시지(스택 트레이스 등)가 사용자에게 노출되지 않는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Next.js App Router)
- **Blocks**: 없음 (독립 완료 가능)

---

---

# 🎉 전체 89 Tasks 상세 명세서 작성 완료

## 최종 작성 현황

| Batch | 파일명 | Task IDs | Issue # | 상태 |
|---|---|---|---|---|
| **01** | `10_TASK_상세명세서_Batch01.md` | INIT-001~004, DB-001 | #1~5 | ✅ |
| **02** | `11_TASK_상세명세서_Batch02.md` | DB-002~006 | #6~10 | ✅ |
| **03** | `12_TASK_상세명세서_Batch03.md` | DB-007~010, API-SPEC-001 | #11~15 | ✅ |
| **04** | `13_TASK_상세명세서_Batch04.md` | API-SPEC-002~006 | #16~20 | ✅ |
| **05** | `14_TASK_상세명세서_Batch05.md` | API-SPEC-007~008, MOCK-001~003 | #21~25 | ✅ |
| **06** | `15_TASK_상세명세서_Batch06.md` | MOCK-004~006, LIB-001~002 | #26~30 | ✅ |
| **07** | `16_TASK_상세명세서_Batch07.md` | LIB-003~005, FE-F-001~002 | #31~35 | ✅ |
| **08** | `17_TASK_상세명세서_Batch08.md` | FE-F-003~005, BE-F-001~002 | #36~40 | ✅ |
| **09** | `18_TASK_상세명세서_Batch09.md` | FE-G-001~005 | #41~45 | ✅ |
| **10** | `19_TASK_상세명세서_Batch10.md` | BE-G-001~002, FE-H-001~003 | #46~50 | ✅ |
| **11** | `20_TASK_상세명세서_Batch11.md` | FE-H-004~005, BE-H-001~003 | #51~55 | ✅ |
| **12** | `21_TASK_상세명세서_Batch12.md` | BE-H-004, FE-I-001~004 | #56~60 | ✅ |
| **13** | `22_TASK_상세명세서_Batch13.md` | BE-I-001~003, BE-J-001~002 | #61~65 | ✅ |
| **14** | `23_TASK_상세명세서_Batch14.md` | TEST-001~005 | #66~70 | ✅ |
| **15** | `24_TASK_상세명세서_Batch15.md` | TEST-006~007, TEST-INT-001~003 | #71~75 | ✅ |
| **16** | `25_TASK_상세명세서_Batch16.md` | TEST-INT-004~005, NFR-001~003 | #76~80 | ✅ |
| **17** | `26_TASK_상세명세서_Batch17.md` | NFR-004~008 | #81~85 | ✅ |
| **18** | `27_TASK_상세명세서_Batch18.md` | NFR-009~012 | #86~89 | ✅ |

**총 89개 Tasks × GitHub Issue 형태 = 89개 상세 명세서 완성** 🏁
