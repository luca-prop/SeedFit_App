# TASK 상세 명세서 — Batch 10 (BE-G-001 ~ BE-G-002, FE-H-001 ~ FE-H-003)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 10 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 50/89

---

## Issue #46: BE-G-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-G-001: comparison Server Action — generateDashboard() 구현"
labels: 'backend, feature, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-G-001] 1:1 대조 대시보드 데이터 생성 Server Action
- **목적**: 특정 재개발 구역에 대해 (1) LTV 정책 기반 최대 매수 금액 산출 → (2) Curated DB에서 동일 행정구·금액대별 기축 아파트 3개+ 매칭 → (3) `WHERE district = zone.district` 텍스트 매칭으로 Bluechip Reference 조회 → (4) 동일 행정구 부재 시 인접 행정구 확장 → (5) 전고점 회복률 산출 → (6) `district_expanded` 플래그 반환. **DB Read Only**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) ⚠️ **필수 정독**
- REQ-FUNC-008: 기축 아파트 3개 이상 자동 추천
- REQ-FUNC-009: 신축 대장 단지 미래 가치 산정
- REQ-FUNC-010: 전고점 대비 회복률(%)
- REQ-FUNC-012: 인접 행정구 확장 매칭 + `district_expanded` 플래그
- API-SPEC-003: `DashboardInput` / `DashboardOutput` DTO
- LIB-001: `getMaxLoanAmount(price)` — LTV 대출 가능액
- Spec-Down ②: PostGIS 제거 → `district` 텍스트 매칭

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/comparison.ts` 파일 생성 (`'use server'`)
- [ ] **인접 행정구 매핑 상수** 정의:
  ```typescript
  const ADJACENT_DISTRICTS: Record<string, string[]> = {
    '성북구': ['동대문구', '강북구', '종로구'],
    '동작구': ['관악구', '서초구', '영등포구'],
    '도봉구': ['노원구', '강북구'],
    '용산구': ['중구', '마포구', '서초구', '성동구'],
    // ... 25개 구 전체 매핑
  };
  ```
- [ ] `generateDashboard()` 핵심 로직:
  ```typescript
  export async function generateDashboard(input: DashboardInput): Promise<DashboardOutput> {
    // Step 1: Zone 조회
    const zone = await prisma.zone.findUniqueOrThrow({
      where: { zone_id: input.zone_id },
    });

    // Step 2: LTV 최대 매수 금액 산출
    const maxLoan = await getMaxLoanAmount(Number(zone.avg_rights_value) || 0);
    const maxBuyablePrice = input.cash + maxLoan;

    // Step 3: Curated DB에서 동일 행정구·예산 범위 내 기축 아파트 조회
    let existingApts = await prisma.curated_Actual_Price_DB.findMany({
      where: {
        district: zone.district,
        latest_actual_price: { lte: BigInt(maxBuyablePrice) },
      },
      orderBy: { latest_actual_price: 'desc' },
      take: 5,
    });

    // Step 4: Bluechip Reference 동일 행정구 조회
    let bluechipRefs = await prisma.bluechip_Reference_Price.findMany({
      where: { district: zone.district },
      take: 1,
    });

    // Step 5: 동일 행정구 부재 시 인접 확장
    let districtExpanded = false;
    if (existingApts.length < 3 || bluechipRefs.length === 0) {
      const adjacentDistricts = ADJACENT_DISTRICTS[zone.district] || [];
      if (adjacentDistricts.length > 0) {
        const expandedApts = await prisma.curated_Actual_Price_DB.findMany({
          where: {
            district: { in: adjacentDistricts },
            latest_actual_price: { lte: BigInt(maxBuyablePrice) },
          },
          take: 5 - existingApts.length,
        });
        existingApts = [...existingApts, ...expandedApts];

        if (bluechipRefs.length === 0) {
          bluechipRefs = await prisma.bluechip_Reference_Price.findMany({
            where: { district: { in: adjacentDistricts } },
            take: 1,
          });
        }
        districtExpanded = true;
      }
    }

    // Step 6: 회복률 산출 + LTV 적용 실투자금 산출
    const mappedApts = existingApts.map(apt => {
      const price = Number(apt.latest_actual_price);
      const loan = getMaxLoanFromCache(price); // 캐시된 정책 사용
      const tax = calculateAcquisitionTax(price, false);
      return {
        curated_id: apt.curated_id,
        apartment_name: apt.apartment_name,
        district: apt.district,
        latest_actual_price: price,
        peak_price_2122: apt.peak_price_2122 ? Number(apt.peak_price_2122) : null,
        recovery_rate: apt.recovery_rate ? Number(apt.recovery_rate) : null,
        area_sqm: Number(apt.area_sqm),
        ltv_amount: loan,
        total_required: price - loan + tax,
      };
    });

    // Step 7: 결과 구성
    return {
      redevelopment: { /* zone 정보 + bluechip 미래 가치 */ },
      existing_apartments: mappedApts,
      district_expanded: districtExpanded,
      disclaimer: '본 데이터는 국토부 실거래가 및 동일 행정구 기준이며, 현장 호가와 다를 수 있습니다.',
    };
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 동일 행정구 기축 3개+ 반환**
- **Given**: '성북구'에 Curated 아파트 5건이 존재하는 상태
- **When**: `generateDashboard({ zone_id: 장위뉴타운ID, cash: 300000000 })`를 실행함
- **Then**: `existing_apartments` 배열에 3건 이상이 반환되고, `district_expanded === false`이다.

**Scenario 2: 동일 행정구 부재 → 인접 확장**
- **Given**: '도봉구'에 Curated 아파트가 0건이고, 인접 '노원구'에 3건 존재하는 상태
- **When**: '도봉구' Zone에 대해 대시보드를 생성함
- **Then**: `existing_apartments`에 '노원구' 아파트가 포함되고, `district_expanded === true`이다.

**Scenario 3: 회복률 산출 정확도**
- **Given**: 기축 아파트의 `latest: 9억`, `peak_2122: 11억`인 상태
- **When**: `recovery_rate`를 확인함
- **Then**: `81.82`(%)이다.

**Scenario 4: Bluechip 미래 가치 반환**
- **Given**: 동일 행정구에 Bluechip Reference가 존재하는 상태
- **When**: `redevelopment.potential_price`를 확인함
- **Then**: Bluechip 실거래가 기반의 잠재 미래 가치가 반환된다.

**Scenario 5: 예산 범위 필터링**
- **Given**: 가용 현금 3억 + LTV 대출 6억 = 최대 9억
- **When**: 기축 아파트를 조회함
- **Then**: `latest_actual_price ≤ 9억`인 아파트만 반환된다.

### :gear: Technical & Non-Functional Constraints
- **Spec-Down ②**: `WHERE district = ?` 텍스트 일치만 사용. PostGIS `ST_DWithin` 금지
- **인접 행정구**: 하드코딩 `ADJACENT_DISTRICTS` 매핑 사용. Phase 2에서 별도 DB 테이블로 이전 검토
- **DB Read Only**: INSERT/UPDATE/DELETE 금지. 조회 전용 Server Action
- **N+1 방지**: LTV 정책을 함수 진입 시 1회 조회 후 메모리 캐시

### :checkered_flag: Definition of Done (DoD)
- [ ] `generateDashboard()`가 구현되고 DashboardOutput을 반환하는가?
- [ ] 동일 행정구에서 기축 3개+ 매칭되는가?
- [ ] 동일 행정구 부재 시 인접 확장 + `district_expanded === true` 반환하는가?
- [ ] 회복률이 정확히 산출되는가?
- [ ] Bluechip 기반 미래 가치가 반환되는가?
- [ ] TEST-006 (Dashboard 단위 테스트)이 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-001 (LTV), LIB-002 (취득세), DB-004 (Curated), DB-005 (Bluechip), API-SPEC-003 (DTO), MOCK-002+003 (Seed)
- **Blocks**: FE-G-001 (대시보드 UI), TEST-006 (단위 테스트), TEST-INT-002 (E2E)

---

## Issue #47: BE-G-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-G-002: comparison Server Action — generateReport() 심층 리포트 구현"
labels: 'backend, feature, b2c, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-G-002] 심층 분석 리포트 생성 Server Action
- **목적**: 재개발 투자 vs 기축 매수의 4개 비교 섹션(투자 구조·주거 비용·현금 흐름·미래 가치)을 연산하여 반환한다. **DB Read Only, 연산 집중** 작업이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-011: 리포트 0.5초 이내 렌더링
- API-SPEC-003: `ReportInput` / `ReportOutput` DTO
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/comparison.ts`에 `generateReport()` 함수 추가
- [ ] **섹션 1: 투자 구조 (investment_structure)** 산출:
  ```typescript
  // 재개발
  const redevInvestment = {
    rights_value: zone.avg_rights_value,         // 권리가액
    additional_burden: estimatedBurden,           // 추가분담금 추정
    acquisition_tax: calculateAcquisitionTax(total, true),
    total: rights + burden + tax,
  };
  // 기축 (각 apt별)
  const existingInvestment = apts.map(apt => ({
    purchase_price: apt.latest_actual_price,
    acquisition_tax: calculateAcquisitionTax(apt.latest_actual_price, false),
    brokerage_fee: Math.round(apt.latest_actual_price * 0.004), // 0.4%
    total: price + tax + fee,
  }));
  ```
- [ ] **섹션 2: 주거 비용 (housing_cost)** 산출:
  - 재개발: 이주비(대출 이자), 공사 기간 임대료(월 예상), 조합 분담금
  - 기축: 관리비(월), 수선 유지비(연), 전세 레버리지 가능 금액
- [ ] **섹션 3: 현금 흐름 (cash_flow)** 시뮬레이션:
  - 3년/5년/10년 시점의 총 투입 비용 vs 예상 자산 가치
  - 연 수익률(IRR) 간소화 추정
- [ ] **섹션 4: 미래 가치 (future_value)** 비교:
  - 재개발: 준공 후 예상 시세 (Bluechip × 비례율 보정)
  - 기축: 연 2~3% 자연 증가 추정 (간소화)
- [ ] `generated_at` ISO 8601 타임스탬프 포함

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 4개 섹션 데이터 반환**
- **Given**: zone_id, apt_ids, cash가 유효한 상태
- **When**: `generateReport(input)`를 실행함
- **Then**: `report` 객체에 `investment_structure`, `housing_cost`, `cash_flow`, `future_value` 4개 키가 모두 존재한다.

**Scenario 2: 투자 구조 정확성**
- **Given**: 권리가액 2억, 추가분담금 1억인 재개발 구역
- **When**: 투자 구조 섹션을 확인함
- **Then**: 재개발 총 투자금 = 2억 + 1억 + 취득세이다.

**Scenario 3: 응답 시간 < 500ms**
- **Given**: 정상 Seed 데이터가 존재하는 상태
- **When**: `generateReport()`를 실행함
- **Then**: 응답 시간이 500ms 미만이다.

**Scenario 4: generated_at 포함**
- **Given**: 리포트가 생성된 상태
- **When**: `generated_at` 필드를 확인함
- **Then**: ISO 8601 형식의 현재 시간이 포함되어 있다.

### :gear: Technical & Non-Functional Constraints
- **연산 집중**: DB 조회는 최소화하고, 받아온 데이터 기반 수학 연산이 주를 이룸
- **REQ-FUNC-011**: 500ms 이내. DB 쿼리를 `Promise.all`로 병렬 실행
- **간소화**: 현금 흐름, 미래 가치 모델은 MVP 수준에서 간소화. Phase 2에서 정교화

### :checkered_flag: Definition of Done (DoD)
- [ ] `generateReport()`가 4개 섹션 데이터를 반환하는가?
- [ ] 투자 구조 산출이 취득세, 수수료를 포함하는가?
- [ ] 응답 시간이 500ms 미만인가?
- [ ] `generated_at`이 포함되어 있는가?
- [ ] TEST-007 (Report 단위 테스트)이 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-G-001 (Dashboard — 데이터 기반 공유), LIB-001 (LTV), LIB-002 (취득세), API-SPEC-003 (ReportOutput DTO)
- **Blocks**: FE-G-005 (리포트 UI), TEST-007 (단위 테스트)

---

## Issue #48: FE-H-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-H-001: B2B 매물 등록 폼 (Zod 클라이언트 검증)"
labels: 'frontend, ui, b2b, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-H-001] B2B 매물 등록 폼 UI
- **목적**: B2B 중개사가 재개발 매물 정보를 입력하는 폼을 구현한다. shadcn/ui Form + Zod 클라이언트 검증을 적용하여, 서버 전송 전에 기본적인 입력 오류를 사전 차단한다. PasscodeGuard(LIB-003) 통과 후에만 접근 가능하다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-015: Verified 뱃지 교차검증 1초 이내
- API-SPEC-002: `CreateListingRequest` DTO + Zod 스키마
- B2B 시퀀스: [`07_SRS_v1.0.md#6.3.3`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- DB-002: Zone 테이블 (구역 선택 드롭다운)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2b)/listing/new/page.tsx` Server Component: PasscodeGuard 래핑 확인
- [ ] `src/app/(b2b)/_components/listing-form.tsx` Client Component:
  ```typescript
  'use client';
  import { useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { createListingSchema } from '@/schemas/listing';
  // 폼 필드:
  // 1. zone_id: Select 드롭다운 (Zone 목록 조회)
  // 2. property_type: Select (뚜껑/다세대/빌라/기타)
  // 3. asking_price: Input (원화 포맷팅)
  // 4. premium: Input (원화 포맷팅)
  // 5. rights_value: Input (원화 포맷팅)
  // 6. owner_contact: Input (연락처, optional)
  // 7. unit_number: Input (동호수, optional)
  ```
- [ ] shadcn/ui 추가: `npx shadcn@latest add form select label`
- [ ] `react-hook-form` + `@hookform/resolvers` 설치
- [ ] Zone 목록 드롭다운: Server Action으로 Zone 리스트 조회 → Select 옵션 생성
- [ ] 원화 포맷팅: FE-F-001과 동일한 실시간 쉼표 포맷팅 재사용
- [ ] 폼 제출: `/api/v1/b2b/listing` POST 호출 → 성공 시 확인 메시지, 실패 시 에러 표시

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 폼 정상 표시**
- **Given**: B2B 패스코드 인증을 통과한 상태
- **When**: `/(b2b)/listing/new` 페이지에 접속함
- **Then**: 7개 입력 필드(zone_id, property_type, asking_price, premium, rights_value, owner_contact, unit_number)가 표시된다.

**Scenario 2: Zod 클라이언트 검증 — 필수 필드 누락**
- **Given**: `asking_price`를 비운 채로
- **When**: 제출 버튼을 클릭함
- **Then**: 클라이언트에서 "이 필드는 필수입니다" 에러가 즉시 표시되고, 서버 요청은 전송되지 않는다.

**Scenario 3: property_type Select 값**
- **Given**: property_type 드롭다운을 클릭함
- **When**: 옵션을 확인함
- **Then**: '뚜껑', '다세대', '빌라', '기타' 4개 옵션이 한글로 표시된다.

**Scenario 4: 성공적 제출**
- **Given**: 모든 필수 필드가 올바르게 입력된 상태
- **When**: 제출 버튼을 클릭함
- **Then**: 서버에 POST 요청이 전송되고, 응답에 따라 성공/실패 메시지가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **이중 검증**: Zod 클라이언트 검증(1차) + 서버 Zod 검증(2차, BE-H-001). 클라이언트 검증은 UX용, 서버 검증이 실제 보안 경계
- **react-hook-form**: `zodResolver`로 Zod 스키마와 직접 연동
- **PropertyType 한글 매핑**: `{ TTUKKUNG: '뚜껑', DASEDAE: '다세대', VILLA: '빌라', ETC: '기타' }`

### :checkered_flag: Definition of Done (DoD)
- [ ] 7개 입력 필드가 렌더링되는가?
- [ ] Zod 클라이언트 검증이 동작하는가?
- [ ] Zone 드롭다운이 DB 데이터로 채워지는가?
- [ ] PropertyType이 한글 라벨로 표시되는가?
- [ ] 원화 포맷팅이 적용되는가?
- [ ] 제출 시 API에 올바른 데이터가 전송되는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-002 (B2B Route Group), LIB-003 (PasscodeGuard), API-SPEC-002 (DTO + Zod)
- **Blocks**: FE-H-002 (에러 상태 렌더링), FE-H-003 (패스코드 불일치 UI), TEST-INT-001 (B2B E2E)

---

## Issue #49: FE-H-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-H-002: 매물 등록 에러 상태 — 호가 이상치 에러 메시지"
labels: 'frontend, ui, b2b, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-H-002] 매물 등록 호가 이상치 에러 메시지 렌더링
- **목적**: BE-H-001의 교차검증(±30% 이상치) 결과 서버가 `400 PRICE_ANOMALY` 에러를 반환한 경우, `asking_price` 입력 필드 하단에 붉은색 에러 메시지("정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.")를 표시한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-018: ±30% 이상치 호가 차단
- API-SPEC-002: `LISTING_ERRORS.PRICE_ANOMALY` (status: 400)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `listing-form.tsx`에 서버 에러 처리 로직 추가:
  ```typescript
  // 폼 제출 후 서버 응답 처리
  async function onSubmit(data: CreateListingRequest) {
    const response = await fetch('/api/v1/b2b/listing', { method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) {
      const error = await response.json();
      if (error.code === 'PRICE_ANOMALY') {
        form.setError('asking_price', {
          type: 'server',
          message: '정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.',
        });
      } else if (error.code === 'VALIDATION_ERROR') {
        // 개별 필드 에러 매핑
      }
      return;
    }
    // 성공 처리
  }
  ```
- [ ] 에러 메시지 스타일: `text-destructive` (shadcn/ui 빨간색 계열)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 이상치 호가 → 에러 표시**
- **Given**: 주변 시세 3억인 구역에 호가 5억(+67% 이상치)을 입력함
- **When**: 제출 후 서버가 `400 PRICE_ANOMALY`를 반환함
- **Then**: `asking_price` 필드 하단에 붉은색 "정상 범위를 벗어난 호가입니다" 메시지가 표시된다.

**Scenario 2: 정상 호가 → 에러 미표시**
- **Given**: 주변 시세 3억인 구역에 호가 3.5억(+17%, 정상 범위)을 입력함
- **When**: 제출 후 서버가 `201 Created`를 반환함
- **Then**: 에러 메시지가 표시되지 않고 성공 처리된다.

### :gear: Technical & Non-Functional Constraints
- **react-hook-form**: `form.setError('fieldName', ...)` API로 서버 에러를 폼 필드에 매핑
- **에러 코드 기반 분기**: `error.code` 문자열로 에러 유형 구분

### :checkered_flag: Definition of Done (DoD)
- [ ] `PRICE_ANOMALY` 서버 에러 시 `asking_price` 필드에 에러가 표시되는가?
- [ ] 에러 메시지가 붉은색(destructive variant)인가?
- [ ] 정상 응답 시 에러가 표시되지 않는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-H-001 (매물 등록 폼), API-SPEC-002 (에러 코드)
- **Blocks**: TEST-INT-001 (B2B E2E)

---

## Issue #50: FE-H-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-H-003: 패스코드 불일치 시 폼 Disabled + 안내 메시지"
labels: 'frontend, ui, b2b, security, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-H-003] 패스코드 불일치 시 매물 등록 폼 Disabled + 안내
- **목적**: LIB-003(PasscodeGuard)에서 패스코드 인증 실패 시, 매물 등록 폼이 아예 접근 불가(`children` 미렌더링)하는 것이 기본이지만, **추가적으로 서버에서 패스코드 불일치(401)가 반환된 경우**에도 폼 전체를 Disabled 처리하고 안내 메시지를 표시한다. 이중 방어 로직이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-019: 패스코드 불일치 시 폼 Disabled + 안내
- API-SPEC-002: `LISTING_ERRORS.PASSCODE_MISMATCH` (status: 401)
- LIB-003: PasscodeGuard (1차 방어)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `listing-form.tsx`에 서버 401 에러 처리 추가:
  ```typescript
  if (error.code === 'PASSCODE_MISMATCH') {
    setFormDisabled(true);
    setGlobalError('유효하지 않은 접근 코드입니다. 관리자에게 문의하세요');
  }
  ```
- [ ] 폼 Disabled 상태: 모든 Input, Select, Button에 `disabled` 속성 적용
- [ ] 전역 에러 Alert: 폼 상단에 `variant="destructive"` Alert 렌더링
- [ ] Disabled 후 재활성화 불가 (페이지 새로고침으로만 재시도)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 서버 패스코드 불일치 → 폼 Disabled**
- **Given**: 유효하지 않은 passcode로 매물 등록을 시도함
- **When**: 서버가 `401 PASSCODE_MISMATCH`를 반환함
- **Then**: 폼 전체가 Disabled되고, "유효하지 않은 접근 코드입니다" Alert가 상단에 표시된다.

**Scenario 2: Disabled 후 재활성화 불가**
- **Given**: 폼이 Disabled된 상태
- **When**: 다른 필드를 클릭함
- **Then**: 모든 입력이 불가능하다. 페이지 새로고침으로만 재시도 가능하다.

### :gear: Technical & Non-Functional Constraints
- **이중 방어**: PasscodeGuard(LIB-003)가 1차 방어. 이 컴포넌트는 2차 방어(서버 응답 기반)
- **무차별 대입 방지**: Disabled 후 페이지 새로고침 필요. 연속 시도 차단

### :checkered_flag: Definition of Done (DoD)
- [ ] 서버 401 응답 시 폼 전체가 Disabled되는가?
- [ ] 안내 메시지가 Alert 컴포넌트로 표시되는가?
- [ ] Disabled 상태에서 어떤 입력도 불가능한가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-H-001 (매물 등록 폼), LIB-003 (PasscodeGuard), API-SPEC-002 (에러 코드)
- **Blocks**: TEST-INT-001 (B2B E2E — 패스코드 불일치 시나리오)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~09** | INIT~FE-G | ✅ 완료 (45개) |
| **Batch 10** | BE-G-001~002, FE-H-001~003 | ✅ **완료** |
| Batch 11 | FE-H-004~005, BE-H-001~003 | ⬜ 대기 |
| Batch 12 | BE-H-004, FE-I-001~004 | ⬜ 대기 |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
