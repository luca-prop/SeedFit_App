# TASK 상세 명세서 — Batch 06 (MOCK-004 ~ MOCK-006, LIB-001 ~ LIB-002)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 6 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 30/89

---

## Issue #26: MOCK-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-004: 초기 Seed 데이터 — LTV_Policy 3-Tier 기본값 삽입"
labels: 'data, seed, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-004] LTV_Policy 3-Tier 기본값 Seed 데이터 작성
- **목적**: 역산 알고리즘(BE-F-001)이 즉시 동작할 수 있도록, 정부 LTV 대출 정책 3개 Tier의 기본값을 삽입한다. Admin 패널 구현 전에도 역산 기능이 정상 동작하는 것을 보장하는 최소 필수 데이터이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-006: LTV 정책 파라미터 — 15억 이하→6억, 15~25억→4억, 25억 초과→2억
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.6`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed-data/ltv_policies.json` 파일 생성:
  ```json
  [
    {
      "tier_label": "15억 이하",
      "price_threshold_min": 0,
      "price_threshold_max": 1500000000,
      "max_loan_amount": 600000000,
      "effective_from": "2026-01-01T00:00:00Z"
    },
    {
      "tier_label": "15억~25억",
      "price_threshold_min": 1500000001,
      "price_threshold_max": 2500000000,
      "max_loan_amount": 400000000,
      "effective_from": "2026-01-01T00:00:00Z"
    },
    {
      "tier_label": "25억 초과",
      "price_threshold_min": 2500000001,
      "price_threshold_max": 99999999999,
      "max_loan_amount": 200000000,
      "effective_from": "2026-01-01T00:00:00Z"
    }
  ]
  ```
- [ ] Tier 간 가격 범위에 갭이나 겹침이 없는지 검증

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 3개 Tier 삽입 확인**
- **Given**: Seed 스크립트가 실행된 상태
- **When**: `prisma.lTV_Policy.findMany()`를 실행함
- **Then**: 3건이 반환되고, 각 `tier_label`이 '15억 이하', '15억~25억', '25억 초과'이다.

**Scenario 2: 12억 매물에 대한 Tier 매칭**
- **Given**: 3-Tier가 존재하는 상태
- **When**: 가격 1,200,000,000에 해당하는 Tier를 조회함
- **Then**: '15억 이하' Tier가 반환되고, `max_loan_amount`가 600,000,000이다.

**Scenario 3: Tier 범위 연속성**
- **Given**: 3-Tier 데이터를 확인함
- **When**: Tier 1의 max + 1 == Tier 2의 min을 검증함
- **Then**: 갭이나 겹침 없이 연속적이다.

### :gear: Technical & Non-Functional Constraints
- **CON-03**: 이 값들은 하드코딩이 아닌 DB Seed. Admin 패널(BE-I-001)에서 언제든 수정 가능
- **BigInt**: JSON 파일에서는 일반 number로 작성하되, Seed 스크립트에서 `BigInt()` 변환 필요

### :checkered_flag: Definition of Done (DoD)
- [ ] `ltv_policies.json`에 3개 Tier가 정의되어 있는가?
- [ ] Tier 간 가격 범위에 겹침이 없는가?
- [ ] 기본값이 REQ-FUNC-006 명세와 일치하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-006 (LTV_Policy 스키마)
- **Blocks**: MOCK-006 (Seed 스크립트), LIB-001 (ltv-policy.ts)

---

## Issue #27: MOCK-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-005: 초기 Seed 데이터 — B2B_Partner 테스트 중개사 2곳 + Listing 5건"
labels: 'data, seed, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-005] 테스트 B2B_Partner 및 Listing Seed 데이터 작성
- **목적**: B2B 매물 등록/조회 기능(BE-H-001~003) 및 Verified 뱃지 우선 정렬(REQ-FUNC-016) 테스트를 위한 초기 데이터를 생성한다. Verified 매물 2건 + 일반 매물 3건으로 혼합 구성하여 정렬 로직을 검증한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.3, #6.2.8`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ASM-04: MVP B2B 파트너 5곳 이내
- REQ-FUNC-016: Verified 매물 상단 우선 노출

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed-data/b2b_partners.json` 파일 생성:
  ```json
  [
    {
      "business_license_no": "123-45-67890",
      "partner_name": "장위부동산",
      "coverage_zones": ["성북구", "동대문구"],
      "role": "B2B"
    },
    {
      "business_license_no": "234-56-78901",
      "partner_name": "노량진공인",
      "coverage_zones": ["동작구"],
      "role": "B2B"
    }
  ]
  ```
- [ ] `prisma/seed-data/listings.json` 파일 생성:
  ```json
  [
    { "zone_ref": "장위4구역", "agent_ref": "장위부동산", "property_type": "TTUKKUNG", "asking_price": 450000000, "premium": 50000000, "rights_value": 200000000, "is_verified": true, "status": "ACTIVE" },
    { "zone_ref": "장위5구역", "agent_ref": "장위부동산", "property_type": "DASEDAE", "asking_price": 380000000, "premium": 30000000, "rights_value": 180000000, "is_verified": true, "status": "ACTIVE" },
    { "zone_ref": "노량진1구역", "agent_ref": "노량진공인", "property_type": "VILLA", "asking_price": 520000000, "premium": 70000000, "rights_value": 250000000, "is_verified": false, "status": "ACTIVE" },
    { "zone_ref": "장위4구역", "agent_ref": null, "property_type": "ETC", "asking_price": 400000000, "premium": 40000000, "rights_value": 190000000, "is_verified": false, "status": "ACTIVE" },
    { "zone_ref": "노량진1구역", "agent_ref": null, "property_type": "TTUKKUNG", "asking_price": 550000000, "premium": 80000000, "rights_value": 260000000, "is_verified": false, "status": "SOLD" }
  ]
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 파트너 2곳 생성**
- **Given**: Seed 실행 후
- **When**: `prisma.b2B_Partner.findMany()`를 실행함
- **Then**: 2건이 반환되고 각각 `is_active: true`이다.

**Scenario 2: Verified/일반 혼합 매물**
- **Given**: Seed 실행 후
- **When**: `prisma.listing.findMany()`를 실행함
- **Then**: 5건 중 `is_verified: true`가 2건, `false`가 3건이다.

**Scenario 3: Verified 우선 정렬 확인**
- **Given**: 5건의 Listing이 존재
- **When**: `orderBy: { is_verified: 'desc' }`로 조회함
- **Then**: 상위 2건의 `is_verified`가 `true`이다.

### :gear: Technical & Non-Functional Constraints
- **`zone_ref`, `agent_ref`**: JSON에서는 이름 참조, Seed 스크립트(MOCK-006)에서 실제 UUID로 변환
- **민감 필드**: 테스트 데이터에는 `owner_contact`, `unit_number` 포함하지 않음 (optional 필드)

### :checkered_flag: Definition of Done (DoD)
- [ ] `b2b_partners.json`에 2개 파트너가 정의되어 있는가?
- [ ] `listings.json`에 Verified 2건 + 일반 3건이 포함되어 있는가?
- [ ] 각 매물의 `zone_ref`가 MOCK-001 Zone에 매핑 가능한가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-008 (B2B_Partner), DB-003 (Listing), MOCK-001 (Zone 이름 참조)
- **Blocks**: MOCK-006 (Seed 스크립트)

---

## Issue #28: MOCK-006

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-006: Prisma Seed 스크립트 작성 — 전체 CSV/JSON → DB 일괄 적재 자동화"
labels: 'data, seed, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-006] Prisma Seed 스크립트(`prisma/seed.ts`) 작성
- **목적**: MOCK-001~005에서 준비한 모든 CSV/JSON Seed 데이터를 하나의 `npx prisma db seed` 명령으로 DB에 일괄 적재하는 자동화 스크립트를 작성한다. 개발자가 로컬 환경을 초기화하거나, Supabase 배포 DB를 초기 세팅할 때 사용한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS Rollout: [`07_SRS_v1.0.md#6.7.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) "Supabase 대시보드 CSV Import로 Seeding"
- 전체 Seed 데이터: MOCK-001(Zone 50건), MOCK-002(Curated 30건), MOCK-003(Bluechip 20건), MOCK-004(LTV 3건), MOCK-005(Partner 2건 + Listing 5건)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed.ts` 파일 생성
- [ ] `package.json`에 Prisma seed 설정 추가:
  ```json
  {
    "prisma": {
      "seed": "tsx prisma/seed.ts"
    }
  }
  ```
- [ ] `tsx` (또는 `ts-node`) 개발 의존성 설치
- [ ] Seed 스크립트 구조:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { parse } from 'csv-parse/sync';
  import fs from 'fs';
  
  const prisma = new PrismaClient();
  
  async function main() {
    console.log('🌱 Seeding database...');

    // 1. Admin User 생성 (LTV_Policy, Curated DB의 FK 참조용)
    const adminUser = await prisma.user.upsert({ ... });

    // 2. B2B Users + Partners 생성
    // 3. Zone CSV 파싱 → Zone 테이블 일괄 INSERT
    // 4. Curated_Actual_Price_DB CSV → INSERT
    // 5. Bluechip_Reference_Price CSV → INSERT (zone_id 매핑)
    // 6. LTV_Policy JSON → INSERT
    // 7. Listings JSON → INSERT (zone_id + agent_id 매핑)

    console.log('✅ Seeding completed!');
  }
  
  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
  ```
- [ ] CSV 파싱: `csv-parse` 패키지 사용 (동기 모드)
- [ ] 참조 키 변환 로직: `zone_ref`(이름) → 실제 `zone_id`(UUID) 룩업
- [ ] 멱등성(Idempotency): `upsert` 사용하여 중복 실행 시에도 에러 없이 동작
- [ ] 실행 순서: User → Zone → (Curated + Bluechip + LTV + Partner) → Listing (FK 의존성 순서)
- [ ] 실행 확인: `npx prisma db seed` 후 Prisma Studio에서 데이터 확인

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 전체 Seed 실행 성공**
- **Given**: 빈 로컬 SQLite DB가 존재하는 상태
- **When**: `npx prisma db seed`를 실행함
- **Then**: 에러 없이 완료되고, 콘솔에 '✅ Seeding completed!'가 출력된다.

**Scenario 2: 데이터 건수 검증**
- **Given**: Seed가 완료된 상태
- **When**: 각 테이블의 레코드 수를 확인함
- **Then**: Zone ≥ 50, Curated ≥ 30, Bluechip ≥ 20, LTV = 3, Partner = 2, Listing = 5, User ≥ 3 (Admin 1 + B2B 2)이다.

**Scenario 3: 멱등성 검증**
- **Given**: Seed가 1회 완료된 상태
- **When**: `npx prisma db seed`를 다시 실행함
- **Then**: 에러 없이 완료되고, 레코드 수가 동일하다 (중복 생성 없음).

**Scenario 4: FK 참조 무결성**
- **Given**: Seed가 완료된 상태
- **When**: Listing의 `zone_id`와 `agent_id`를 확인함
- **Then**: 모두 실제 존재하는 Zone과 User의 ID를 참조한다.

### :gear: Technical & Non-Functional Constraints
- **실행 순서**: FK 의존성에 따라 반드시 User → Zone → (나머지) → Listing 순서로 적재
- **csv-parse**: `csv-parse/sync` 모듈 사용 (스트리밍 불필요, 소량 데이터)
- **BigInt 변환**: CSV의 숫자 문자열을 `BigInt()` 또는 `Number()`로 적절히 변환
- **환경 무관성**: `DATABASE_URL`만 변경하면 SQLite/PostgreSQL 모두에서 동작

### :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/seed.ts`가 존재하고 `npx prisma db seed`로 실행 가능한가?
- [ ] 모든 6개 Seed 데이터(MOCK-001~005)가 적재되는가?
- [ ] 멱등성이 보장되는가 (2회 실행 시 에러 없음)?
- [ ] FK 참조 무결성이 유지되는가?
- [ ] package.json에 prisma.seed 설정이 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: MOCK-001~005 (모든 Seed 데이터 파일), DB-009 (전체 마이그레이션 완료)
- **Blocks**: BE-F-001 (역산 — 데이터 필요), BE-G-001 (대시보드 — 데이터 필요), TEST-005~007 (단위 테스트 — 데이터 필요)

---

## Issue #29: LIB-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Lib] LIB-001: lib/ltv-policy.ts — LTV 정책 조회 및 대출 가능액 산출 유틸"
labels: 'shared-lib, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [LIB-001] LTV 정책 조회 및 최대 대출 가능액 산출 유틸 구현
- **목적**: `lib/ltv-policy.ts`에 LTV_Policy 테이블에서 정책을 조회하고, 주어진 매물 가격에 대한 Tier별 최대 대출 가능액을 반환하는 공용 함수를 구현한다. 역산 알고리즘(BE-F-001)과 대시보드(BE-G-001) 모두에서 사용되는 **핵심 비즈니스 로직 유틸**이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 도메인 모듈: [`07_SRS_v1.0.md#6.9 LtvPolicyLib`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-006: LTV 대출 가능액 정책 기반 산출
- CON-03: 하드코딩 금지 → DB 조회
- C-TEC-008: 캐시 미사용 → DB 직접 조회

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/ltv-policy.ts` 파일 생성
- [ ] 함수 구현:
  ```typescript
  import { prisma } from '@/lib/prisma';

  /**
   * DB에서 전체 LTV 정책 Tier를 조회한다.
   * 캐시 없이 매번 DB 직접 조회 (C-TEC-008).
   */
  export async function getPolicies() {
    return prisma.lTV_Policy.findMany({
      orderBy: { price_threshold_min: 'asc' },
    });
  }

  /**
   * 주어진 매물 가격에 해당하는 Tier의 최대 대출 가능액을 반환한다.
   * @param price 매물 가격 (KRW)
   * @returns 최대 대출 가능액 (KRW). 매칭 Tier 없으면 0
   */
  export async function getMaxLoanAmount(price: number): Promise<number> {
    const policy = await prisma.lTV_Policy.findFirst({
      where: {
        price_threshold_min: { lte: BigInt(price) },
        price_threshold_max: { gte: BigInt(price) },
      },
    });
    return policy ? Number(policy.max_loan_amount) : 0;
  }
  ```
- [ ] BigInt ↔ number 변환 유틸 헬퍼 추가 (필요 시)
- [ ] JSDoc 주석 작성: 각 함수의 목적, 파라미터, 반환값, SRS 근거 명시

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 12억 매물 → Tier 1 매칭**
- **Given**: 3-Tier LTV 정책이 DB에 존재하는 상태 (MOCK-004 기준)
- **When**: `getMaxLoanAmount(1200000000)`를 호출함
- **Then**: 반환값이 `600000000` (6억)이다.

**Scenario 2: 20억 매물 → Tier 2 매칭**
- **Given**: 3-Tier 정책이 존재하는 상태
- **When**: `getMaxLoanAmount(2000000000)`를 호출함
- **Then**: 반환값이 `400000000` (4억)이다.

**Scenario 3: 30억 매물 → Tier 3 매칭**
- **Given**: 3-Tier 정책이 존재하는 상태
- **When**: `getMaxLoanAmount(3000000000)`를 호출함
- **Then**: 반환값이 `200000000` (2억)이다.

**Scenario 4: 정책 없는 경우 → 0 반환**
- **Given**: LTV_Policy 테이블이 비어있는 상태
- **When**: `getMaxLoanAmount(1200000000)`를 호출함
- **Then**: 반환값이 `0`이다.

**Scenario 5: getPolicies 정렬 확인**
- **Given**: 3-Tier 정책이 존재하는 상태
- **When**: `getPolicies()`를 호출함
- **Then**: `price_threshold_min` 오름차순으로 3건이 반환된다.

### :gear: Technical & Non-Functional Constraints
- **CON-03**: 함수 내부에 LTV 금액 하드코딩 절대 금지. 반드시 DB 조회
- **C-TEC-008**: Redis/KV 캐시 없음. 함수 호출 시마다 Prisma 쿼리 실행
- **BigInt 변환**: Prisma는 BigInt를 반환하지만, 비즈니스 로직에서는 `number`로 변환하여 사용. `Number()` 래핑 시 안전 정수 범위(2^53) 확인 필요 (한국 원화 기준 최대 9,007조 → 충분)

### :checkered_flag: Definition of Done (DoD)
- [ ] `src/lib/ltv-policy.ts`에 `getPolicies`, `getMaxLoanAmount` 함수가 구현되어 있는가?
- [ ] 함수 내부에 하드코딩된 금액이 없는가 (DB 조회만 사용)?
- [ ] Tier 경계값(15억, 25억)에서 올바른 Tier가 매칭되는가?
- [ ] 정책이 없을 때 안전하게 0을 반환하는가?
- [ ] JSDoc 주석이 작성되어 있는가?
- [ ] TEST-002 (LTV 단위 테스트)의 시나리오가 모두 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-006 (LTV_Policy 테이블), MOCK-004 (LTV Seed 데이터), INIT-001 (Prisma Client)
- **Blocks**: BE-F-001 (역산 알고리즘), BE-G-001 (대시보드 기축 매칭), TEST-002 (LTV 단위 테스트)

---

## Issue #30: LIB-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Lib] LIB-002: lib/tax-calculator.ts — 취득세 산출 로직 유틸"
labels: 'shared-lib, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [LIB-002] 취득세 산출 로직 유틸 구현
- **목적**: `lib/tax-calculator.ts`에 매물 가격과 유형(일반 아파트/재개발)에 따른 취득세를 산출하는 공용 함수를 구현한다. 역산 알고리즘(BE-F-001)에서 가용 현금으로부터 취득세를 역산하는 핵심 계산 모듈이며, 매물 교차검증(BE-H-001)에서도 실투자금 산출에 사용된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 도메인 모듈: [`07_SRS_v1.0.md#6.9 TaxCalcLib`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-002: 취득세를 고려한 역산 알고리즘
- REQ-FUNC-003: 실투자금 오차율 ±5% 이내
- CON-01: 역산 처리 위치 — Server Action에서 실행

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/tax-calculator.ts` 파일 생성
- [ ] 함수 구현:
  ```typescript
  /**
   * 취득세를 산출한다.
   * 
   * 취득세율 기준 (2026년 기준):
   * - 주택 취득세: 1~3% (금액 구간별 차등)
   *   - 6억 이하: 1%
   *   - 6억~9억: 2%
   *   - 9억 초과: 3%
   * - 재개발 조합원 입주권: 별도 세율 적용 가능
   * 
   * @param price 매물 가격 (KRW)
   * @param isRedevelopment 재개발 매물 여부
   * @returns 취득세 금액 (KRW)
   */
  export function calculateAcquisitionTax(
    price: number,
    isRedevelopment: boolean = false
  ): number {
    if (price <= 0) return 0;

    let taxRate: number;

    if (isRedevelopment) {
      // 재개발 조합원 입주권 취득세율 (간소화)
      taxRate = 0.011; // 1.1% (농어촌특별세 포함)
    } else {
      // 일반 주택 취득세율 (구간별 차등)
      if (price <= 600000000) {
        taxRate = 0.01; // 1%
      } else if (price <= 900000000) {
        taxRate = 0.02; // 2% (간소화, 실제는 구간별 산식)
      } else {
        taxRate = 0.03; // 3%
      }
    }

    // 취득세 + 지방교육세(0.1~0.3%) + 농어촌특별세(0.2%) 포함 간소화
    const totalTaxRate = taxRate + 0.003; // 대략적 부가세 포함
    return Math.round(price * totalTaxRate);
  }

  /**
   * 가용 현금에서 취득세를 역산하여, 실제 매물 매수에 사용 가능한 금액을 반환한다.
   * cash = 매물가 + 취득세 → 매물가 = cash / (1 + taxRate)
   * 
   * @param cash 가용 현금 (KRW)
   * @param isRedevelopment 재개발 매물 여부
   * @returns 취득세 제외 후 실매수 가능 금액 (KRW)
   */
  export function reverseCalculateFromCash(
    cash: number,
    isRedevelopment: boolean = false
  ): number {
    if (cash <= 0) return 0;
    // 근사 역산: 반복 수렴 방식
    let estimatedPrice = cash;
    for (let i = 0; i < 5; i++) {
      const tax = calculateAcquisitionTax(estimatedPrice, isRedevelopment);
      estimatedPrice = cash - tax;
    }
    return Math.round(estimatedPrice);
  }
  ```
- [ ] JSDoc 주석: 세율 근거, 간소화 사유, SRS 참조 명시
- [ ] **⚠️ 세율 변동 대응 주석**: "실제 세율은 정부 정책에 따라 변동 가능. Phase 2에서 Admin 패널 파라미터화 검토"

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 6억 이하 일반 아파트 취득세**
- **Given**: `price: 500000000` (5억), `isRedevelopment: false`
- **When**: `calculateAcquisitionTax(500000000, false)`를 호출함
- **Then**: 반환값이 약 `6,500,000` (5억 × 1.3%)이다.

**Scenario 2: 9억 초과 일반 아파트 취득세**
- **Given**: `price: 1200000000` (12억), `isRedevelopment: false`
- **When**: `calculateAcquisitionTax(1200000000, false)`를 호출함
- **Then**: 반환값이 약 `39,600,000` (12억 × 3.3%)이다.

**Scenario 3: 재개발 매물 취득세**
- **Given**: `price: 450000000` (4.5억), `isRedevelopment: true`
- **When**: `calculateAcquisitionTax(450000000, true)`를 호출함
- **Then**: 반환값이 약 `6,300,000` (4.5억 × 1.4%)이다.

**Scenario 4: 역산 — 가용 현금 3억에서 실매수 가능 금액**
- **Given**: `cash: 300000000` (3억)
- **When**: `reverseCalculateFromCash(300000000, true)`를 호출함
- **Then**: 반환값이 약 `295,800,000` (취득세 제외 후)이고, 역으로 해당 금액에 취득세를 더하면 3억에 근접한다.

**Scenario 5: 경계값 — 0원 입력**
- **Given**: `price: 0`
- **When**: `calculateAcquisitionTax(0)`를 호출함
- **Then**: 반환값이 `0`이다.

**Scenario 6: 경계값 — 음수 입력**
- **Given**: `price: -100`
- **When**: `calculateAcquisitionTax(-100)`를 호출함
- **Then**: 반환값이 `0`이다.

### :gear: Technical & Non-Functional Constraints
- **CON-01**: 이 로직은 Server Action에서만 실행. 클라이언트에서 직접 호출하지 않음
- **REQ-FUNC-003**: 실투자금 오차율 ±5% 이내 충족을 위해, 간소화된 세율이 실제 세율과 5% 이내 차이를 유지해야 함
- **순수 함수**: DB 조회 없이 입력값만으로 계산하는 순수 함수. 테스트 용이성 극대화
- **Phase 2**: 세율 변동 시 Admin 패널에서 파라미터화할 수 있도록, 세율 상수를 함수 상단에 명확히 분리

### :checkered_flag: Definition of Done (DoD)
- [ ] `src/lib/tax-calculator.ts`에 `calculateAcquisitionTax`, `reverseCalculateFromCash` 함수가 구현되어 있는가?
- [ ] 일반 아파트(3구간) 및 재개발 매물 세율이 구현되어 있는가?
- [ ] 경계값(0, 음수, 6억, 9억)에서 예상대로 동작하는가?
- [ ] 역산 함수의 오차가 ±5% 이내인가?
- [ ] JSDoc 주석이 세율 근거와 SRS 참조를 포함하는가?
- [ ] TEST-001 (취득세 단위 테스트)의 시나리오가 모두 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (TypeScript 환경)
- **Blocks**: BE-F-001 (역산 알고리즘), BE-H-001 (매물 교차검증 — 실투자금 산출), TEST-001 (취득세 단위 테스트)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001~004, DB-001 | ✅ 완료 |
| **Batch 02** | DB-002~006 | ✅ 완료 |
| **Batch 03** | DB-007~010, API-SPEC-001 | ✅ 완료 |
| **Batch 04** | API-SPEC-002~006 | ✅ 완료 |
| **Batch 05** | API-SPEC-007~008, MOCK-001~003 | ✅ 완료 |
| **Batch 06** | MOCK-004~006, LIB-001~002 | ✅ **완료** |
| Batch 07 | LIB-003~005, FE-F-001~002 | ⬜ 대기 |
| Batch 08 | FE-F-003~005, BE-F-001~002 | ⬜ 대기 |
| Batch 09 | FE-G-001~005 | ⬜ 대기 |
| Batch 10 | BE-G-001~002, FE-H-001~003 | ⬜ 대기 |
| Batch 11 | FE-H-004~005, BE-H-001~003 | ⬜ 대기 |
| Batch 12 | BE-H-004, FE-I-001~004 | ⬜ 대기 |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
