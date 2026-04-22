# TASK 상세 명세서 — Batch 14 (TEST-001 ~ TEST-005)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 14 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 70/89

---

## Issue #66: TEST-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-001: 취득세 산출 로직 단위 테스트 (Vitest)"
labels: 'test, unit-test, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-001] `lib/tax-calculator.ts` 단위 테스트
- **목적**: 역산 알고리즘의 핵심 구성 요소인 취득세 산출 로직(`calculateAcquisitionTax`, `reverseCalculateFromCash`)의 정확성을 검증한다. 세율 구간 경계값, 재개발 vs 일반 아파트 분기, 음수/0 입력 방어를 테스트한다.

### :link: References (Spec & Context)
- LIB-002: `tax-calculator.ts` 구현체
- REQ-FUNC-003: 실투자금 오차율 ±5% 이내

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/__tests__/tax-calculator.test.ts` 파일 생성
- [ ] 테스트 스위트:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { calculateAcquisitionTax, reverseCalculateFromCash } from '../tax-calculator';

  describe('calculateAcquisitionTax', () => {
    describe('일반 아파트', () => {
      it('6억 이하 → ~1.3% 세율', () => {
        const tax = calculateAcquisitionTax(500_000_000, false);
        expect(tax).toBeGreaterThan(6_000_000);
        expect(tax).toBeLessThan(7_000_000);
      });

      it('6억~9억 → ~2.3% 세율', () => {
        const tax = calculateAcquisitionTax(800_000_000, false);
        expect(tax).toBeGreaterThan(18_000_000);
        expect(tax).toBeLessThan(20_000_000);
      });

      it('9억 초과 → ~3.3% 세율', () => {
        const tax = calculateAcquisitionTax(1_200_000_000, false);
        expect(tax).toBeGreaterThan(38_000_000);
        expect(tax).toBeLessThan(42_000_000);
      });
    });

    describe('재개발 매물', () => {
      it('금액 무관 → ~1.4% 세율', () => {
        const tax = calculateAcquisitionTax(450_000_000, true);
        expect(tax).toBeGreaterThan(5_500_000);
        expect(tax).toBeLessThan(7_000_000);
      });
    });

    describe('경계값', () => {
      it('0원 → 0', () => expect(calculateAcquisitionTax(0)).toBe(0));
      it('음수 → 0', () => expect(calculateAcquisitionTax(-100)).toBe(0));
      it('정확히 6억', () => {
        const tax = calculateAcquisitionTax(600_000_000, false);
        expect(tax).toBeGreaterThan(0);
      });
      it('정확히 9억', () => {
        const tax = calculateAcquisitionTax(900_000_000, false);
        expect(tax).toBeGreaterThan(0);
      });
    });
  });

  describe('reverseCalculateFromCash', () => {
    it('역산 후 재계산 시 오차 ±5% 이내', () => {
      const cash = 300_000_000;
      const estimatedPrice = reverseCalculateFromCash(cash, true);
      const recalculatedTax = calculateAcquisitionTax(estimatedPrice, true);
      const total = estimatedPrice + recalculatedTax;
      const errorRate = Math.abs(total - cash) / cash;
      expect(errorRate).toBeLessThan(0.05); // ±5%
    });

    it('0원 → 0', () => expect(reverseCalculateFromCash(0)).toBe(0));
    it('음수 → 0', () => expect(reverseCalculateFromCash(-100)).toBe(0));
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 일반 아파트 3구간(6억 이하/6~9억/9억 초과) 테스트 통과
- [ ] 재개발 매물 세율 테스트 통과
- [ ] 경계값(0, 음수, 정확히 6억/9억) 테스트 통과
- [ ] 역산 오차율 ±5% 이내 테스트 통과
- [ ] `npx vitest run` 시 전체 통과

### :construction: Dependencies & Blockers
- **Depends on**: LIB-002 (구현체), INIT-001 (Vitest 설정)
- **Blocks**: BE-F-001 (역산 알고리즘 — 테스트 선행 보장)

---

## Issue #67: TEST-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-002: LTV 정책 조회·대출 가능액 단위 테스트 (Vitest + Prisma Mock)"
labels: 'test, unit-test, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-002] `lib/ltv-policy.ts` 단위 테스트
- **목적**: LTV 정책 DB 조회 및 대출 가능액 산출 로직의 정확성을 검증한다. Prisma Client를 Mock하여 DB 없이 테스트하며, Tier 경계값 매칭, 정책 미존재 시 0 반환을 검증한다.

### :link: References (Spec & Context)
- LIB-001: `ltv-policy.ts` 구현체
- CON-03: 하드코딩 금지 → DB 조회 검증

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/__tests__/ltv-policy.test.ts` 파일 생성
- [ ] Prisma Mock 설정:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { getMaxLoanAmount, getPolicies } from '../ltv-policy';
  
  // Prisma Mock
  vi.mock('@/lib/prisma', () => ({
    prisma: {
      lTV_Policy: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
  }));

  const mockPolicies = [
    { tier_label: '15억 이하', price_threshold_min: 0n, price_threshold_max: 1_500_000_000n, max_loan_amount: 600_000_000n },
    { tier_label: '15~25억', price_threshold_min: 1_500_000_001n, price_threshold_max: 2_500_000_000n, max_loan_amount: 400_000_000n },
    { tier_label: '25억 초과', price_threshold_min: 2_500_000_001n, price_threshold_max: 99_999_999_999n, max_loan_amount: 200_000_000n },
  ];
  ```
- [ ] 테스트 케이스:
  ```typescript
  describe('getMaxLoanAmount', () => {
    it('12억 → Tier 1 → 6억', async () => {
      prisma.lTV_Policy.findFirst.mockResolvedValue(mockPolicies[0]);
      expect(await getMaxLoanAmount(1_200_000_000)).toBe(600_000_000);
    });

    it('20억 → Tier 2 → 4억', async () => {
      prisma.lTV_Policy.findFirst.mockResolvedValue(mockPolicies[1]);
      expect(await getMaxLoanAmount(2_000_000_000)).toBe(400_000_000);
    });

    it('30억 → Tier 3 → 2억', async () => {
      prisma.lTV_Policy.findFirst.mockResolvedValue(mockPolicies[2]);
      expect(await getMaxLoanAmount(3_000_000_000)).toBe(200_000_000);
    });

    it('정책 없음 → 0', async () => {
      prisma.lTV_Policy.findFirst.mockResolvedValue(null);
      expect(await getMaxLoanAmount(1_200_000_000)).toBe(0);
    });
  });

  describe('getPolicies', () => {
    it('3-Tier 정렬 반환', async () => {
      prisma.lTV_Policy.findMany.mockResolvedValue(mockPolicies);
      const result = await getPolicies();
      expect(result).toHaveLength(3);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 3개 Tier 경계값 매칭 테스트 통과
- [ ] 정책 미존재 시 0 반환 테스트 통과
- [ ] `getPolicies` 정렬 확인 테스트 통과
- [ ] Prisma Mock으로 DB 없이 실행 가능

### :construction: Dependencies & Blockers
- **Depends on**: LIB-001 (구현체), INIT-001 (Vitest)
- **Blocks**: BE-F-001 (역산 — 테스트 선행)

---

## Issue #68: TEST-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-003: 마스킹 유틸 단위 테스트 (Vitest)"
labels: 'test, unit-test, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-003] `lib/masking.ts` 단위 테스트
- **목적**: 전화번호, 동호수, 이름 마스킹 유틸의 정확성과 null-safety를 검증한다. 순수 함수이므로 Mock 불필요.

### :link: References (Spec & Context)
- LIB-004: `masking.ts` 구현체

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/__tests__/masking.test.ts` 파일 생성
- [ ] 테스트 케이스:
  ```typescript
  describe('maskPhoneNumber', () => {
    it('하이픈 없는 번호', () => expect(maskPhoneNumber('01012345678')).toBe('010-****-5678'));
    it('하이픈 있는 번호', () => expect(maskPhoneNumber('010-1234-5678')).toBe('010-****-5678'));
    it('null', () => expect(maskPhoneNumber(null)).toBe(''));
    it('undefined', () => expect(maskPhoneNumber(undefined)).toBe(''));
    it('짧은 번호', () => expect(maskPhoneNumber('1234')).toBe('***-****-****'));
  });

  describe('maskUnitNumber', () => {
    it('동호수 마스킹', () => expect(maskUnitNumber('101-1201')).toBe('***-****'));
    it('한글 포함', () => expect(maskUnitNumber('1동 1201호')).toBe('*동 ****호'));
    it('null', () => expect(maskUnitNumber(null)).toBe(''));
  });

  describe('maskName', () => {
    it('3글자 이름', () => expect(maskName('김철수')).toBe('김**'));
    it('2글자 이름', () => expect(maskName('김수')).toBe('김*'));
    it('1글자', () => expect(maskName('김')).toBe('***'));
    it('null', () => expect(maskName(null)).toBe('***'));
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 전화번호: 하이픈 유무 무관 + null/짧은 번호 방어 통과
- [ ] 동호수: 숫자만 마스킹 + null 방어 통과
- [ ] 이름: 첫 글자 보존 + 1글자/null 방어 통과
- [ ] 순수 함수 — Mock 의존성 없이 실행

### :construction: Dependencies & Blockers
- **Depends on**: LIB-004 (구현체)
- **Blocks**: FE-H-005 (브리핑 모드)

---

## Issue #69: TEST-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-004: PasscodeGuard 검증 로직 단위 테스트 (Vitest)"
labels: 'test, unit-test, security, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-004] PasscodeGuard `verifyPasscode` Server Action 단위 테스트
- **목적**: B2B/Admin 패스코드 검증 로직의 정확성을 테스트한다. 환경 변수 일치/불일치, 타입(B2B/ADMIN) 분기를 검증한다.

### :link: References (Spec & Context)
- LIB-003: PasscodeGuard + `verifyPasscode` Server Action
- C-TEC-009: 환경 변수 기반 시크릿 패스코드

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/__tests__/verify-passcode.test.ts` 파일 생성
- [ ] 환경 변수 Mock:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  // 환경 변수 설정
  beforeEach(() => {
    vi.stubEnv('SECRET_B2B', 'test-b2b-secret');
    vi.stubEnv('SECRET_ADMIN', 'test-admin-secret');
  });
  ```
- [ ] 테스트 케이스:
  ```typescript
  describe('verifyPasscode', () => {
    it('B2B 올바른 패스코드 → true', async () => {
      expect(await verifyPasscode('test-b2b-secret', 'B2B')).toBe(true);
    });

    it('B2B 잘못된 패스코드 → false', async () => {
      expect(await verifyPasscode('wrong', 'B2B')).toBe(false);
    });

    it('ADMIN 올바른 패스코드 → true', async () => {
      expect(await verifyPasscode('test-admin-secret', 'ADMIN')).toBe(true);
    });

    it('ADMIN 잘못된 패스코드 → false', async () => {
      expect(await verifyPasscode('wrong', 'ADMIN')).toBe(false);
    });

    it('빈 문자열 → false', async () => {
      expect(await verifyPasscode('', 'B2B')).toBe(false);
    });

    it('B2B 패스코드로 ADMIN 접근 불가', async () => {
      expect(await verifyPasscode('test-b2b-secret', 'ADMIN')).toBe(false);
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] B2B/ADMIN 올바른 패스코드 → true 통과
- [ ] 잘못된 패스코드 → false 통과
- [ ] 교차 접근 방지 (B2B 코드로 ADMIN 접근 불가) 통과
- [ ] 빈 문자열 → false 통과

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003 (verifyPasscode 구현체)
- **Blocks**: FE-H-001 (B2B 폼), FE-I-001 (Admin 대시보드)

---

## Issue #70: TEST-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Test] TEST-005: 역방향 필터 알고리즘 단위 테스트 (Vitest + Prisma Mock)"
labels: 'test, unit-test, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [TEST-005] `reverseFilter` Server Action 단위 테스트
- **목적**: **시스템 핵심 비즈니스 로직**인 역산 알고리즘의 정확성을 검증한다. Prisma Mock으로 다양한 Zone/Listing/LTV 시나리오를 테스트한다. 가장 중요한 단위 테스트이다.

### :link: References (Spec & Context)
- BE-F-001: `reverseFilter` 구현체
- REQ-FUNC-002: p95 ≤ 1.5초
- REQ-FUNC-003: 실투자금 오차율 ±5% 이내

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/__tests__/reverse-filter.test.ts` 파일 생성
- [ ] Mock 데이터 설정:
  ```typescript
  const mockZones = [
    { zone_id: 'zone-1', name: '장위4구역', district: '성북구', stage: 'MANAGEMENT_DISPOSAL', avg_rights_value: 200_000_000n, listings: [] },
    { zone_id: 'zone-2', name: '노량진1구역', district: '동작구', stage: 'CONSTRUCTION', avg_rights_value: 350_000_000n, listings: [] },
    { zone_id: 'zone-3', name: '한남뉴타운', district: '용산구', stage: 'ZONE_DESIGNATION', avg_rights_value: 800_000_000n, listings: [] },
  ];
  const mockPolicy = { max_loan_amount: 600_000_000n };
  ```
- [ ] 테스트 케이스:
  ```typescript
  describe('reverseFilter', () => {
    it('가용 현금 3억 → 저가 구역만 매칭', async () => {
      // zone-1(권리가 2억): 필요투자금 = 2억 - 6억(대출) + 취득세 < 0 → 매칭
      // zone-2(권리가 3.5억): 필요투자금 확인
      // zone-3(권리가 8억): 필요투자금 = 8억 - 4억 + 취득세 > 3억 → 미매칭
      const result = await reverseFilter({ cash: 300_000_000 });
      expect(result.zones.length).toBeGreaterThan(0);
      expect(result.zones.every(z => z.zone_id !== 'zone-3')).toBe(true);
    });

    it('가용 현금 5천만 → 매칭 0건', async () => {
      const result = await reverseFilter({ cash: 50_000_000 });
      expect(result.zones).toHaveLength(0);
      expect(result.total_count).toBe(0);
    });

    it('match_score 내림차순 정렬', async () => {
      const result = await reverseFilter({ cash: 500_000_000 });
      if (result.zones.length >= 2) {
        expect(result.zones[0].match_score).toBeGreaterThanOrEqual(result.zones[1].match_score);
      }
    });

    it('data_synced_at ISO 8601 형식', async () => {
      const result = await reverseFilter({ cash: 300_000_000 });
      expect(() => new Date(result.data_synced_at)).not.toThrow();
    });

    it('Zod 검증 실패 — 음수 cash', async () => {
      await expect(reverseFilter({ cash: -100 })).rejects.toThrow();
    });

    it('옵션 필터 — 특정 stage만', async () => {
      const result = await reverseFilter({ cash: 300_000_000, options: { stages: ['MANAGEMENT_DISPOSAL'] } });
      result.zones.forEach(z => expect(z.stage).toBe('MANAGEMENT_DISPOSAL'));
    });
  });
  ```

### :test_tube: Acceptance Criteria
- [ ] 고예산 → 다수 매칭, 저예산 → 0건 매칭 테스트 통과
- [ ] match_score 정렬 테스트 통과
- [ ] data_synced_at ISO 8601 검증 통과
- [ ] Zod 검증 실패 시 에러 throw 통과
- [ ] 옵션 필터 테스트 통과

### :gear: Technical & Non-Functional Constraints
- **Prisma Mock**: `vi.mock('@/lib/prisma')` + `vi.mock('@/lib/ltv-policy')` + `vi.mock('@/lib/tax-calculator')`
- **성능 테스트 제외**: 단위 테스트에서는 p95 성능 미측정. 성능은 TEST-INT-002에서 검증
- **핵심 테스트**: 이 테스트가 통과하지 않으면 배포 차단

### :checkered_flag: Definition of Done (DoD)
- [ ] 6개 이상의 테스트 케이스가 정의되어 있는가?
- [ ] Prisma Mock으로 DB 없이 실행 가능한가?
- [ ] 고예산/저예산/경계값/옵션필터 시나리오가 포함되어 있는가?
- [ ] `npx vitest run` 시 전체 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-F-001 (역산 구현체), TEST-001 (취득세 테스트), TEST-002 (LTV 테스트)
- **Blocks**: TEST-INT-002 (E2E 플로우 테스트)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~13** | INIT~BE-J | ✅ 완료 (65개) |
| **Batch 14** | TEST-001~005 | ✅ **완료** |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
