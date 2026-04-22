# TASK 상세 명세서 — Batch 12 (BE-H-004, FE-I-001 ~ FE-I-004)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 12 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 60/89

---

## Issue #56: BE-H-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-H-004: /api/v1/zones GET — 구역 목록 조회 + Pagination"
labels: 'backend, feature, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-H-004] 구역 목록 조회 Route Handler (GET)
- **목적**: Zone 테이블을 Pagination + 필터(stage, district)로 조회하는 범용 API를 구현한다. B2C 사용자의 구역 탐색과 B2B 매물 등록 시 구역 Select 드롭다운에 공용 사용된다. **DB Read Only**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-05`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- API-SPEC-004: `ZonesQueryParams`, `ZonesResponse`, `PaginationMeta` DTO
- REQ-NF-002: 1,000개 이상 구역 Pagination

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/v1/zones/route.ts` 파일 생성
- [ ] GET Handler 구현:
  ```typescript
  import { zonesQuerySchema } from '@/schemas/zone';

  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const params = zonesQuerySchema.parse(Object.fromEntries(searchParams));

    const where: any = {};
    if (params.stage) where.stage = params.stage;
    if (params.district) where.district = params.district;

    const totalCount = await prisma.zone.count({ where });

    const zones = await prisma.zone.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (params.page - 1) * params.size,
      take: params.size,
      select: {
        zone_id: true,
        name: true,
        district: true,
        stage: true,
        total_units: true,
        estimated_ratio: true,
        avg_rights_value: true,
        last_synced_at: true,
      },
    });

    return NextResponse.json({
      zones: zones.map(z => ({
        ...z,
        total_units: z.total_units ? Number(z.total_units) : null,
        estimated_ratio: z.estimated_ratio ? Number(z.estimated_ratio) : null,
        avg_rights_value: z.avg_rights_value ? Number(z.avg_rights_value) : null,
        last_synced_at: z.last_synced_at.toISOString(),
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

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 기본 조회 (page=1, size=20)**
- **Given**: 50건의 Zone이 존재
- **When**: `GET /api/v1/zones`를 호출함
- **Then**: 20건이 반환되고, `pagination.total_pages === 3`

**Scenario 2: stage 필터**
- **Given**: `MANAGEMENT_DISPOSAL` 단계의 Zone이 5건 존재
- **When**: `GET /api/v1/zones?stage=MANAGEMENT_DISPOSAL`를 호출함
- **Then**: 5건만 반환된다.

**Scenario 3: district 필터**
- **Given**: '성북구' Zone이 3건 존재
- **When**: `GET /api/v1/zones?district=성북구`를 호출함
- **Then**: 3건만 반환된다.

**Scenario 4: BigInt/Decimal 직렬화**
- **Given**: `avg_rights_value`가 BigInt인 Zone
- **When**: JSON 응답을 확인함
- **Then**: number 타입으로 변환되어 있다.

### :gear: Technical & Non-Functional Constraints
- **size 최대 100**: API-SPEC-004 Zod 스키마에 이미 `max(100)` 적용
- **정렬**: 구역명 오름차순 기본 정렬

### :checkered_flag: Definition of Done (DoD)
- [ ] GET `/api/v1/zones`이 구현되어 있는가?
- [ ] stage, district 필터가 동작하는가?
- [ ] Pagination이 정상 동작하는가?
- [ ] BigInt/Decimal이 number로 변환되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-002 (Zone), API-SPEC-004 (DTO)
- **Blocks**: FE-H-001 (Zone 드롭다운), FE-F-002 (구역 탐색)

---

## Issue #57: FE-I-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-I-001: Admin 대시보드 메인 — 시스템 현황 요약 카드"
labels: 'frontend, ui, admin, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-I-001] Admin 대시보드 메인 페이지
- **목적**: PasscodeGuard(ADMIN) 인증 후 진입하는 관리자 대시보드 메인 페이지를 구현한다. **시스템 현황 요약 카드**(총 Zone 수, 총 Listing 수, Verified 비율, 최근 동기화 시간, 총 Lead 구독 수)를 한눈에 표시한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS Admin 기능: [`07_SRS_v1.0.md#3.6.4, #6.3.5`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- LIB-003: PasscodeGuard(ADMIN)
- INIT-002: `/(admin)/layout.tsx`

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(admin)/page.tsx` Server Component:
  ```typescript
  export default async function AdminDashboard() {
    const [zoneCount, listingCount, verifiedCount, latestSync, leadCount] = await Promise.all([
      prisma.zone.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { is_verified: true } }),
      prisma.zone.findFirst({ orderBy: { last_synced_at: 'desc' }, select: { last_synced_at: true } }),
      prisma.lead_Alert_Subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <StatCard title="총 구역 수" value={zoneCount} />
        <StatCard title="총 매물 수" value={listingCount} />
        <StatCard title="Verified 비율" value={`${Math.round(verifiedCount / listingCount * 100)}%`} />
        <StatCard title="최근 동기화" value={latestSync?.last_synced_at.toLocaleDateString('ko-KR') ?? 'N/A'} />
        <StatCard title="Lead 구독 수" value={leadCount} />
      </div>
    );
  }
  ```
- [ ] `src/app/(admin)/_components/stat-card.tsx`: 요약 카드 컴포넌트
- [ ] `/(admin)/layout.tsx`에 네비게이션 링크 추가: [대시보드 | LTV 관리 | 매물 관리 | 구독 관리]
- [ ] shadcn/ui: Card 재사용

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 시스템 현황 요약 표시**
- **Given**: Admin 패스코드 인증 후 대시보드에 접속
- **When**: 페이지가 렌더링됨
- **Then**: 총 구역 수, 매물 수, Verified 비율, 최근 동기화, Lead 수가 카드로 표시된다.

**Scenario 2: Promise.all 병렬 조회**
- **Given**: 5개 쿼리를 실행해야 하는 상태
- **When**: 페이지 로드 시간을 측정함
- **Then**: 가장 느린 쿼리 1개의 시간과 유사하다 (직렬 대비 빠름).

**Scenario 3: 매물 0건 시 Division by Zero 방지**
- **Given**: `listingCount === 0`인 상태
- **When**: Verified 비율을 계산함
- **Then**: `NaN` 대신 `0%` 또는 'N/A'가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **PasscodeGuard**: `/(admin)/layout.tsx`에서 이미 적용. 페이지 자체에서 추가 인증 불필요
- **SSR**: Server Component에서 직접 Prisma 호출. API Route 경유 불필요

### :checkered_flag: Definition of Done (DoD)
- [ ] 5개 시스템 현황 카드가 표시되는가?
- [ ] Verified 비율이 Division by Zero 없이 표시되는가?
- [ ] 네비게이션 링크가 존재하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-002 (Admin Route Group), LIB-003 (PasscodeGuard ADMIN), DB-009 (전체 테이블)
- **Blocks**: 없음 (독립 완료 가능)

---

## Issue #58: FE-I-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-I-002: Admin LTV 정책 관리 폼 (3-Tier CRUD)"
labels: 'frontend, ui, admin, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-I-002] Admin LTV 정책 3-Tier 관리 폼
- **목적**: Admin이 LTV 정책 3-Tier의 가격 범위와 최대 대출 가능액을 편집하는 폼을 구현한다. 현재 DB 값을 로드하여 표시하고, 수정 후 저장 시 BE-I-001(updateLtvPolicy Server Action)을 호출한다. **CON-03 하드코딩 금지 정책의 실질적 UI**이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-006: LTV 정책 변경 즉시 반영
- CON-03: LTV/DSR 하드코딩 금지
- API-SPEC-006: `UpdateLtvPolicyInput`, `UpdateLtvPolicyOutput` DTO
- RISK-01: 정책 급변 리스크 대응

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(admin)/ltv/page.tsx` Server Component:
  - 현재 LTV 정책 DB 조회 → Client Component로 전달
- [ ] `src/app/(admin)/_components/ltv-policy-form.tsx` Client Component:
  ```typescript
  'use client';
  // 각 Tier별 편집 가능한 행:
  // | Tier 라벨 | 가격 하한 | 가격 상한 | 최대 대출액 | 적용일 |
  // 행 추가/삭제 가능 (최소 1행)
  // "저장" 버튼 → updateLtvPolicy Server Action 호출
  // Admin 패스코드를 별도 Input으로 입력받아 함께 전송
  ```
- [ ] 각 Tier의 가격 필드: 원화 포맷팅 Input
- [ ] Tier 추가/삭제 버튼: `useFieldArray` (react-hook-form)
- [ ] 저장 성공 시: "정책이 업데이트되었습니다" 토스트 + 화면 갱신
- [ ] 저장 실패 시: 에러 코드별 메시지 표시 (POLICY_OVERLAP, ADMIN_PASSCODE_MISMATCH)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 현재 정책 로드**
- **Given**: LTV 3-Tier가 DB에 존재하는 상태
- **When**: `/(admin)/ltv` 페이지에 접속함
- **Then**: 3개 행에 현재 정책 값(tier_label, 가격 범위, 대출액, 적용일)이 표시된다.

**Scenario 2: 정책 수정 저장**
- **Given**: Tier 1의 max_loan_amount를 7억으로 변경
- **When**: Admin 패스코드를 입력하고 "저장" 버튼을 클릭함
- **Then**: 서버에 업데이트 요청이 전송되고, 성공 토스트가 표시된다.

**Scenario 3: Tier 추가**
- **Given**: 3-Tier가 표시된 상태
- **When**: "Tier 추가" 버튼을 클릭함
- **Then**: 4번째 빈 행이 추가된다.

**Scenario 4: Admin 패스코드 불일치**
- **Given**: 잘못된 Admin 패스코드를 입력함
- **When**: "저장"을 클릭함
- **Then**: "관리자 접근 코드가 올바르지 않습니다" 에러가 표시된다.

**Scenario 5: 가격 범위 겹침 에러**
- **Given**: Tier 1의 max와 Tier 2의 min이 겹치도록 수정
- **When**: "저장"을 클릭함
- **Then**: "정책 Tier 간 가격 범위가 겹칩니다" 에러가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **useFieldArray**: Tier 동적 추가/삭제를 위한 react-hook-form 패턴
- **즉시 반영**: 저장 성공 후 `router.refresh()`로 Server Component 데이터 갱신
- **원화 포맷**: 가격 필드에 실시간 쉼표 포맷팅

### :checkered_flag: Definition of Done (DoD)
- [ ] 현재 정책이 테이블 형태로 로드되는가?
- [ ] Tier 수정/추가/삭제가 가능한가?
- [ ] 저장 시 Server Action이 호출되는가?
- [ ] 에러 코드별 메시지가 올바르게 표시되는가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003 (PasscodeGuard ADMIN), API-SPEC-006 (DTO), LIB-001 (getPolicies)
- **Blocks**: BE-I-001 (Admin LTV Server Action)

---

## Issue #59: FE-I-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-I-003: Admin 매물 관리 테이블 — 전체 매물 CRUD 리스트뷰"
labels: 'frontend, ui, admin, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-I-003] Admin 매물 관리 테이블 뷰
- **목적**: Admin이 등록된 전체 매물을 테이블 형태로 확인하고, **Verified 상태 수동 변경**, **매물 삭제** 등의 관리 작업을 수행할 수 있는 CRUD 리스트뷰를 제공한다. B2B Route와 달리 민감 정보(`owner_contact`, `unit_number`)도 열람 가능하다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS Admin 기능: [`07_SRS_v1.0.md#3.6.4`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- DB-010: `LISTING_ADMIN_SELECT` (민감 필드 포함)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(admin)/listings/page.tsx` Server Component:
  - 전체 매물 조회 (민감 필드 포함 — Admin 권한)
  - Pagination Server Component 렌더링
- [ ] `src/app/(admin)/_components/listing-admin-table.tsx` Client Component:
  - shadcn/ui Table 컴포넌트 사용
  - 컬럼:
    | zone | property_type | asking_price | premium | is_verified | status | owner_contact | created_at | Actions |
  - **Actions 컬럼**:
    - ✅/❌ Verified 토글 버튼
    - 🗑️ 삭제 버튼 (확인 Dialog)
    - ✏️ 상태 변경 (ACTIVE/SOLD/WITHDRAWN) Select
  - 컬럼 헤더 정렬 클릭 가능 (asking_price, created_at)
- [ ] shadcn/ui 추가: `npx shadcn@latest add table dropdown-menu`
- [ ] Verified 토글: Server Action 호출 → `prisma.listing.update({ is_verified: !current })`
- [ ] 매물 삭제: 확인 Dialog → Server Action 호출 → `prisma.listing.delete()`

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 전체 매물 테이블 표시**
- **Given**: Admin 인증 후 매물 관리 페이지에 접속
- **When**: 테이블을 확인함
- **Then**: 모든 매물이 9개 컬럼으로 표시되고, `owner_contact`가 포함되어 있다.

**Scenario 2: Verified 수동 토글**
- **Given**: `is_verified: false`인 매물이 존재
- **When**: ✅ 토글 버튼을 클릭함
- **Then**: `is_verified: true`로 변경되고, verified_at이 현재 시간으로 갱신된다.

**Scenario 3: 매물 삭제**
- **Given**: 삭제할 매물의 🗑️ 버튼을 클릭함
- **When**: 확인 Dialog에서 "삭제"를 클릭함
- **Then**: 매물이 DB에서 삭제되고 테이블에서 사라진다.

**Scenario 4: 상태 변경**
- **Given**: ACTIVE 상태의 매물
- **When**: 상태 Select에서 'SOLD'를 선택함
- **Then**: DB가 업데이트되고 테이블에 즉시 반영된다.

### :gear: Technical & Non-Functional Constraints
- **LISTING_ADMIN_SELECT**: Admin만 민감 필드 열람 가능. 반드시 Admin select 상수 사용
- **삭제 확인**: 실수 방지를 위해 확인 Dialog 필수
- **Verified 수동 토글**: 교차검증 없이 Admin이 직접 Verified 상태를 변경 가능

### :checkered_flag: Definition of Done (DoD)
- [ ] Admin 테이블에 민감 필드(`owner_contact`)가 포함되어 있는가?
- [ ] Verified 토글이 동작하는가?
- [ ] 매물 삭제 시 확인 Dialog가 표시되는가?
- [ ] 상태 변경이 즉시 반영되는가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003 (PasscodeGuard ADMIN), DB-003 (Listing), DB-010 (LISTING_ADMIN_SELECT)
- **Blocks**: BE-I-002 (Admin 매물 Server Action)

---

## Issue #60: FE-I-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-I-004: Admin Lead 구독 관리 테이블 — 예산/지역 필터 + Export"
labels: 'frontend, ui, admin, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-I-004] Admin Lead 구독 관리 테이블
- **목적**: Admin이 수집된 Lead Gen 구독 데이터(예산, 관심 지역, 등록일)를 테이블로 관리하고, 향후 마케팅/영업에 활용하기 위한 뷰를 제공한다. CSV Export 버튼으로 데이터를 내보낼 수 있다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-007: Lead Gen 알림 구독 관리 (Admin)
- DB-007: Lead_Alert_Subscription 테이블

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(admin)/leads/page.tsx` Server Component:
  - Lead_Alert_Subscription 전체 조회
- [ ] `src/app/(admin)/_components/lead-admin-table.tsx` Client Component:
  - 컬럼: | budget | target_regions | status | created_at |
  - 필터: 예산 범위 Input (min~max), 지역 Select
  - **CSV Export 버튼**: 현재 필터 결과를 CSV 다운로드
    ```typescript
    function exportToCsv(data: LeadSubscription[]) {
      const csv = [
        'budget,regions,status,created_at',
        ...data.map(d => `${d.budget},${d.target_regions.join(';')},${d.status},${d.created_at}`)
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      // 다운로드 트리거
    }
    ```
  - 상태 변경: ACTIVE → PAUSED 토글

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Lead 테이블 표시**
- **Given**: Lead 구독 5건이 존재하는 상태
- **When**: Admin Lead 관리 페이지에 접속함
- **Then**: 5건이 4개 컬럼으로 테이블에 표시된다.

**Scenario 2: CSV Export**
- **Given**: 테이블에 데이터가 표시된 상태
- **When**: "CSV 내보내기" 버튼을 클릭함
- **Then**: `leads_export.csv` 파일이 다운로드된다.

**Scenario 3: 예산 범위 필터**
- **Given**: 다양한 예산의 구독이 존재하는 상태
- **When**: 예산 필터를 2억~5억으로 설정함
- **Then**: 해당 범위의 구독만 테이블에 표시된다.

### :gear: Technical & Non-Functional Constraints
- **CSV Export**: 브라우저 내에서 Blob 기반 클라이언트 사이드 생성. 서버 API 불필요
- **UTF-8 BOM**: 한글 CSV를 엑셀에서 올바르게 열기 위해 UTF-8 BOM (`\uFEFF`) 추가

### :checkered_flag: Definition of Done (DoD)
- [ ] Lead 구독 테이블이 표시되는가?
- [ ] CSV Export가 동작하는가?
- [ ] 예산 범위 필터가 동작하는가?
- [ ] CSV에 한글이 깨지지 않는가 (UTF-8 BOM)?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-003 (PasscodeGuard ADMIN), DB-007 (Lead_Alert_Subscription)
- **Blocks**: 없음

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~11** | INIT~BE-H-003 | ✅ 완료 (55개) |
| **Batch 12** | BE-H-004, FE-I-001~004 | ✅ **완료** |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
