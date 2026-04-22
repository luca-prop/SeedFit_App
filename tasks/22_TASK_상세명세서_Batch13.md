# TASK 상세 명세서 — Batch 13 (BE-I-001 ~ BE-I-003, BE-J-001 ~ BE-J-002)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 13 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 65/89

---

## Issue #61: BE-I-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-I-001: Admin LTV 정책 수정 Server Action — updateLtvPolicy()"
labels: 'backend, feature, admin, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-I-001] Admin LTV 정책 수정 Server Action
- **목적**: Admin 패스코드 검증 후 LTV_Policy 테이블의 Tier 데이터를 일괄 갱신(upsert)한다. 정책 수정 시 Tier 간 가격 범위 겹침을 서버에서 추가 검증하고, 성공 시 역산 결과에 즉시 반영(REQ-FUNC-006)된다. **DB Write: UPSERT (Transaction)**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-006: LTV 정책 변경 즉시 반영
- CON-03: 하드코딩 금지
- API-SPEC-006: `UpdateLtvPolicyInput`, `UpdateLtvPolicyOutput`, `ADMIN_ERRORS`
- RISK-01: 정책 급변 리스크

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/admin.ts` 파일 생성 (`'use server'`)
- [ ] `updateLtvPolicy()` 구현:
  ```typescript
  'use server';
  import { updateLtvPolicySchema } from '@/schemas/admin';
  import { ADMIN_ERRORS } from '@/types/admin';
  import { prisma } from '@/lib/prisma';

  export async function updateLtvPolicy(input: UpdateLtvPolicyInput): Promise<UpdateLtvPolicyOutput> {
    // Step 1: Admin 패스코드 검증
    if (input.passcode !== process.env.SECRET_ADMIN) {
      throw new Error(JSON.stringify(ADMIN_ERRORS.ADMIN_PASSCODE_MISMATCH));
    }

    // Step 2: Zod 서버 검증 (refine 포함)
    const parsed = updateLtvPolicySchema.parse(input);

    // Step 3: Tier 간 가격 범위 겹침 검증
    const sortedPolicies = [...parsed.policies].sort((a, b) => a.price_threshold_min - b.price_threshold_min);
    for (let i = 0; i < sortedPolicies.length - 1; i++) {
      if (sortedPolicies[i].price_threshold_max >= sortedPolicies[i + 1].price_threshold_min) {
        throw new Error(JSON.stringify(ADMIN_ERRORS.POLICY_OVERLAP));
      }
    }

    // Step 4: 트랜잭션으로 전체 Tier 갱신
    const result = await prisma.$transaction(async (tx) => {
      // 기존 정책 전체 삭제 후 재삽입 (간소화 전략)
      await tx.lTV_Policy.deleteMany({});

      const created = await tx.lTV_Policy.createMany({
        data: sortedPolicies.map(p => ({
          tier_label: p.tier_label,
          price_threshold_min: BigInt(p.price_threshold_min),
          price_threshold_max: BigInt(p.price_threshold_max),
          max_loan_amount: BigInt(p.max_loan_amount),
          effective_from: new Date(p.effective_from),
        })),
      });

      return created.count;
    });

    return {
      updated: true,
      effective_at: new Date().toISOString(),
      updated_count: result,
    };
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 3-Tier 정상 업데이트**
- **Given**: 유효한 Admin 패스코드 + 3-Tier 정책 데이터
- **When**: `updateLtvPolicy(input)`를 실행함
- **Then**: `updated: true`, `updated_count: 3`이 반환되고, DB에 3건이 갱신된다.

**Scenario 2: Admin 패스코드 불일치**
- **Given**: 잘못된 패스코드
- **When**: `updateLtvPolicy(input)`를 실행함
- **Then**: `ADMIN_PASSCODE_MISMATCH` 에러가 throw된다.

**Scenario 3: Tier 겹침 검증**
- **Given**: Tier 1 max(16억) >= Tier 2 min(15억)인 입력
- **When**: `updateLtvPolicy(input)`를 실행함
- **Then**: `POLICY_OVERLAP` 에러가 throw된다.

**Scenario 4: 즉시 반영 확인**
- **Given**: 정책 수정 후
- **When**: `reverseFilter()`를 실행함
- **Then**: 변경된 LTV 대출액이 역산 결과에 반영된다.

**Scenario 5: 트랜잭션 원자성**
- **Given**: 3-Tier 중 2번째에서 오류 발생
- **When**: 트랜잭션이 롤백됨
- **Then**: 기존 정책이 그대로 유지된다.

### :gear: Technical & Non-Functional Constraints
- **Delete + Create 전략**: 기존 Tier 전체 삭제 후 재삽입. upsert보다 단순하고, Tier 수 변경에도 대응
- **트랜잭션**: `$transaction` 필수. 삭제와 삽입 사이 불일치 방지
- **즉시 반영**: LIB-001(`getMaxLoanAmount`)이 매번 DB 직접 조회하므로, DB 갱신 즉시 반영
- **BigInt**: 입력은 number, DB 저장은 BigInt

### :checkered_flag: Definition of Done (DoD)
- [ ] `updateLtvPolicy()` Server Action이 구현되어 있는가?
- [ ] Admin 패스코드 검증이 동작하는가?
- [ ] Tier 겹침 검증이 동작하는가?
- [ ] 트랜잭션으로 원자적 갱신이 보장되는가?
- [ ] TEST-INT-004 (Admin LTV E2E)가 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-006 (LTV_Policy), API-SPEC-006 (DTO), INIT-003 (SECRET_ADMIN)
- **Blocks**: FE-I-002 (LTV 관리 폼 연동), TEST-INT-004 (E2E)

---

## Issue #62: BE-I-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-I-002: Admin 매물 관리 Server Actions — toggleVerified() / deleteListing()"
labels: 'backend, feature, admin, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-I-002] Admin 매물 관리 Server Actions
- **목적**: FE-I-003(Admin 매물 테이블)에서 호출하는 두 가지 관리 Server Action을 구현한다: (1) Verified 상태 수동 토글, (2) 매물 삭제. 모든 작업에 Admin 패스코드 검증이 선행된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- FE-I-003: Admin 매물 관리 테이블 (호출원)
- DB-003: Listing 테이블

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/admin-listing.ts` 파일 생성 (`'use server'`)
- [ ] `toggleVerified()` 구현:
  ```typescript
  'use server';
  export async function toggleVerified(listingId: string, passcode: string): Promise<{ is_verified: boolean }> {
    if (passcode !== process.env.SECRET_ADMIN) throw new Error('Unauthorized');

    const listing = await prisma.listing.findUniqueOrThrow({ where: { listing_id: listingId } });

    const updated = await prisma.listing.update({
      where: { listing_id: listingId },
      data: {
        is_verified: !listing.is_verified,
        verified_at: !listing.is_verified ? new Date() : null,
      },
    });

    return { is_verified: updated.is_verified };
  }
  ```
- [ ] `deleteListing()` 구현:
  ```typescript
  export async function deleteListing(listingId: string, passcode: string): Promise<{ deleted: boolean }> {
    if (passcode !== process.env.SECRET_ADMIN) throw new Error('Unauthorized');

    await prisma.listing.delete({ where: { listing_id: listingId } });
    return { deleted: true };
  }
  ```
- [ ] `updateListingStatus()` 구현:
  ```typescript
  export async function updateListingStatus(
    listingId: string,
    status: 'ACTIVE' | 'SOLD' | 'WITHDRAWN',
    passcode: string
  ): Promise<{ status: string }> {
    if (passcode !== process.env.SECRET_ADMIN) throw new Error('Unauthorized');

    const updated = await prisma.listing.update({
      where: { listing_id: listingId },
      data: { status },
    });
    return { status: updated.status };
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Verified 토글 (false → true)**
- **Given**: `is_verified: false`인 매물
- **When**: `toggleVerified(id, validPasscode)`를 실행함
- **Then**: `is_verified: true`가 반환되고, `verified_at`이 현재 시간으로 갱신된다.

**Scenario 2: Verified 토글 (true → false)**
- **Given**: `is_verified: true`인 매물
- **When**: `toggleVerified(id, validPasscode)`를 실행함
- **Then**: `is_verified: false`가 반환되고, `verified_at`이 null로 변경된다.

**Scenario 3: 매물 삭제**
- **Given**: 존재하는 매물 ID
- **When**: `deleteListing(id, validPasscode)`를 실행함
- **Then**: `deleted: true`가 반환되고, DB에서 삭제된다.

**Scenario 4: 패스코드 불일치 — 모든 Action**
- **Given**: 잘못된 패스코드
- **When**: 어떤 Admin Action이든 실행함
- **Then**: `Unauthorized` 에러가 throw된다.

### :gear: Technical & Non-Functional Constraints
- **패스코드 검증 반복**: 각 Action마다 패스코드 검증 수행. 세션 기반이 아닌 개별 요청 검증
- **Hard Delete**: MVP에서는 Soft Delete 미적용. 매물 삭제 시 DB에서 완전 제거

### :checkered_flag: Definition of Done (DoD)
- [ ] `toggleVerified`, `deleteListing`, `updateListingStatus` 3개 함수가 구현되어 있는가?
- [ ] 모든 함수에 패스코드 검증이 있는가?
- [ ] 토글 시 `verified_at`이 올바르게 갱신/null화 되는가?
- [ ] 삭제 후 DB에서 조회 시 404인가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-003 (Listing), INIT-003 (SECRET_ADMIN)
- **Blocks**: FE-I-003 (Admin 매물 테이블 — Action 연동)

---

## Issue #63: BE-I-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-I-003: Admin 구역/데이터 수동 CSV Import Server Action"
labels: 'backend, feature, admin, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-I-003] Admin 수동 CSV Import Server Action
- **목적**: 국토부 API 배치 수집(BE-J-001) 실패 시 **Plan B: 수동 업로드** 경로를 구현한다. Admin이 CSV 파일을 업로드하면, 서버에서 파싱하여 Zone/Curated/Bluechip 테이블에 upsert한다. Supabase 대시보드 직접 Import의 프로그래밍 대안이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-NF-018: Plan B 수동 업로드
- CON-02: 운영자 수동 CSV 업로드 방식
- Rollout: [`07_SRS_v1.0.md#6.7.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/admin-import.ts` 파일 생성 (`'use server'`)
- [ ] `importCsv()` 구현:
  ```typescript
  'use server';
  import { parse } from 'csv-parse/sync';

  type ImportTarget = 'zones' | 'curated_prices' | 'bluechip_prices';

  export async function importCsv(
    csvContent: string,
    target: ImportTarget,
    passcode: string
  ): Promise<{ imported_count: number; errors: string[] }> {
    // Step 1: Admin 패스코드 검증
    if (passcode !== process.env.SECRET_ADMIN) throw new Error('Unauthorized');

    // Step 2: CSV 파싱
    const records = parse(csvContent, { columns: true, skip_empty_lines: true });

    // Step 3: Target 테이블에 따른 upsert
    let importedCount = 0;
    const errors: string[] = [];

    for (const [index, record] of records.entries()) {
      try {
        if (target === 'zones') {
          await prisma.zone.upsert({
            where: { name: record.name },
            update: { ...mapZoneRecord(record), last_synced_at: new Date() },
            create: mapZoneRecord(record),
          });
        } else if (target === 'curated_prices') {
          await prisma.curated_Actual_Price_DB.upsert({ /* ... */ });
        } else if (target === 'bluechip_prices') {
          await prisma.bluechip_Reference_Price.upsert({ /* ... */ });
        }
        importedCount++;
      } catch (e) {
        errors.push(`Row ${index + 1}: ${(e as Error).message}`);
      }
    }

    return { imported_count: importedCount, errors };
  }
  ```
- [ ] CSV 레코드 → Prisma data 매핑 헬퍼 함수 (`mapZoneRecord`, `mapCuratedRecord`, `mapBluechipRecord`)
- [ ] 행별 에러 수집: 한 행의 실패가 전체 Import를 중단하지 않음
- [ ] `last_synced_at` 자동 갱신: Import 성공 시 해당 레코드의 동기화 시점 갱신

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Zone CSV Import 성공**
- **Given**: 10행의 유효한 Zone CSV 데이터
- **When**: `importCsv(csv, 'zones', validPasscode)`를 실행함
- **Then**: `imported_count: 10`, `errors: []`이 반환된다.

**Scenario 2: 부분 실패**
- **Given**: 10행 중 2행에 잘못된 데이터(누락 필수 필드)가 있는 CSV
- **When**: `importCsv(csv, 'zones', validPasscode)`를 실행함
- **Then**: `imported_count: 8`, `errors.length === 2`이고, 에러 행 번호가 포함된다.

**Scenario 3: upsert 동작 (기존 데이터 갱신)**
- **Given**: DB에 '장위4구역'이 이미 존재하는 상태
- **When**: '장위4구역'의 `stage`를 변경한 CSV를 Import함
- **Then**: 기존 레코드가 UPDATE되고, 새 레코드가 INSERT되지 않는다.

**Scenario 4: 패스코드 불일치**
- **Given**: 잘못된 패스코드
- **When**: Import를 시도함
- **Then**: `Unauthorized` 에러.

### :gear: Technical & Non-Functional Constraints
- **행별 에러 수집**: 한 행 실패 시 해당 행만 skip하고 다음 행 처리 계속
- **upsert**: Zone은 `name` 기준, Curated는 `apartment_name + district`, Bluechip는 `apartment_name + district` 기준
- **파일 크기 제한**: Vercel Hobby serverless 함수의 body 크기 제한(4.5MB) 고려
- **CSV 인코딩**: UTF-8 가정. EUC-KR 감지/변환은 Phase 2

### :checkered_flag: Definition of Done (DoD)
- [ ] `importCsv()` 함수가 zones/curated/bluechip 3개 target을 지원하는가?
- [ ] upsert로 동작하여 기존 데이터를 갱신하는가?
- [ ] 행별 에러 수집이 동작하는가 (전체 중단 없음)?
- [ ] Admin 패스코드 검증이 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-002, DB-004, DB-005 (테이블 스키마), INIT-003 (SECRET_ADMIN)
- **Blocks**: 없음 (Plan B 대비 기능으로 독립 완료 가능)

---

## Issue #64: BE-J-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-J-001: /api/cron/batch-molit — 국토부 실거래가 배치 수집 Cron Route Handler"
labels: 'backend, feature, cron, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-J-001] 국토부 실거래가 배치 수집 Cron Route Handler
- **목적**: Vercel Cron이 매일 새벽 3시(KST)에 자동 호출하는 `/api/cron/batch-molit` Route Handler를 구현한다. (1) 국토부 API 호출(9초 타임아웃) → (2) 응답 파싱(MolitTransaction) → (3) Curated_Actual_Price_DB upsert → (4) 실패 시 3회 재시도 → (5) 최종 실패 시 Slack 경고 + Plan B 전환 안내. **Plan A 배치 수집의 핵심 구현체**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- 배치 수집 시퀀스: [`07_SRS_v1.0.md#6.3.4`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) ⚠️ **필수 정독**
- REQ-NF-018: Vercel Cron 배치 시도 + 수동 업로드 Plan B
- CON-04: Vercel Hobby 10초 타임아웃
- API-SPEC-008: `MolitApiResponse`, `BatchResult`, `BATCH_RETRY_CONFIG`
- LIB-005: `sendSlackAlert()` — 실패 시 경고
- EXT-01: 국토부 실거래가 오픈 API

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/api/cron/batch-molit/route.ts` 파일 생성
- [ ] Route Handler 구현:
  ```typescript
  import { NextResponse } from 'next/server';
  import { BATCH_RETRY_CONFIG } from '@/types/batch-molit';
  import { sendSlackAlert } from '@/lib/slack-webhook';
  import { prisma } from '@/lib/prisma';

  export async function GET(request: NextRequest) {
    // Vercel Cron Secret 검증 (보안)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let retryCount = 0;
    let lastError: string | null = null;

    while (retryCount < BATCH_RETRY_CONFIG.MAX_RETRIES) {
      try {
        // Step 1: 국토부 API 호출 (AbortController + 9초 타임아웃)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), BATCH_RETRY_CONFIG.TIMEOUT_MS);

        const apiKey = process.env.MOLIT_API_KEY;
        const response = await fetch(
          `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev?serviceKey=${apiKey}&LAWD_CD=11&DEAL_YMD=202603&type=json`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`API responded with ${response.status}`);

        // Step 2: 응답 파싱
        const data: MolitApiResponse = await response.json();
        const items = data.response.body.items.item;

        // Step 3: Curated DB upsert
        let syncedCount = 0;
        for (const item of items) {
          const price = parseInt(item.dealAmount.replace(/,/g, '')) * 10000; // 만원 → 원
          await prisma.curated_Actual_Price_DB.upsert({
            where: {
              apartment_name_district: {
                apartment_name: item.aptNm,
                district: item.jibun, // 매핑 로직 필요
              },
            },
            update: { latest_actual_price: BigInt(price), last_synced_at: new Date() },
            create: {
              apartment_name: item.aptNm,
              district: item.jibun,
              latest_actual_price: BigInt(price),
              area_sqm: parseFloat(item.excluUseAr),
              last_synced_at: new Date(),
            },
          });
          syncedCount++;
        }

        // 성공
        return NextResponse.json({
          status: 'success',
          synced_count: syncedCount,
          last_synced_at: new Date().toISOString(),
        });

      } catch (error) {
        retryCount++;
        lastError = (error as Error).message;
        if (retryCount < BATCH_RETRY_CONFIG.MAX_RETRIES) {
          await new Promise(r => setTimeout(r, BATCH_RETRY_CONFIG.RETRY_DELAY_MS));
        }
      }
    }

    // 최종 실패 → Slack 경고
    await sendSlackAlert({
      title: '국토부 API 배치 수집 실패',
      message: `${BATCH_RETRY_CONFIG.MAX_RETRIES}회 재시도 모두 실패. Plan B(수동 CSV Import) 필요.`,
      level: 'critical',
      fields: [
        { title: 'Retry Count', value: String(retryCount) },
        { title: 'Error', value: lastError || 'Unknown' },
        { title: 'Action', value: 'Supabase 대시보드에서 CSV Import 또는 Admin CSV Import 사용' },
      ],
    });

    return NextResponse.json({
      status: 'failed',
      retry_count: retryCount,
      error_message: lastError,
    }, { status: 500 });
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 정상 배치 수집 성공**
- **Given**: 국토부 API가 정상 응답하는 상태
- **When**: `GET /api/cron/batch-molit`이 호출됨
- **Then**: `status: 'success'`, `synced_count > 0`, Curated DB가 갱신된다.

**Scenario 2: 타임아웃 → 재시도 → 성공**
- **Given**: 첫 시도에서 9초 초과로 타임아웃 발생, 2차 시도에서 성공
- **When**: Route Handler가 실행됨
- **Then**: `status: 'success'`가 반환된다 (1회 재시도 후 성공).

**Scenario 3: 3회 실패 → Slack 경고**
- **Given**: 국토부 API가 3회 모두 실패하는 상태
- **When**: Route Handler가 실행됨
- **Then**: `status: 'failed'`, Slack #dev-alert에 경고 메시지가 발송된다.

**Scenario 4: Cron Secret 미인증**
- **Given**: Authorization 헤더 없이 호출
- **When**: `GET /api/cron/batch-molit`이 호출됨
- **Then**: `401 Unauthorized` 반환. 배치 실행되지 않음.

**Scenario 5: 금액 변환 정확성**
- **Given**: 국토부 API가 `dealAmount: "90,000"`을 반환
- **When**: 파싱 로직을 확인함
- **Then**: `900000000` (9억 원)으로 변환된다.

### :gear: Technical & Non-Functional Constraints
- **CON-04**: Vercel Hobby 10초 타임아웃. `TIMEOUT_MS: 9000` (1초 여유)
- **AbortController**: 네이티브 `fetch` + `signal`로 타임아웃 구현. axios 의존성 추가 불필요
- **국토부 API 금액**: 만원 단위 문자열(쉼표 포함). `parseInt(remove comma) * 10000`으로 원 단위 변환
- **Cron Secret**: Vercel Dashboard에서 `CRON_SECRET` 환경 변수 설정. 외부 호출 방지
- **Vercel Hobby Cron**: 일 1회 제한. 새벽 3시 KST (UTC 18시) 실행

### :checkered_flag: Definition of Done (DoD)
- [ ] `/api/cron/batch-molit` Route Handler가 구현되어 있는가?
- [ ] AbortController로 9초 타임아웃이 적용되는가?
- [ ] 3회 재시도 로직이 동작하는가?
- [ ] 최종 실패 시 Slack 경고가 발송되는가?
- [ ] 국토부 API 금액이 올바르게 원 단위로 변환되는가?
- [ ] Cron Secret 인증이 동작하는가?
- [ ] TEST-INT-003 (배치 통합 테스트)이 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-004 (Curated), API-SPEC-008 (DTO + 상수), LIB-005 (Slack), INIT-003 (MOLIT_API_KEY, CRON_SECRET)
- **Blocks**: BE-J-002 (vercel.json 설정), TEST-INT-003 (통합 테스트)

---

## Issue #65: BE-J-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-J-002: vercel.json Cron 스케줄 + runtime 설정"
labels: 'backend, infra, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-J-002] vercel.json Cron 스케줄 및 런타임 설정
- **목적**: Vercel Cron Job이 매일 새벽 3시(KST)에 `/api/cron/batch-molit`을 자동 호출하도록 `vercel.json`을 설정한다. 동시에 Serverless Function의 최대 실행 시간(`maxDuration`)을 설정한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- CON-04: Vercel Hobby 10초 타임아웃
- API-SPEC-008: Cron 스케줄 정의 (`0 18 * * *` UTC = 새벽 3시 KST)
- Vercel Docs: [Cron Jobs](https://vercel.com/docs/cron-jobs)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] 프로젝트 루트에 `vercel.json` 생성/수정:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/batch-molit",
        "schedule": "0 18 * * *"
      }
    ]
  }
  ```
  - `0 18 * * *` = UTC 18:00 = KST 03:00 (새벽 3시)
- [ ] Vercel Dashboard에서 환경 변수 설정 확인:
  - `CRON_SECRET`: Cron 인증용 (Vercel 자동 주입)
  - `MOLIT_API_KEY`: 국토부 API 키
  - `SLACK_WEBHOOK_URL`: Slack 알림용

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: vercel.json 유효성**
- **Given**: `vercel.json`이 존재하는 상태
- **When**: JSON 구조를 확인함
- **Then**: `crons` 배열에 `/api/cron/batch-molit` 경로와 `0 18 * * *` 스케줄이 정의되어 있다.

**Scenario 2: 배포 후 Cron 등록 확인**
- **Given**: Vercel에 배포된 상태
- **When**: Vercel Dashboard > Settings > Cron Jobs를 확인함
- **Then**: batch-molit Cron이 등록되어 있고, 다음 실행 시간이 KST 03:00으로 표시된다.

### :gear: Technical & Non-Functional Constraints
- **Vercel Hobby 제한**: Cron 일 1회. 복수 Cron 등록 불가 (Hobby 플랜)
- **UTC 기준**: Vercel Cron은 UTC 기준. KST(-9h) 역산 필요
- **CRON_SECRET**: Vercel이 자동으로 `CRON_SECRET` 환경 변수를 생성하고, Cron 호출 시 `Authorization: Bearer <CRON_SECRET>` 헤더에 포함

### :checkered_flag: Definition of Done (DoD)
- [ ] `vercel.json`에 Cron 설정이 존재하는가?
- [ ] 스케줄이 `0 18 * * *` (KST 03:00)인가?
- [ ] path가 `/api/cron/batch-molit`인가?

### :construction: Dependencies & Blockers
- **Depends on**: BE-J-001 (Cron Route Handler 구현)
- **Blocks**: NFR-010 (배포 후 Cron 동작 검증)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~12** | INIT~FE-I | ✅ 완료 (60개) |
| **Batch 13** | BE-I-001~003, BE-J-001~002 | ✅ **완료** |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
