# TASK 상세 명세서 — Batch 04 (API-SPEC-002 ~ API-SPEC-006)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 4 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 20/89

---

## Issue #16: API-SPEC-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-002: B2B 매물 등록/수정 Route Handler DTO, Zod 스키마 및 에러 코드 정의"
labels: 'api-contract, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-002] B2B 매물 등록/수정 API 통신 계약 정의
- **목적**: `/api/v1/b2b/listing` (POST/PUT) Route Handler의 요청·응답 데이터 구조와 에러 코드를 엄밀하게 정의한다. **패스코드 검증(401)**, **교차검증 이상치 차단(400)** 등 핵심 비즈니스 에러를 사전 정의하여, 프론트엔드(FE-H-001~003)와 백엔드(BE-H-001~002)가 동시에 독립 개발할 수 있도록 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-02`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- B2B 매물 등록 시퀀스: [`07_SRS_v1.0.md#3.6.3, #6.3.3`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-015: Verified 뱃지 교차검증 1초 이내
- REQ-FUNC-018: ±30% 이상치 차단
- REQ-FUNC-019: 패스코드 불일치 시 폼 Disabled

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/listing.ts` 파일 생성
- [ ] POST Request DTO:
  ```typescript
  export interface CreateListingRequest {
    zone_id: string;
    property_type: 'TTUKKUNG' | 'DASEDAE' | 'VILLA' | 'ETC';
    asking_price: number;
    premium: number;
    rights_value: number;
    owner_contact?: string;
    unit_number?: string;
    passcode: string; // SECRET_B2B 검증용
  }
  ```
- [ ] PUT Request DTO:
  ```typescript
  export interface UpdateListingRequest {
    asking_price?: number;
    premium?: number;
    status?: 'ACTIVE' | 'SOLD' | 'WITHDRAWN';
    passcode: string;
  }
  ```
- [ ] Response DTO:
  ```typescript
  export interface ListingResponse {
    listing_id: string;
    is_verified: boolean;
    created_at: string; // ISO 8601
    updated_at?: string;
  }
  ```
- [ ] `src/schemas/listing.ts` Zod 스키마 정의:
  ```typescript
  export const createListingSchema = z.object({
    zone_id: z.string().uuid(),
    property_type: z.enum(['TTUKKUNG', 'DASEDAE', 'VILLA', 'ETC']),
    asking_price: z.number().positive().int(),
    premium: z.number().int().min(0),
    rights_value: z.number().positive().int(),
    owner_contact: z.string().max(200).optional(),
    unit_number: z.string().max(50).optional(),
    passcode: z.string().min(1, '패스코드를 입력해 주세요'),
  });
  ```
- [ ] 에러 코드 상수 정의:
  ```typescript
  export const LISTING_ERRORS = {
    PASSCODE_MISMATCH: { status: 401, code: 'PASSCODE_MISMATCH', message: '유효하지 않은 접근 코드입니다. 관리자에게 문의하세요' },
    PRICE_ANOMALY: { status: 400, code: 'PRICE_ANOMALY', message: '정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.' },
    ZONE_NOT_FOUND: { status: 404, code: 'ZONE_NOT_FOUND', message: '해당 구역을 찾을 수 없습니다.' },
    VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR', message: '입력 데이터가 올바르지 않습니다.' },
  } as const;
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: POST 유효 입력 검증 통과**
- **Given**: 모든 필수 필드가 올바르게 채워진 CreateListingRequest가 주어짐
- **When**: `createListingSchema.parse(input)`를 실행함
- **Then**: 에러 없이 파싱되고, `property_type`이 ENUM 범위 내이다.

**Scenario 2: 패스코드 누락 시 검증 실패**
- **Given**: `passcode` 필드가 빈 문자열인 입력이 주어짐
- **When**: `createListingSchema.parse(input)`를 실행함
- **Then**: ZodError가 throw되고 '패스코드를 입력해 주세요' 메시지가 포함된다.

**Scenario 3: 에러 코드 체계 검증**
- **Given**: LISTING_ERRORS 상수가 정의된 상태
- **When**: `LISTING_ERRORS.PASSCODE_MISMATCH`를 참조함
- **Then**: `{ status: 401, code: 'PASSCODE_MISMATCH', message: '...' }` 구조이다.

**Scenario 4: PUT 부분 업데이트 입력**
- **Given**: `{ asking_price: 600000000, passcode: 'valid' }`만 주어짐
- **When**: updateListingSchema를 검증함
- **Then**: `premium`, `status`는 optional이므로 검증 통과한다.

### :gear: Technical & Non-Functional Constraints
- **패스코드**: Request body에 포함. Header(`Authorization`)가 아닌 body 필드로 전달 (MVP 단순화)
- **BigInt 변환**: 클라이언트→서버 전송 시 `number` 타입, 서버 내부 Prisma 쿼리에서 `BigInt` 변환
- **에러 응답 일관성**: 모든 에러는 `{ code: string, message: string }` 구조로 통일

### :checkered_flag: Definition of Done (DoD)
- [ ] POST/PUT Request DTO, Response DTO가 정의되어 있는가?
- [ ] Zod 스키마(createListingSchema, updateListingSchema)가 정의되어 있는가?
- [ ] 4개 에러 코드(401, 400×2, 404)가 상수로 정의되어 있는가?
- [ ] 유효/비유효 입력에 대한 검증이 정상 동작하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-H-001 (POST 구현), BE-H-002 (PUT 구현), FE-H-001 (등록 폼), FE-H-002 (에러 렌더링), TEST-INT-001 (E2E 테스트)

---

## Issue #17: API-SPEC-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-003: comparison Server Action (Dashboard + Report) DTO 및 Zod 스키마 정의"
labels: 'api-contract, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-003] 1:1 대조 대시보드 + 심층 리포트 Server Action 통신 계약 정의
- **목적**: `app/actions/comparison.ts`(API-03/04)의 `generateDashboard()`와 `generateReport()` 두 함수의 입출력 DTO를 정의한다. 특히 Output에 **`district_expanded` 플래그**(인접 행정구 확장 여부)와 **`recovery_rate` 회복률 데이터**를 포함하여, 프론트엔드가 조건부 UI(툴팁, 회복률 배지)를 구현할 수 있도록 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-03, API-04`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#3.6.2, #6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-008~012: 대시보드 기능 요구사항
- REQ-FUNC-011: 리포트 0.5초 이내 렌더링

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/comparison.ts` 파일 생성
- [ ] Dashboard Input DTO:
  ```typescript
  export interface DashboardInput {
    zone_id: string;
    cash: number;
    custom_apt_ids?: string[]; // 비교군 커스텀 편집 시
  }
  ```
- [ ] Dashboard Output DTO:
  ```typescript
  export interface DashboardOutput {
    redevelopment: {
      zone_id: string;
      zone_name: string;
      district: string;
      stage: string;
      estimated_ratio: number;
      avg_rights_value: number;
      potential_price: number; // Bluechip 기반 미래 가치
      bluechip_ref: BluechipRefData;
    };
    existing_apartments: ExistingApartment[];
    district_expanded: boolean; // 인접 행정구로 확장됐는지 여부
    disclaimer: string; // 면책 조항 텍스트
  }

  export interface ExistingApartment {
    curated_id: string;
    apartment_name: string;
    district: string;
    latest_actual_price: number;
    peak_price_2122: number | null;
    recovery_rate: number | null; // 전고점 대비 회복률 %
    area_sqm: number;
    ltv_amount: number; // 해당 아파트에 적용되는 LTV 대출 가능액
    total_required: number; // 실투자금 (price - ltv_amount + tax)
  }

  export interface BluechipRefData {
    apartment_name: string;
    district: string;
    actual_price: number;
    area_sqm: number;
  }
  ```
- [ ] Report Input/Output DTO:
  ```typescript
  export interface ReportInput {
    zone_id: string;
    apt_ids: string[];
    cash: number;
  }

  export interface ReportOutput {
    report: {
      investment_structure: InvestmentStructure;
      housing_cost: HousingCost;
      cash_flow: CashFlow;
      future_value: FutureValue;
    };
    generated_at: string; // ISO 8601
  }
  // InvestmentStructure, HousingCost, CashFlow, FutureValue 각각의 상세 인터페이스 정의
  ```
- [ ] `src/schemas/comparison.ts` Zod 스키마 정의
- [ ] 에러 코드 정의:
  ```typescript
  export const COMPARISON_ERRORS = {
    ZONE_NOT_FOUND: { status: 404, code: 'ZONE_NOT_FOUND', message: '해당 구역을 찾을 수 없습니다.' },
    NO_MATCHING_APARTMENTS: { status: 200, code: 'NO_MATCHING_APARTMENTS', message: '현재 예산으로는 비교 가능한 기축 아파트가 없습니다.' },
    NO_BLUECHIP_DATA: { status: 200, code: 'NO_BLUECHIP_EXPANDED', message: '동일 행정구 내 데이터 부재, 인접 행정구 기준 산정' },
  } as const;
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Dashboard Input 검증**
- **Given**: `{ zone_id: 'valid-uuid', cash: 300000000 }`이 주어짐
- **When**: dashboardInputSchema를 검증함
- **Then**: 에러 없이 통과하고, `custom_apt_ids`는 undefined이다.

**Scenario 2: Dashboard Output 구조 검증**
- **Given**: 정상적인 DashboardOutput이 반환된 상태
- **When**: `district_expanded` 필드를 확인함
- **Then**: boolean 타입이고, `true`일 때 프론트엔드가 인접 행정구 툴팁을 표시할 수 있다.

**Scenario 3: ExistingApartment에 회복률 포함**
- **Given**: DashboardOutput의 `existing_apartments` 배열이 반환된 상태
- **When**: 각 요소를 확인함
- **Then**: `recovery_rate` 필드가 존재하고, null이 아닌 경우 0~200 범위의 퍼센트 값이다.

**Scenario 4: Report Output 4개 섹션**
- **Given**: ReportOutput이 반환된 상태
- **When**: `report` 객체를 확인함
- **Then**: `investment_structure`, `housing_cost`, `cash_flow`, `future_value` 4개 키가 모두 존재한다.

### :gear: Technical & Non-Functional Constraints
- **`district_expanded` 플래그**: 프론트엔드가 조건부 UI(FE-G-002 툴팁)를 표시하기 위한 핵심 필드
- **`recovery_rate` nullable**: 21-22년 전고점 데이터가 없는 아파트의 경우 `null` 허용. 프론트엔드에서 "데이터 없음" 처리
- **리포트 4개 섹션**: 각 섹션의 상세 필드는 프론트엔드 디자인과 협의하여 확정 가능. 초기에는 핵심 수치만 포함

### :checkered_flag: Definition of Done (DoD)
- [ ] Dashboard Input/Output DTO가 정의되어 있는가?
- [ ] Report Input/Output DTO가 정의되어 있는가?
- [ ] `district_expanded` 플래그가 DashboardOutput에 포함되어 있는가?
- [ ] `recovery_rate`가 ExistingApartment에 포함되어 있는가?
- [ ] Zod 검증 스키마가 정의되어 있는가?
- [ ] 에러 코드가 정의되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-G-001 (Dashboard 구현), BE-G-002 (Report 구현), FE-G-001~005 (대시보드 UI), TEST-006 (Dashboard 테스트), TEST-007 (Report 테스트)

---

## Issue #18: API-SPEC-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-004: /api/v1/zones GET Route Handler Query Params & Response DTO 정의"
labels: 'api-contract, backend, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-004] 구역 정보 조회 API 통신 계약 정의
- **목적**: `/api/v1/zones` GET Route Handler(API-05)의 Query Params와 Paginated Response 구조를 정의한다. B2C 사용자가 구역 목록을 탐색하고, B2B 중개사가 매물 등록 시 소속 구역을 선택하는 데 사용되는 범용 조회 API이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-05`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-NF-002: 1,000개 이상 구역 Pagination/Lazy Loading

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/zone.ts` 파일 생성
- [ ] Query Params 타입:
  ```typescript
  export interface ZonesQueryParams {
    page?: number;   // default: 1
    size?: number;   // default: 20, max: 100
    stage?: string;  // ZoneStage ENUM 값 또는 '*' (전체)
    district?: string; // 행정구 필터
  }
  ```
- [ ] Response DTO:
  ```typescript
  export interface ZonesResponse {
    zones: ZoneSummary[];
    pagination: PaginationMeta;
  }

  export interface ZoneSummary {
    zone_id: string;
    name: string;
    district: string;
    stage: string;
    total_units: number | null;
    estimated_ratio: number | null;
    avg_rights_value: number | null;
    last_synced_at: string;
  }

  export interface PaginationMeta {
    current_page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
  }
  ```
- [ ] `src/schemas/zone.ts` Zod 스키마:
  ```typescript
  export const zonesQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),
    stage: z.string().optional(),
    district: z.string().optional(),
  });
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 기본 파라미터 (페이지 1, 20건)**
- **Given**: Query Params 없이 요청함
- **When**: zonesQuerySchema를 검증함
- **Then**: `{ page: 1, size: 20 }` 기본값이 적용된다.

**Scenario 2: Pagination 메타데이터**
- **Given**: 총 50개 구역이 존재하고 `size=20`으로 조회
- **When**: 응답을 확인함
- **Then**: `pagination.total_pages`가 3이고, `has_next`가 true이다.

**Scenario 3: stage 필터**
- **Given**: `stage=MANAGEMENT_DISPOSAL`로 조회
- **When**: Zod가 검증함
- **Then**: stage 문자열이 정상 전달되고, 실제 필터링은 BE-H-004에서 수행.

### :gear: Technical & Non-Functional Constraints
- **REQ-NF-002**: 1,000개 이상 구역 시 반드시 Pagination 적용. `size` 최대 100으로 제한
- **`z.coerce`**: Query Params는 문자열로 전달되므로, Zod의 `coerce`를 사용하여 숫자 변환

### :checkered_flag: Definition of Done (DoD)
- [ ] Query Params 타입과 Zod 스키마가 정의되어 있는가?
- [ ] Response에 PaginationMeta가 포함되어 있는가?
- [ ] `size` 최대값이 100으로 제한되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-H-004 (Zones GET 구현), FE-F-002 (결과 리스트 Pagination)

---

## Issue #19: API-SPEC-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-005: /api/v1/listings GET Route Handler Query Params & Response DTO 정의"
labels: 'api-contract, backend, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-005] 매물 목록 조회 API 통신 계약 정의
- **목적**: `/api/v1/listings` GET Route Handler(API-06)의 Query Params와 Response를 정의한다. **`verified_first=true` 파라미터로 Verified 매물이 상단에 우선 고정 노출**(REQ-FUNC-016)되는 정렬 계약을 확립한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-06`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-016: Verified 매물 상단 우선 고정 노출
- DB-010: 역할별 민감 필드 제어 (`LISTING_PUBLIC_SELECT`)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/listing.ts`에 조회 관련 타입 추가 (기존 파일 확장)
- [ ] Query Params:
  ```typescript
  export interface ListingsQueryParams {
    zone_id?: string;
    verified_first?: boolean; // default: true
    status?: 'ACTIVE' | 'SOLD' | 'WITHDRAWN';
    page?: number;
    size?: number;
  }
  ```
- [ ] Response DTO (B2C용 — 민감 필드 제외):
  ```typescript
  export interface ListingsResponse {
    listings: ListingSummary[];
    pagination: PaginationMeta;
  }

  export interface ListingSummary {
    listing_id: string;
    zone_id: string;
    property_type: string;
    asking_price: number;
    actual_investment: number | null;
    premium: number | null;
    rights_value: number | null;
    is_verified: boolean;
    verified_at: string | null;
    status: string;
    created_at: string;
    // ⚠️ owner_contact, unit_number 필드 미포함 (B2C 공개 응답)
  }
  ```
- [ ] Zod 스키마:
  ```typescript
  export const listingsQuerySchema = z.object({
    zone_id: z.string().uuid().optional(),
    verified_first: z.coerce.boolean().default(true),
    status: z.enum(['ACTIVE', 'SOLD', 'WITHDRAWN']).optional(),
    page: z.coerce.number().int().positive().default(1),
    size: z.coerce.number().int().min(1).max(100).default(20),
  });
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Verified 우선 정렬 기본값**
- **Given**: Query Params 없이 요청함
- **When**: listingsQuerySchema를 검증함
- **Then**: `verified_first`가 `true` (기본값)로 설정된다.

**Scenario 2: 응답에 민감 필드 미포함**
- **Given**: B2C 사용자가 매물 목록을 조회함
- **When**: ListingSummary 타입을 확인함
- **Then**: `owner_contact`, `unit_number` 필드가 타입에 정의되어 있지 않다.

**Scenario 3: zone_id 필터**
- **Given**: `zone_id=valid-uuid`로 조회
- **When**: 검증 후 실행함
- **Then**: 해당 구역의 매물만 반환된다.

### :gear: Technical & Non-Functional Constraints
- **DB-010 연계**: 응답 DTO가 `LISTING_PUBLIC_SELECT`와 일치해야 함. 민감 필드 누락
- **`verified_first`**: 정렬 방식을 Prisma `orderBy: [{ is_verified: 'desc' }]`로 구현하기 위한 파라미터

### :checkered_flag: Definition of Done (DoD)
- [ ] Query Params 타입 및 Zod 스키마가 정의되어 있는가?
- [ ] Response에 민감 필드(`owner_contact`, `unit_number`)가 포함되지 않는가?
- [ ] `verified_first` 기본값이 `true`인가?
- [ ] PaginationMeta가 포함되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-H-003 (Listings GET 구현), FE-H-004 (B2C 매물 리스트 UI)

---

## Issue #20: API-SPEC-006

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-006: Admin Server Action (LTV 정책 관리) DTO, Zod 스키마 및 에러 코드 정의"
labels: 'api-contract, backend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-006] Admin LTV 정책 관리 Server Action 통신 계약 정의
- **목적**: `app/actions/admin.ts`의 `updateLtvPolicy()` Server Action(API-07)의 입출력을 정의한다. **Admin 패스코드 검증(401)**이 포함되며, 정책 수정이 즉시 역산 결과에 반영(REQ-FUNC-006)되는 구조이다. 하드코딩 금지(CON-03) 정책에 따라 모든 LTV 파라미터가 이 API를 통해서만 변경된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-07`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-006: LTV 정책 변경 즉시 반영
- CON-03: LTV/DSR 하드코딩 금지
- REQ-NF-016: LTV/DSR 파라미터화 (Admin Server Action + 패스코드)
- RISK-01: 정책 급변 리스크 대응

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/admin.ts` 파일 생성
- [ ] Input DTO:
  ```typescript
  export interface UpdateLtvPolicyInput {
    policies: LtvPolicyTier[];
    passcode: string; // SECRET_ADMIN 검증용
  }

  export interface LtvPolicyTier {
    policy_id?: string; // 기존 정책 수정 시
    tier_label: string;
    price_threshold_min: number;
    price_threshold_max: number;
    max_loan_amount: number;
    effective_from: string; // ISO 8601
  }
  ```
- [ ] Output DTO:
  ```typescript
  export interface UpdateLtvPolicyOutput {
    updated: boolean;
    effective_at: string; // ISO 8601
    updated_count: number;
  }
  ```
- [ ] `src/schemas/admin.ts` Zod 스키마:
  ```typescript
  const ltvPolicyTierSchema = z.object({
    policy_id: z.string().uuid().optional(),
    tier_label: z.string().min(1).max(50),
    price_threshold_min: z.number().int().min(0),
    price_threshold_max: z.number().int().positive(),
    max_loan_amount: z.number().int().positive(),
    effective_from: z.string().datetime(),
  }).refine(data => data.price_threshold_max > data.price_threshold_min, {
    message: '가격 상한은 하한보다 커야 합니다',
  });

  export const updateLtvPolicySchema = z.object({
    policies: z.array(ltvPolicyTierSchema).min(1, '최소 1개 이상의 정책 Tier를 입력해야 합니다'),
    passcode: z.string().min(1, '관리자 패스코드를 입력해 주세요'),
  });
  ```
- [ ] 에러 코드 정의:
  ```typescript
  export const ADMIN_ERRORS = {
    ADMIN_PASSCODE_MISMATCH: { status: 401, code: 'ADMIN_PASSCODE_MISMATCH', message: '관리자 접근 코드가 올바르지 않습니다.' },
    POLICY_OVERLAP: { status: 400, code: 'POLICY_OVERLAP', message: '정책 Tier 간 가격 범위가 겹칩니다.' },
    VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR', message: '입력 데이터가 올바르지 않습니다.' },
  } as const;
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 3-Tier 정책 업데이트 Input 검증**
- **Given**: 3개 Tier와 유효한 passcode가 포함된 입력이 주어짐
- **When**: updateLtvPolicySchema.parse(input)를 실행함
- **Then**: 에러 없이 파싱된다.

**Scenario 2: 가격 범위 역전 검증**
- **Given**: `price_threshold_min: 2500000000, price_threshold_max: 1500000000` (역전)이 주어짐
- **When**: ltvPolicyTierSchema를 검증함
- **Then**: '가격 상한은 하한보다 커야 합니다' 에러가 반환된다.

**Scenario 3: Admin 패스코드 누락**
- **Given**: `passcode`가 빈 문자열인 입력이 주어짐
- **When**: updateLtvPolicySchema를 검증함
- **Then**: '관리자 패스코드를 입력해 주세요' 에러가 반환된다.

**Scenario 4: Output 구조 검증**
- **Given**: 정책 업데이트가 성공한 상태
- **When**: UpdateLtvPolicyOutput을 확인함
- **Then**: `updated: true`, `effective_at`이 ISO 8601 형식, `updated_count`가 수정된 Tier 수와 일치한다.

### :gear: Technical & Non-Functional Constraints
- **CON-03**: 이 API 계약은 LTV/DSR 값을 DB에서만 관리하도록 강제하는 핵심 통신 규약
- **Tier 범위 검증**: 서버 측에서 Tier 간 가격 범위 겹침(overlap) 추가 검증 필요 (Zod `refine`으로 구현)
- **`effective_from`**: 정책 적용 시작일을 명시하여, 미래 시점 정책 사전 등록 가능

### :checkered_flag: Definition of Done (DoD)
- [ ] Input/Output DTO가 정의되어 있는가?
- [ ] Zod 스키마에 `refine`을 통한 가격 범위 역전 검증이 포함되어 있는가?
- [ ] Admin 에러 코드(401, 400×2)가 상수로 정의되어 있는가?
- [ ] 정책 배열은 최소 1개 이상이어야 한다는 검증이 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-I-001 (Admin LTV 수정 구현), FE-I-002 (LTV 관리 폼 UI), TEST-INT-004 (Admin LTV E2E)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001~004, DB-001 | ✅ 완료 |
| **Batch 02** | DB-002~006 | ✅ 완료 |
| **Batch 03** | DB-007~010, API-SPEC-001 | ✅ 완료 |
| **Batch 04** | API-SPEC-002~006 | ✅ **완료** |
| Batch 05 | API-SPEC-007~008, MOCK-001~003 | ⬜ 대기 |
| Batch 06 | MOCK-004~006, LIB-001~002 | ⬜ 대기 |
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
