# TASK 상세 명세서 — Batch 16 (TEST-INT-004 ~ TEST-INT-005, NFR-001 ~ NFR-003)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 16 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 80/89

---

## Issue #76: TEST-INT-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-INT-004: Admin LTV 정책 수정 E2E 통합 테스트"
labels: 'test, e2e, integration, admin, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-INT-004] Admin LTV 정책 수정 E2E 테스트
- **목적**: Admin 패스코드 인증 → LTV 정책 3-Tier 수정 → 저장 → 역산 결과 즉시 반영 검증까지의 전체 흐름을 Playwright로 테스트한다.

### :link: References (Spec & Context)
- FE-I-002 → BE-I-001 → LIB-001 → BE-F-001: Admin LTV 변경 → 역산 반영 흐름

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `e2e/admin-ltv.spec.ts` 파일 생성
- [ ] 테스트 시나리오:
  ```typescript
  test.describe('Admin LTV 정책 관리', () => {
    test('패스코드 인증 → LTV 수정 → 저장 성공', async ({ page }) => {
      await page.goto('/admin');
      await page.fill('[name="passcode"]', process.env.SECRET_ADMIN!);
      await page.click('button[type="submit"]');
      await page.click('a:has-text("LTV 관리")');
      
      // Tier 1의 max_loan_amount 수정
      const firstTierLoan = page.locator('[name="policies.0.max_loan_amount"]');
      await firstTierLoan.clear();
      await firstTierLoan.fill('700000000');
      
      await page.fill('[name="passcode"]', process.env.SECRET_ADMIN!);
      await page.click('button:has-text("저장")');
      await expect(page.getByText('정책이 업데이트되었습니다')).toBeVisible();
    });

    test('정책 변경 후 역산 반영 확인', async ({ page }) => {
      // LTV 변경 후 B2C 역산 실행 → 대출 가능액이 변경된 값으로 반영
      await page.goto('/');
      await page.fill('input[name="cash"]', '300000000');
      await page.click('button:has-text("검색")');
      // 결과가 변경된 LTV 기반으로 산출되었는지 간접 확인
      await page.waitForURL('/search*');
    });

    test('Tier 겹침 → 에러', async ({ page }) => {
      // Tier 1 max > Tier 2 min으로 설정
      // 저장 시 "가격 범위가 겹칩니다" 에러 확인
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] LTV 정책 수정 → 저장 성공 E2E 통과
- [ ] 변경 후 역산 반영 E2E 통과
- [ ] Tier 겹침 에러 E2E 통과

### :construction: Dependencies & Blockers
- **Depends on**: FE-I-002, BE-I-001 (전체 Admin LTV 구현)
- **Blocks**: 없음

---

## Issue #77: TEST-INT-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-INT-005: 데이터 동기화 지연 배너 + Lead Gen 구독 E2E 통합 테스트"
labels: 'test, e2e, integration, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-INT-005] 동기화 지연 배너 + Lead Gen 구독 E2E 테스트
- **목적**: `data_synced_at`이 30일 초과일 때 경고 배너가 표시되며, 매칭 0건 시 Lead Gen 구독이 정상 저장되는지 통합 검증한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `e2e/b2c-edge-cases.spec.ts` 파일 생성
- [ ] 테스트 시나리오:
  ```typescript
  test.describe('B2C Edge Cases', () => {
    test('동기화 30일 초과 → 경고 배너', async ({ page }) => {
      // DB에서 last_synced_at을 45일 전으로 설정 (테스트 Seed)
      await page.goto('/');
      await page.fill('input[name="cash"]', '300000000');
      await page.click('button:has-text("검색")');
      await expect(page.getByText('마지막 데이터 갱신일')).toBeVisible();
    });

    test('Lead Gen 구독 등록 → DB 저장', async ({ page }) => {
      await page.goto('/');
      await page.fill('input[name="cash"]', '10000000');
      await page.click('button:has-text("검색")');
      await page.click('button:has-text("알림 등록")');
      await expect(page.getByText('등록 완료')).toBeVisible();
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 30일 초과 배너 노출 E2E 통과
- [ ] Lead Gen 구독 등록 E2E 통과

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-003, FE-F-004, BE-F-002

---

## Issue #78: NFR-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-001: Vercel Cold Start 최적화 — Server Action 초기 호출 2초 이내"
labels: 'nfr, performance, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-001] Vercel Cold Start 최적화
- **목적**: REQ-NF-001에 따라 Vercel Hobby 환경에서 Server Action 첫 호출(Cold Start) 시 응답 시간을 2초 이내로 최적화한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] Prisma Client 싱글턴 패턴 확인(`lib/prisma.ts` — `globalThis` 캐싱)
- [ ] 불필요한 `import` 제거: Server Action 파일에서 사용하지 않는 모듈 Dynamic Import 검토
- [ ] `prisma generate` 최적화: `binaryTargets` 불필요한 타겟 제거
- [ ] Vercel Logs에서 Cold Start 시간 측정 → 2초 초과 시 원인 분석
- [ ] `next.config.js`에 `experimental.instrumentationHook` 설정으로 워밍업 시도 (optional)

### :test_tube: Acceptance Criteria
- [ ] Vercel Production 배포 후 Cold Start 첫 호출 ≤ 2초
- [ ] Prisma Client 싱글턴이 globalThis에 캐싱되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-F-001$ (역산 — 가장 무거운 Server Action)
- **Blocks**: 없음 (배포 후 튜닝)

---

## Issue #79: NFR-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-002: Pagination 1,000개 구역 성능 검증 — p95 ≤ 500ms"
labels: 'nfr, performance, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-002] Pagination 대규모 데이터 성능 검증
- **목적**: REQ-NF-002에 따라 1,000개 이상 Zone 데이터에서도 Pagination이 p95 ≤ 500ms로 동작하는지 검증하고, 필요 시 DB 인덱스를 추가한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] 테스트 Seed: 1,000건 Zone 더미 데이터 생성 스크립트 작성
- [ ] 성능 측정: `/api/v1/zones?page=50&size=20` 반복 호출 → p95 응답 시간 측정
- [ ] 인덱스 확인: `zone.name`, `zone.district`, `zone.stage` 필드에 인덱스 존재 여부 확인
- [ ] 필요 시 Prisma 마이그레이션으로 인덱스 추가

### :test_tube: Acceptance Criteria
- [ ] 1,000건 Zone에서 Pagination GET 요청 p95 ≤ 500ms
- [ ] 필요 인덱스가 적용되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-H-004 (Zones GET), DB-002 (Zone 스키마)

---

## Issue #80: NFR-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-003: RSC SSR 랜딩 LCP ≤ 1초 — Lighthouse CI 검증"
labels: 'nfr, performance, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-003] 랜딩 페이지 LCP 성능 검증
- **목적**: REQ-NF-003에 따라 랜딩 페이지의 Largest Contentful Paint를 1초 이내로 달성하고, Lighthouse CI로 지속 검증한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] Lighthouse CLI 로컬 실행: `npx lighthouse http://localhost:3000 --output json`
- [ ] LCP 측정 및 최적화:
  - `page.tsx`는 Server Component (JS 번들 최소화)
  - Client Component(`cash-input-form.tsx`)만 Dynamic Import
  - 이미지/폰트: `next/font` 프리로드
- [ ] `next.config.js` 최적화: `swcMinify: true`
- [ ] Production 빌드 후 재측정: `npm run build && npm run start`

### :test_tube: Acceptance Criteria
- [ ] Lighthouse LCP ≤ 1초 (로컬 기준)
- [ ] Lighthouse Performance Score ≥ 90
- [ ] Client-side JS 번들에 불필요한 라이브러리 미포함

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-001 (랜딩 페이지)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~15** | INIT~TEST-INT-003 | ✅ 완료 (75개) |
| **Batch 16** | TEST-INT-004~005, NFR-001~003 | ✅ **완료** |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
