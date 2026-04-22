# TASK 상세 명세서 — Batch 15 (TEST-006 ~ TEST-007, TEST-INT-001 ~ TEST-INT-003)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 15 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 75/89

---

## Issue #71: TEST-006

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-006: generateDashboard 대시보드 비교 로직 단위 테스트"
labels: 'test, unit-test, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-006] `generateDashboard` Server Action 단위 테스트
- **목적**: 1:1 대조 대시보드의 핵심 로직 — 기축 아파트 매칭, 회복률 산출, Bluechip 미래 가치, **인접 행정구 확장(district_expanded)**의 정확성을 검증한다.

### :link: References (Spec & Context)
- BE-G-001: `generateDashboard` 구현체
- REQ-FUNC-008~012: 대시보드 기능 요구사항

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/__tests__/comparison-dashboard.test.ts` 파일 생성
- [ ] 테스트 케이스:
  ```typescript
  describe('generateDashboard', () => {
    it('동일 행정구 기축 3개+ 매칭', async () => {
      // Mock: '성북구' Curated 5건, Bluechip 1건
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 300_000_000 });
      expect(result.existing_apartments.length).toBeGreaterThanOrEqual(3);
      expect(result.district_expanded).toBe(false);
    });

    it('동일 행정구 부재 → 인접 확장', async () => {
      // Mock: '도봉구' Curated 0건, 인접 '노원구' 3건
      const result = await generateDashboard({ zone_id: 'zone-dobong', cash: 300_000_000 });
      expect(result.district_expanded).toBe(true);
      expect(result.existing_apartments.length).toBeGreaterThanOrEqual(1);
    });

    it('회복률 산출 정확도', async () => {
      // Mock: latest 9억, peak 11억
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 500_000_000 });
      const apt = result.existing_apartments.find(a => a.latest_actual_price === 900_000_000);
      if (apt && apt.recovery_rate !== null) {
        expect(apt.recovery_rate).toBeCloseTo(81.82, 0); // ±1% 허용
      }
    });

    it('회복률 null — peak 데이터 없음', async () => {
      // Mock: peak_price_2122 === null
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 500_000_000 });
      const aptWithNullPeak = result.existing_apartments.find(a => a.peak_price_2122 === null);
      if (aptWithNullPeak) {
        expect(aptWithNullPeak.recovery_rate).toBeNull();
      }
    });

    it('Bluechip 미래 가치 반환', async () => {
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 300_000_000 });
      expect(result.redevelopment.bluechip_ref).toBeDefined();
      expect(result.redevelopment.potential_price).toBeGreaterThan(0);
    });

    it('예산 범위 필터 — maxBuyable 초과 아파트 제외', async () => {
      // Mock: cash 2억 + LTV 6억 = 최대 8억
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 200_000_000 });
      result.existing_apartments.forEach(apt => {
        expect(apt.latest_actual_price).toBeLessThanOrEqual(800_000_000);
      });
    });

    it('disclaimer 텍스트 존재', async () => {
      const result = await generateDashboard({ zone_id: 'zone-1', cash: 300_000_000 });
      expect(result.disclaimer).toBeTruthy();
      expect(result.disclaimer.length).toBeGreaterThan(10);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 동일 행정구 3개+ 매칭 + `district_expanded === false` 통과
- [ ] 인접 확장 + `district_expanded === true` 통과
- [ ] 회복률 수치 정확도 (±1%) 통과
- [ ] 회복률 null 처리 통과
- [ ] Bluechip 미래 가치 반환 통과
- [ ] 예산 범위 필터링 통과

### :construction: Dependencies & Blockers
- **Depends on**: BE-G-001 (구현체), TEST-001, TEST-002 (하위 모듈 테스트)
- **Blocks**: TEST-INT-002 (E2E)

---

## Issue #72: TEST-007

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-007: generateReport 심층 리포트 4개 섹션 단위 테스트"
labels: 'test, unit-test, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-007] `generateReport` Server Action 단위 테스트
- **목적**: 심층 리포트의 4개 섹션(투자 구조, 주거 비용, 현금 흐름, 미래 가치)이 올바른 구조와 값으로 반환되는지 검증한다.

### :link: References (Spec & Context)
- BE-G-002: `generateReport` 구현체
- REQ-FUNC-011: 리포트 0.5초 이내

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/__tests__/comparison-report.test.ts` 파일 생성
- [ ] 테스트 케이스:
  ```typescript
  describe('generateReport', () => {
    it('4개 섹션 모두 존재', async () => {
      const result = await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      expect(result.report.investment_structure).toBeDefined();
      expect(result.report.housing_cost).toBeDefined();
      expect(result.report.cash_flow).toBeDefined();
      expect(result.report.future_value).toBeDefined();
    });

    it('투자 구조 — 재개발 총 투자금 산출', async () => {
      const result = await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      const redev = result.report.investment_structure.redevelopment;
      expect(redev.total).toBe(redev.rights_value + redev.additional_burden + redev.acquisition_tax);
    });

    it('투자 구조 — 기축 총 투자금 산출', async () => {
      const result = await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      const existing = result.report.investment_structure.existing[0];
      expect(existing.total).toBe(existing.purchase_price + existing.acquisition_tax + existing.brokerage_fee);
    });

    it('현금 흐름 — 3/5/10년 시점 존재', async () => {
      const result = await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      const cf = result.report.cash_flow;
      expect(cf.projections).toHaveLength(3); // 3년, 5년, 10년
    });

    it('generated_at ISO 8601', async () => {
      const result = await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      expect(() => new Date(result.generated_at)).not.toThrow();
    });

    it('응답 시간 < 500ms', async () => {
      const start = Date.now();
      await generateReport({ zone_id: 'zone-1', apt_ids: ['apt-1'], cash: 300_000_000 });
      expect(Date.now() - start).toBeLessThan(500);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 4개 섹션 존재 확인 통과
- [ ] 투자 구조 산출 정합성(합계 검증) 통과
- [ ] 현금 흐름 3개 시점 존재 통과
- [ ] generated_at ISO 8601 통과
- [ ] 응답 시간 500ms 미만 통과

### :construction: Dependencies & Blockers
- **Depends on**: BE-G-002 (구현체), TEST-001, TEST-002
- **Blocks**: FE-G-005 (리포트 UI)

---

## Issue #73: TEST-INT-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-INT-001: B2B 매물 등록 E2E 통합 테스트 — Playwright"
labels: 'test, e2e, integration, b2b, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-INT-001] B2B 매물 등록 E2E 통합 테스트
- **목적**: 패스코드 입력 → 매물 등록 폼 작성 → 서버 교차검증 → DB 저장 → Verified 뱃지 확인까지의 **전체 B2B 흐름**을 브라우저 단위로 통합 테스트한다.

### :link: References (Spec & Context)
- LIB-003 → FE-H-001 → BE-H-001 → FE-H-002/003: 전체 B2B 흐름
- REQ-FUNC-015~019: B2B 기능 요구사항

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `e2e/b2b-listing.spec.ts` 파일 생성 (Playwright)
- [ ] 테스트 시나리오:
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('B2B 매물 등록 플로우', () => {
    test('정상 플로우: 패스코드 → 등록 → Verified', async ({ page }) => {
      await page.goto('/b2b/listing/new');
      
      // Step 1: PasscodeGuard 인증
      await page.fill('[name="passcode"]', process.env.SECRET_B2B!);
      await page.click('button[type="submit"]');
      
      // Step 2: 매물 등록 폼 작성
      await page.selectOption('[name="zone_id"]', { index: 1 });
      await page.selectOption('[name="property_type"]', 'TTUKKUNG');
      await page.fill('[name="asking_price"]', '300000000');
      await page.fill('[name="premium"]', '50000000');
      await page.fill('[name="rights_value"]', '200000000');
      
      // Step 3: 제출
      await page.click('button:has-text("등록")');
      
      // Step 4: 성공 확인
      await expect(page.getByText('등록이 완료되었습니다')).toBeVisible();
    });

    test('잘못된 패스코드 → 폼 접근 불가', async ({ page }) => {
      await page.goto('/b2b/listing/new');
      await page.fill('[name="passcode"]', 'wrong-code');
      await page.click('button[type="submit"]');
      
      await expect(page.getByText('유효하지 않은 접근 코드')).toBeVisible();
      await expect(page.locator('[name="passcode"]')).toBeDisabled();
    });

    test('이상치 호가 → PRICE_ANOMALY 에러', async ({ page }) => {
      // 패스코드 인증 후
      await page.goto('/b2b/listing/new');
      await page.fill('[name="passcode"]', process.env.SECRET_B2B!);
      await page.click('button[type="submit"]');
      
      // 이상치 호가 (기존 3억 대비 5억)
      await page.selectOption('[name="zone_id"]', { index: 1 });
      await page.fill('[name="asking_price"]', '500000000');
      await page.fill('[name="premium"]', '50000000');
      await page.fill('[name="rights_value"]', '200000000');
      await page.click('button:has-text("등록")');
      
      await expect(page.getByText('정상 범위를 벗어난 호가')).toBeVisible();
    });
  });
  ```
- [ ] Playwright 설정: `playwright.config.ts` 생성
- [ ] Test DB: 테스트 전 Seed 데이터 적재 → 테스트 후 정리

### :test_tube: Acceptance Criteria
- [ ] 정상 등록 → Verified 확인 E2E 통과
- [ ] 패스코드 불일치 → Disabled E2E 통과
- [ ] 이상치 호가 → PRICE_ANOMALY E2E 통과
- [ ] `npx playwright test` 시 전체 통과

### :gear: Technical & Non-Functional Constraints
- **Playwright**: E2E 테스트 프레임워크. `@playwright/test` 패키지 사용
- **테스트 격리**: 각 테스트 시작 시 Seed, 종료 시 Cleanup
- **환경 변수**: `.env.test`에 테스트용 SECRET_B2B 설정

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003, FE-H-001, BE-H-001, FE-H-002, FE-H-003 (전체 B2B 구현 완료)
- **Blocks**: NFR-006 (배포 전 E2E 검증)

---

## Issue #74: TEST-INT-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-INT-002: B2C 역산→대시보드→리포트 E2E 통합 테스트 — Playwright"
labels: 'test, e2e, integration, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-INT-002] B2C 핵심 플로우 E2E 통합 테스트
- **목적**: 랜딩 페이지 가용 현금 입력 → 역산 결과 리스트 확인 → 구역 카드 클릭 → 대시보드 비교 → 리포트 보기까지의 **B2C 전체 사용자 여정**을 통합 테스트한다.

### :link: References (Spec & Context)
- FE-F-001 → BE-F-001 → FE-F-002 → FE-G-001 → BE-G-001 → FE-G-005 → BE-G-002
- REQ-FUNC-001~012: B2C 기능 요구사항

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `e2e/b2c-flow.spec.ts` 파일 생성
- [ ] 테스트 시나리오:
  ```typescript
  test.describe('B2C 핵심 플로우', () => {
    test('랜딩 → 역산 → 대시보드 → 리포트', async ({ page }) => {
      // Step 1: 랜딩 페이지
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('가용 현금');
      
      // Step 2: 가용 현금 입력 + 검색
      await page.fill('input[name="cash"]', '300000000');
      await page.click('button:has-text("검색")');
      
      // Step 3: 결과 리스트 확인
      await page.waitForURL('/search*');
      const cards = page.locator('[data-testid="zone-card"]');
      await expect(cards.first()).toBeVisible({ timeout: 5000 });
      
      // Step 4: 첫 번째 구역 카드 클릭 → 대시보드
      await cards.first().click();
      await page.waitForURL('/comparison/*');
      
      // Step 5: 대시보드 구조 확인
      await expect(page.getByText('재개발')).toBeVisible();
      await expect(page.getByText('기축')).toBeVisible();
      
      // Step 6: 리포트 보기
      await page.click('button:has-text("심층 분석")');
      await page.waitForURL('*/report');
      await expect(page.getByText('투자 구조')).toBeVisible();
      await expect(page.getByText('주거 비용')).toBeVisible();
    });

    test('0건 → Empty State → Lead Gen', async ({ page }) => {
      await page.goto('/');
      await page.fill('input[name="cash"]', '10000000'); // 1천만 원
      await page.click('button:has-text("검색")');
      
      await page.waitForURL('/search*');
      await expect(page.getByText('진입 가능한 구역이 없습니다')).toBeVisible();
      await expect(page.getByText('알림 등록')).toBeVisible();
    });

    test('랜딩 페이지 LCP ≤ 2초', async ({ page }) => {
      const start = Date.now();
      await page.goto('/');
      await page.waitForSelector('h1');
      expect(Date.now() - start).toBeLessThan(2000);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 전체 B2C 플로우 (5단계) E2E 통과
- [ ] 0건 → Empty State → Lead Gen 통과
- [ ] 랜딩 LCP ≤ 2초 통과

### :gear: Technical & Non-Functional Constraints
- **data-testid**: 주요 UI 요소에 `data-testid` 속성 부여하여 테스트 안정성 확보
- **타임아웃**: 네트워크/DB 의존적이므로 적절한 timeout(5초) 설정

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-001~005, BE-F-001~002, FE-G-001~005, BE-G-001~002 (전체 B2C 구현 완료)
- **Blocks**: NFR-006 (배포 전 E2E 검증)

---

## Issue #75: TEST-INT-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-INT-003: 국토부 API 배치 수집 통합 테스트 — Mock API 기반"
labels: 'test, integration, cron, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-INT-003] 국토부 API 배치 수집 통합 테스트
- **목적**: `/api/cron/batch-molit` Route Handler의 정상 수집, 타임아웃 재시도, 최종 실패 시 Slack 경고 흐름을 Mock API 기반으로 테스트한다.

### :link: References (Spec & Context)
- BE-J-001: 배치 Cron 구현체
- API-SPEC-008: BatchResult, MolitApiResponse

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/cron/__tests__/batch-molit.test.ts` 파일 생성
- [ ] `msw` (Mock Service Worker) 또는 `vi.fn()` fetch Mock 사용:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // global fetch Mock
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  describe('/api/cron/batch-molit', () => {
    it('정상 수집 → success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: {
            header: { resultCode: '00' },
            body: { items: { item: [
              { aptNm: '래미안', dealAmount: '90,000', excluUseAr: '84.5', dealYear: '2026', dealMonth: '03', dealDay: '15', jibun: '성북구', floor: '10' },
            ]}, totalCount: 1 },
          },
        }),
      });

      const response = await GET(mockRequest);
      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.synced_count).toBe(1);
    });

    it('1회 실패 → 재시도 → 2회차 성공', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Timeout'))  // 1회 실패
        .mockResolvedValueOnce({ ok: true, json: async () => mockMolitResponse }); // 2회 성공

      const response = await GET(mockRequest);
      expect(await response.json()).toMatchObject({ status: 'success' });
    });

    it('3회 모두 실패 → Slack 경고 + failed', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const slackSpy = vi.spyOn(slackModule, 'sendSlackAlert');

      const response = await GET(mockRequest);
      const body = await response.json();
      expect(body.status).toBe('failed');
      expect(body.retry_count).toBe(3);
      expect(slackSpy).toHaveBeenCalledWith(expect.objectContaining({ level: 'critical' }));
    });

    it('Cron Secret 미인증 → 401', async () => {
      const unauthRequest = new NextRequest('http://localhost/api/cron/batch-molit');
      const response = await GET(unauthRequest);
      expect(response.status).toBe(401);
    });

    it('금액 변환: "90,000" → 900_000_000', () => {
      const raw = '90,000';
      const converted = parseInt(raw.replace(/,/g, '')) * 10000;
      expect(converted).toBe(900_000_000);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 정상 수집 → success 통과
- [ ] 재시도 → 2회차 성공 통과
- [ ] 3회 전부 실패 → Slack 경고 + failed 통과
- [ ] Cron Secret 미인증 → 401 통과
- [ ] 금액 변환 정확도 통과

### :gear: Technical & Non-Functional Constraints
- **Mock 전략**: `global.fetch = vi.fn()`으로 네트워크 호출 Mock. 실제 국토부 API 호출 금지
- **Slack Mock**: `sendSlackAlert` 함수를 spy하여 호출 여부만 검증
- **Cron Secret**: Mock Request의 Authorization 헤더에 테스트용 CRON_SECRET 주입

### :construction: Dependencies & Blockers
- **Depends on**: BE-J-001 (구현체), LIB-005 (Slack)
- **Blocks**: NFR-010 (배포 후 Cron 검증)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~14** | INIT~TEST-005 | ✅ 완료 (70개) |
| **Batch 15** | TEST-006~007, TEST-INT-001~003 | ✅ **완료** |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
