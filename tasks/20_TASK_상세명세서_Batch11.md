# TASK 상세 명세서 — Batch 11 (FE-H-004 ~ FE-H-005, BE-H-001 ~ BE-H-003)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 11 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 55/89

---

## Issue #51: FE-H-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-H-004: B2C 매물 리스트 — Verified 뱃지 우선 노출 + 민감 정보 비노출"
labels: 'frontend, ui, b2c, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-H-004] B2C 매물 리스트 UI
- **목적**: B2C 사용자가 특정 구역의 매물 목록을 탐색하는 페이지를 구현한다. **Verified 뱃지 매물이 상단에 우선 고정 노출**(REQ-FUNC-016)되고, 민감 정보(`owner_contact`, `unit_number`)는 **절대 노출되지 않는다**(DB-010 + C-TEC-010).

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-016: Verified 매물 상단 우선 고정 노출
- API-SPEC-005: `ListingsResponse` — `ListingSummary`(민감 필드 미포함)
- DB-010: `LISTING_PUBLIC_SELECT` (owner_contact, unit_number 제외)
- REQ-NF-024: `Click_Verified_Listing`, `Impression_All_Listings` Amplitude 이벤트

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/listings/page.tsx` Server Component:
  - Query Param `zone_id` 파싱
  - `/api/v1/listings?zone_id=...&verified_first=true` 호출
  - 결과를 Client Component로 전달
- [ ] `src/app/(b2c)/_components/listing-list.tsx` Client Component:
  - **Verified 매물 카드**: 상단 고정, ✅ Verified 뱃지 + 녹색 테두리
  - **일반 매물 카드**: Verified 아래에 표시, 뱃지 없음
  - 각 카드 구성: property_type 라벨, asking_price 원화 포맷, premium, rights_value
  - **민감 필드 없음**: `owner_contact`, `unit_number`는 `ListingSummary` 타입 자체에 미존재
  - Pagination 컴포넌트 재사용 (FE-F-002에서 생성)
- [ ] Verified 뱃지 컴포넌트: `<Badge variant="success">✅ Verified</Badge>`
- [ ] 매물 상세 클릭 → 대시보드 페이지로 이동 (해당 zone의 비교 페이지)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Verified 우선 정렬 표시**
- **Given**: Verified 2건 + 일반 3건이 존재하는 상태
- **When**: 매물 리스트 페이지를 렌더링함
- **Then**: 상위 2건에 ✅ Verified 뱃지가 표시되고, 하위 3건에는 뱃지가 없다.

**Scenario 2: 민감 정보 비노출**
- **Given**: 매물 리스트가 렌더링된 상태
- **When**: 카드 전체 내용을 확인함
- **Then**: `owner_contact`, `unit_number` 테스트가 어디에도 표시되지 않는다.

**Scenario 3: Pagination**
- **Given**: 25건의 매물이 존재하고 page_size=20인 상태
- **When**: 1페이지를 확인함
- **Then**: 20건이 표시되고, 2페이지 버튼이 존재한다.

### :gear: Technical & Non-Functional Constraints
- **타입 안전성**: `ListingSummary` 타입 자체에 `owner_contact`가 없으므로, 실수로 노출할 수 없다
- **API 응답**: BE-H-003이 `LISTING_PUBLIC_SELECT`를 사용하므로, 서버 응답에도 민감 필드가 없음

### :checkered_flag: Definition of Done (DoD)
- [ ] Verified 매물이 상단에 고정 표시되는가?
- [ ] ✅ Verified 뱃지가 구분되는가?
- [ ] 민감 정보가 카드에 노출되지 않는가?
- [ ] Pagination이 동작하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-002, API-SPEC-005 (Listings Response DTO), BE-H-003 (GET 구현)
- **Blocks**: NFR-008 (Amplitude 매물 이벤트)

---

## Issue #52: FE-H-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-H-005: B2B 고객 브리핑 모드 — 민감 정보 UI 마스킹 + 시뮬레이션 가시성"
labels: 'frontend, ui, b2b, security, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-H-005] B2B 고객 브리핑 모드 UI
- **목적**: B2B 중개사가 고객에게 투자 시뮬레이션을 보여줄 때, 소유주 연락처와 동호수는 **UI 마스킹(`010-****-1234`)으로 가리고**, 시뮬레이션 데이터(비교 대시보드, 투자 분석)는 **100% 가시성**을 유지하는 브리핑 전용 뷰를 제공한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-017: 브리핑 모드 민감 정보 UI 마스킹
- C-TEC-010: UI 마스킹 렌더링
- LIB-004: `maskPhoneNumber()`, `maskUnitNumber()`
- LIB-003: PasscodeGuard (B2B 인증 필요)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2b)/briefing/[zoneId]/page.tsx` Server Component:
  - PasscodeGuard 인증 후 접근
  - B2B agent_id 기반으로 해당 Zone의 본인 매물 조회 (민감 필드 포함)
  - 대시보드 데이터(generateDashboard) 동시 조회
- [ ] `src/app/(b2b)/_components/briefing-view.tsx` Client Component:
  - **매물 정보 섹션**: 민감 필드를 LIB-004로 마스킹하여 표시
    ```typescript
    <p>소유주 연락처: {maskPhoneNumber(listing.owner_contact)}</p>
    <p>동호수: {maskUnitNumber(listing.unit_number)}</p>
    ```
  - **투자 시뮬레이션 섹션**: 대시보드 데이터를 그대로 표시 (마스킹 없음)
    - 재개발 vs 기축 비교
    - 실투자금 산출
    - 미래 가치 예측
  - **브리핑 모드 표시**: 상단에 "🎤 고객 브리핑 모드" 배지
  - **인쇄/공유 버튼**: 브라우저 인쇄 기능 연결 (optional)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 민감 정보 마스킹 표시**
- **Given**: 매물의 `owner_contact`가 '01012345678'인 상태
- **When**: 브리핑 모드 페이지를 확인함
- **Then**: '010-****-5678'으로 마스킹되어 표시된다.

**Scenario 2: 동호수 마스킹 표시**
- **Given**: 매물의 `unit_number`가 '101-1201'인 상태
- **When**: 브리핑 모드를 확인함
- **Then**: '***-****'으로 마스킹되어 표시된다.

**Scenario 3: 시뮬레이션 데이터 100% 가시성**
- **Given**: 브리핑 모드 페이지가 렌더링된 상태
- **When**: 투자 시뮬레이션 섹션을 확인함
- **Then**: 재개발 vs 기축 비교, 실투자금, 미래 가치 등 모든 데이터가 마스킹 없이 표시된다.

**Scenario 4: PasscodeGuard 인증 필요**
- **Given**: B2B 패스코드 미인증 상태
- **When**: `/(b2b)/briefing/[zoneId]`에 직접 접속함
- **Then**: PasscodeGuard 패스코드 입력 폼이 표시된다.

### :gear: Technical & Non-Functional Constraints
- **LIB-004**: `maskPhoneNumber`, `maskUnitNumber` 함수 반드시 사용. 직접 마스킹 로직 작성 금지
- **데이터 접근**: B2B Route이므로 agent_id 기반 본인 매물만 조회. `LISTING_B2B_SELECT` 사용 (민감 필드 포함)
- **브리핑 목적**: 화면 공유/프로젝터 상황을 고려하여 폰트 크기와 대비를 높일 것

### :checkered_flag: Definition of Done (DoD)
- [ ] 민감 정보가 `maskPhoneNumber`, `maskUnitNumber`로 마스킹되어 표시되는가?
- [ ] 시뮬레이션 데이터는 마스킹 없이 전체 표시되는가?
- [ ] "고객 브리핑 모드" 배지가 표시되는가?
- [ ] PasscodeGuard 인증 없이는 접근 불가능한가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003 (PasscodeGuard), LIB-004 (MaskingUtil), BE-G-001 (Dashboard 데이터)
- **Blocks**: 없음

---

## Issue #53: BE-H-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-H-001: /api/v1/b2b/listing POST — 매물 등록 + 교차검증 Route Handler"
labels: 'backend, feature, b2b, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-H-001] B2B 매물 등록 Route Handler (POST) 구현
- **목적**: B2B 중개사의 매물 등록 요청을 처리한다. (1) 패스코드 검증 → (2) Zod 서버 검증 → (3) 주변 실거래가 기반 **±30% 교차검증** → (4) 검증 통과 시 `is_verified=true`로 Prisma INSERT → (5) 실패 시 `400 PRICE_ANOMALY` 반환. **DB Write: INSERT**. Verified 뱃지 시스템의 핵심 백엔드 로직이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- B2B 매물 등록 시퀀스: [`07_SRS_v1.0.md#6.3.3`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) ⚠️ **필수 정독**
- REQ-FUNC-015: Verified 뱃지 교차검증 ≤ 1초
- REQ-FUNC-018: ±30% 이상치 호가 차단
- API-SPEC-002: `CreateListingRequest`, `ListingResponse`, `LISTING_ERRORS`
- LIB-003: 패스코드 검증 (Server Action → 여기서는 Route Handler 내부에서 직접 비교)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/v1/b2b/listing/route.ts` 파일 생성
- [ ] POST Handler 구현:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { createListingSchema } from '@/schemas/listing';
  import { LISTING_ERRORS } from '@/types/listing';
  import { prisma } from '@/lib/prisma';

  export async function POST(request: NextRequest) {
    const body = await request.json();

    // Step 1: 패스코드 검증
    if (body.passcode !== process.env.SECRET_B2B) {
      return NextResponse.json(LISTING_ERRORS.PASSCODE_MISMATCH, { status: 401 });
    }

    // Step 2: Zod 서버 검증
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        ...LISTING_ERRORS.VALIDATION_ERROR,
        details: parsed.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const data = parsed.data;

    // Step 3: Zone 존재 확인
    const zone = await prisma.zone.findUnique({ where: { zone_id: data.zone_id } });
    if (!zone) {
      return NextResponse.json(LISTING_ERRORS.ZONE_NOT_FOUND, { status: 404 });
    }

    // Step 4: ±30% 교차검증
    const nearbyListings = await prisma.listing.findMany({
      where: { zone_id: data.zone_id, status: 'ACTIVE' },
      select: { asking_price: true },
    });

    let isVerified = true;
    if (nearbyListings.length > 0) {
      const avgPrice = nearbyListings.reduce((sum, l) => sum + Number(l.asking_price), 0) / nearbyListings.length;
      const deviation = Math.abs(data.asking_price - avgPrice) / avgPrice;
      if (deviation > 0.3) {
        return NextResponse.json(LISTING_ERRORS.PRICE_ANOMALY, { status: 400 });
      }
    }
    // 주변 매물 없으면 Curated DB 기반 검증
    else {
      const curatedRef = await prisma.curated_Actual_Price_DB.findFirst({
        where: { district: zone.district },
        orderBy: { latest_actual_price: 'asc' },
      });
      if (curatedRef) {
        const refPrice = Number(curatedRef.latest_actual_price);
        const deviation = Math.abs(data.asking_price - refPrice) / refPrice;
        if (deviation > 0.3) {
          return NextResponse.json(LISTING_ERRORS.PRICE_ANOMALY, { status: 400 });
        }
      }
    }

    // Step 5: Prisma INSERT
    const listing = await prisma.listing.create({
      data: {
        zone_id: data.zone_id,
        property_type: data.property_type,
        asking_price: BigInt(data.asking_price),
        premium: BigInt(data.premium),
        rights_value: BigInt(data.rights_value),
        owner_contact: data.owner_contact,
        unit_number: data.unit_number,
        is_verified: isVerified,
        verified_at: isVerified ? new Date() : null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      listing_id: listing.listing_id,
      is_verified: listing.is_verified,
      created_at: listing.created_at.toISOString(),
    }, { status: 201 });
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 정상 등록 (Verified)**
- **Given**: 유효한 passcode, 정상 범위 호가, 존재하는 zone_id
- **When**: POST 요청을 전송함
- **Then**: `201 Created`, `is_verified: true`, `listing_id`가 반환된다.

**Scenario 2: 패스코드 불일치**
- **Given**: 잘못된 passcode
- **When**: POST 요청을 전송함
- **Then**: `401 PASSCODE_MISMATCH`가 반환된다.

**Scenario 3: 이상치 호가 차단 (±30% 초과)**
- **Given**: 주변 평균 3억인 구역에 호가 5억 입력 (+67%)
- **When**: POST 요청을 전송함
- **Then**: `400 PRICE_ANOMALY`, "정상 범위를 벗어난 호가입니다" 가 반환된다.

**Scenario 4: Zone 미존재**
- **Given**: 존재하지 않는 zone_id
- **When**: POST 요청을 전송함
- **Then**: `404 ZONE_NOT_FOUND`가 반환된다.

**Scenario 5: Zod 검증 실패**
- **Given**: asking_price가 음수
- **When**: POST 요청을 전송함
- **Then**: `400 VALIDATION_ERROR` + fieldErrors 상세 정보가 반환된다.

**Scenario 6: 교차검증 처리 시간 ≤ 1초**
- **Given**: 정상 데이터
- **When**: POST 요청 전송 후 응답까지 시간 측정함
- **Then**: 교차검증 포함 전체 처리 시간이 1초 이내이다.

### :gear: Technical & Non-Functional Constraints
- **REQ-FUNC-015**: 교차검증 포함 1초 이내. Prisma 쿼리 최적화 필요
- **±30% 기준**: `|asking_price - avgPrice| / avgPrice > 0.3`이면 이상치
- **Fallback**: 주변 매물 0건 시 Curated_Actual_Price_DB 참조. 그마저도 없으면 검증 skip하고 `is_verified=false`
- **평문 저장**: `owner_contact`, `unit_number`는 암호화 없이 평문 INSERT (C-TEC-010)

### :checkered_flag: Definition of Done (DoD)
- [ ] POST `/api/v1/b2b/listing`이 구현되어 있는가?
- [ ] 패스코드 검증(401), Zod 검증(400), Zone 확인(404), 이상치 차단(400)이 모두 구현되어 있는가?
- [ ] ±30% 교차검증이 동작하는가?
- [ ] Verified 매물이 `is_verified=true`, `verified_at=현재시간`으로 저장되는가?
- [ ] 전체 처리 시간이 1초 이내인가?
- [ ] TEST-INT-001 (B2B E2E)이 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-003 (Listing), DB-002 (Zone), DB-004 (Curated — Fallback), API-SPEC-002 (DTO + 에러 코드), INIT-003 (SECRET_B2B)
- **Blocks**: BE-H-002 (PUT 수정), FE-H-002 (에러 렌더링), TEST-INT-001 (E2E)

---

## Issue #54: BE-H-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-H-002: /api/v1/b2b/listing/[id] PUT — 매물 수정 + 재교차검증"
labels: 'backend, feature, b2b, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-H-002] B2B 매물 수정 Route Handler (PUT) 구현
- **목적**: 기존 등록 매물의 가격, 프리미엄, 상태를 수정한다. **수정 시에도 교차검증을 재실행**하여 Verified 뱃지 상태를 갱신한다. **DB Write: UPDATE**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-02 PUT`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- API-SPEC-002: `UpdateListingRequest` DTO

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/v1/b2b/listing/[id]/route.ts` 파일 생성
- [ ] PUT Handler 구현:
  ```typescript
  export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();

    // Step 1: 패스코드 검증
    if (body.passcode !== process.env.SECRET_B2B) {
      return NextResponse.json(LISTING_ERRORS.PASSCODE_MISMATCH, { status: 401 });
    }

    // Step 2: 기존 매물 확인
    const existing = await prisma.listing.findUnique({ where: { listing_id: params.id } });
    if (!existing) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    // Step 3: asking_price 변경 시 재교차검증
    let isVerified = existing.is_verified;
    if (body.asking_price && body.asking_price !== Number(existing.asking_price)) {
      // BE-H-001과 동일한 ±30% 교차검증 로직 실행
      // ... (공통 함수로 추출하여 재사용)
    }

    // Step 4: Prisma UPDATE
    const updated = await prisma.listing.update({
      where: { listing_id: params.id },
      data: {
        asking_price: body.asking_price ? BigInt(body.asking_price) : undefined,
        premium: body.premium ? BigInt(body.premium) : undefined,
        status: body.status || undefined,
        is_verified: isVerified,
        verified_at: isVerified ? new Date() : null,
      },
    });

    return NextResponse.json({
      listing_id: updated.listing_id,
      is_verified: updated.is_verified,
      updated_at: updated.updated_at.toISOString(),
    });
  }
  ```
- [ ] ±30% 교차검증 로직을 `lib/listing-verification.ts`로 추출하여 POST/PUT 공통 사용

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 가격 수정 → 재교차검증 통과**
- **Given**: 기존 매물(Verified)의 asking_price를 정상 범위 내로 수정
- **When**: PUT 요청을 전송함
- **Then**: `is_verified` 유지, `updated_at` 갱신

**Scenario 2: 가격 수정 → 이상치 차단**
- **Given**: 기존 매물의 asking_price를 ±30% 초과로 수정
- **When**: PUT 요청을 전송함
- **Then**: `400 PRICE_ANOMALY` 반환, DB 미변경

**Scenario 3: 상태 변경만 (가격 미변경)**
- **Given**: status를 `SOLD`로만 변경
- **When**: PUT 요청을 전송함
- **Then**: 교차검증 없이 status만 업데이트, `is_verified` 유지

### :gear: Technical & Non-Functional Constraints
- **교차검증 로직 재사용**: `lib/listing-verification.ts`로 추출하여 DRY 원칙 준수
- **부분 업데이트**: body에 포함된 필드만 UPDATE. undefined 필드는 기존 값 유지

### :checkered_flag: Definition of Done (DoD)
- [ ] PUT `/api/v1/b2b/listing/[id]`가 구현되어 있는가?
- [ ] 가격 변경 시 재교차검증이 실행되는가?
- [ ] 교차검증 로직이 POST와 공유되는 공통 함수인가?
- [ ] 부분 업데이트가 정상 동작하는가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-H-001 (POST — 교차검증 로직 공유)
- **Blocks**: FE-H-001 (폼에서 수정 기능 연결)

---

## Issue #55: BE-H-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-H-003: /api/v1/listings GET — 매물 목록 조회 (Verified 우선 정렬 + Pagination)"
labels: 'backend, feature, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-H-003] 매물 목록 조회 Route Handler (GET)
- **목적**: B2C 사용자가 특정 구역의 매물 목록을 조회하는 API를 구현한다. **Verified 매물 우선 정렬**, **Pagination**, **민감 필드 제외**(`LISTING_PUBLIC_SELECT`)를 적용한다. **DB Read Only**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-06`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-016: Verified 매물 상단 우선 고정 노출
- API-SPEC-005: `ListingsQueryParams`, `ListingsResponse` DTO
- DB-010: `LISTING_PUBLIC_SELECT` 역할별 필드 제어

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/v1/listings/route.ts` 파일 생성
- [ ] GET Handler 구현:
  ```typescript
  import { listingsQuerySchema } from '@/schemas/listing';
  import { LISTING_PUBLIC_SELECT } from '@/lib/listing-query';

  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = listingsQuerySchema.parse(Object.fromEntries(searchParams));

    // WHERE 조건 구성
    const where: any = {};
    if (params.zone_id) where.zone_id = params.zone_id;
    if (params.status) where.status = params.status;

    // 총 건수
    const totalCount = await prisma.listing.count({ where });

    // 데이터 조회 (Verified 우선 정렬 + Pagination)
    const listings = await prisma.listing.findMany({
      where,
      select: LISTING_PUBLIC_SELECT, // 민감 필드 제외
      orderBy: params.verified_first
        ? [{ is_verified: 'desc' }, { created_at: 'desc' }]
        : [{ created_at: 'desc' }],
      skip: (params.page - 1) * params.size,
      take: params.size,
    });

    return NextResponse.json({
      listings: listings.map(l => ({
        ...l,
        asking_price: Number(l.asking_price),
        premium: l.premium ? Number(l.premium) : null,
        rights_value: l.rights_value ? Number(l.rights_value) : null,
      })),
      pagination: {
        current_page: params.page,
        page_size: params.size,
        total_count: totalCount,
        total_pages: Math.ceil(totalCount / params.size),
        has_next: params.page * params.size < totalCount,
      },
    });
  }
  ```
- [ ] BigInt → number 직렬화: Prisma BigInt 필드를 `Number()`로 변환 (JSON 직렬화 불가 대응)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Verified 우선 정렬**
- **Given**: Verified 2건 + 일반 3건이 존재
- **When**: `GET /api/v1/listings?verified_first=true`를 호출함
- **Then**: 상위 2건의 `is_verified`가 `true`이다.

**Scenario 2: Pagination**
- **Given**: 25건의 매물, `page=2&size=10`
- **When**: GET 요청함
- **Then**: 11~20번째 매물이 반환되고, `pagination.has_next === true`

**Scenario 3: 민감 필드 제외**
- **Given**: GET 응답을 확인함
- **When**: 각 listing 객체를 검사함
- **Then**: `owner_contact`, `unit_number` 키가 존재하지 않는다.

**Scenario 4: zone_id 필터**
- **Given**: 특정 zone_id로 필터링
- **When**: `GET /api/v1/listings?zone_id=xxx`를 호출함
- **Then**: 해당 Zone의 매물만 반환된다.

**Scenario 5: BigInt 직렬화**
- **Given**: `asking_price`가 BigInt `500000000n`인 매물
- **When**: JSON 응답을 확인함
- **Then**: `asking_price: 500000000` (number 타입)으로 반환된다.

### :gear: Technical & Non-Functional Constraints
- **LISTING_PUBLIC_SELECT**: DB-010에서 정의한 select 상수 사용. 직접 select 작성 금지
- **BigInt 직렬화**: JSON은 BigInt를 지원하지 않음. `.map()`에서 `Number()` 변환 필수
- **`z.coerce`**: Query Params는 문자열이므로 Zod `coerce`로 숫자/불린 변환

### :checkered_flag: Definition of Done (DoD)
- [ ] GET `/api/v1/listings`이 구현되어 있는가?
- [ ] `LISTING_PUBLIC_SELECT`를 사용하여 민감 필드가 제외되는가?
- [ ] Verified 우선 정렬이 동작하는가?
- [ ] Pagination이 정상 동작하는가?
- [ ] BigInt가 number로 변환되어 JSON 직렬화되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-003 (Listing), DB-010 (LISTING_PUBLIC_SELECT), API-SPEC-005 (DTO)
- **Blocks**: FE-H-004 (B2C 매물 리스트 UI)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~10** | INIT~FE-H-003 | ✅ 완료 (50개) |
| **Batch 11** | FE-H-004~005, BE-H-001~003 | ✅ **완료** |
| Batch 12 | BE-H-004, FE-I-001~004 | ⬜ 대기 |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
