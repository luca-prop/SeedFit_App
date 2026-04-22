# TASK 상세 명세서 — Batch 05 (API-SPEC-007 ~ API-SPEC-008, MOCK-001 ~ MOCK-003)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 5 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 25/89

---

## Issue #21: API-SPEC-007

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-007: Lead Gen 알림 구독 Server Action DTO 및 Zod 스키마 정의"
labels: 'api-contract, backend, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-007] Lead Gen 알림 구독 Server Action 통신 계약 정의
- **목적**: `app/actions/lead.ts`(API-08)의 `subscribeLeadAlert()` Server Action 입출력을 정의한다. 역산 결과 0건 시 표시되는 Lead Gen 버튼 클릭 이벤트를 처리하여, 사용자의 예산과 관심 지역을 DB에 저장하는 구독 등록 계약이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-08`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-004: 매칭 0건 시 Lead Gen 버튼
- REQ-FUNC-007: Lead Gen 알림 구독 등록
- 역산 시퀀스 (opt): [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/lead.ts` 파일 생성
- [ ] Input DTO:
  ```typescript
  export interface SubscribeLeadAlertInput {
    budget: number;          // 알림 기준 예산 (KRW)
    regions?: string[];      // 관심 지역 목록 (optional)
    contact_method?: string; // 연락 수단 (email/phone, MVP에서는 단순 저장)
  }
  ```
- [ ] Output DTO:
  ```typescript
  export interface SubscribeLeadAlertOutput {
    subscription_id: string;
    status: 'active';
    message: string; // "알림 등록이 완료되었습니다"
  }
  ```
- [ ] `src/schemas/lead.ts` Zod 스키마:
  ```typescript
  export const subscribeLeadAlertSchema = z.object({
    budget: z.number().int().positive('예산은 양수여야 합니다').min(10000000, '최소 1,000만 원 이상'),
    regions: z.array(z.string()).optional(),
    contact_method: z.string().max(200).optional(),
  });
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 정상 구독 등록**
- **Given**: `{ budget: 300000000, regions: ['성북구'] }`이 주어짐
- **When**: subscribeLeadAlertSchema를 검증함
- **Then**: 에러 없이 파싱되고 regions가 ['성북구']이다.

**Scenario 2: 예산 음수 입력**
- **Given**: `{ budget: -100 }`이 주어짐
- **When**: subscribeLeadAlertSchema를 검증함
- **Then**: '예산은 양수여야 합니다' 에러가 반환된다.

**Scenario 3: Output 구조**
- **Given**: 구독이 성공한 상태
- **When**: SubscribeLeadAlertOutput을 확인함
- **Then**: `subscription_id`가 UUID이고, `status`가 `'active'`이다.

### :gear: Technical & Non-Functional Constraints
- **MVP 범위**: 실제 알림 발송(Push/Email)은 MVP 범위 밖. 구독 데이터 수집만 수행
- **B2C 비로그인**: 사용자 식별은 임시 UUID 생성 또는 브라우저 fingerprint로 처리 (MVP 단순화)

### :checkered_flag: Definition of Done (DoD)
- [ ] Input/Output DTO가 정의되어 있는가?
- [ ] Zod 스키마의 budget 최소값 검증이 동작하는가?
- [ ] Output에 `subscription_id`와 `status`가 포함되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-F-002 (Lead Gen Server Action 구현), FE-F-003 (Lead Gen 버튼 UI)

---

## Issue #22: API-SPEC-008

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-008: 국토부 API 배치 수집 Cron Route Handler Input/Output 정의"
labels: 'api-contract, backend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-008] 국토부 API 배치 수집 Cron Route Handler 통신 계약 정의
- **목적**: `/api/cron/batch-molit`(API-09) Vercel Cron Route Handler의 입출력, 재시도 로직 인터페이스, Slack 경고 페이로드를 정의한다. **Plan A(Cron 배치) 실패 시 Plan B(수동 업로드) 전환**의 판단 기준과 에러 처리 흐름을 문서화한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-09`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 배치 수집 시퀀스: [`07_SRS_v1.0.md#6.3.4`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-NF-018: Vercel Cron 배치 시도 + 수동 업로드 Plan B
- CON-04: Vercel Hobby 10초 타임아웃 제약
- EXT-01: 국토부 실거래가 오픈 API

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/batch-molit.ts` 파일 생성
- [ ] 국토부 API 응답 타입 (외부 계약):
  ```typescript
  export interface MolitApiResponse {
    response: {
      header: { resultCode: string; resultMsg: string };
      body: {
        items: { item: MolitTransaction[] };
        totalCount: number;
      };
    };
  }

  export interface MolitTransaction {
    aptNm: string;        // 아파트명
    dealAmount: string;    // 거래금액 (만원, 쉼표 포함 문자열)
    excluUseAr: string;    // 전용면적
    dealYear: string;
    dealMonth: string;
    dealDay: string;
    jibun: string;
    floor: string;
  }
  ```
- [ ] 내부 처리 결과 타입:
  ```typescript
  export interface BatchResult {
    status: 'success' | 'partial' | 'failed';
    synced_count: number;
    failed_count: number;
    last_synced_at: string | null;
    retry_count: number;
    error_message?: string;
  }
  ```
- [ ] Slack 경고 페이로드:
  ```typescript
  export interface SlackBatchAlert {
    channel: '#dev-alert';
    text: string; // "🚨 국토부 API 배치 수집 실패 - Plan B 수동 업로드 필요"
    attachments: [{
      color: 'danger' | 'warning' | 'good';
      fields: [
        { title: 'Retry Count'; value: string },
        { title: 'Error'; value: string },
        { title: 'Action Required'; value: 'Supabase 대시보드에서 CSV Import 필요' },
      ];
    }];
  }
  ```
- [ ] Cron 설정 스키마 (`vercel.json`):
  ```json
  {
    "crons": [{
      "path": "/api/cron/batch-molit",
      "schedule": "0 3 * * *"
    }]
  }
  ```
- [ ] 재시도 정책 상수:
  ```typescript
  export const BATCH_RETRY_CONFIG = {
    MAX_RETRIES: 3,
    TIMEOUT_MS: 9000,  // Vercel Hobby 10초 제한 → 1초 여유
    RETRY_DELAY_MS: 1000,
  } as const;
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 국토부 API 정상 응답 파싱**
- **Given**: 국토부 API가 정상 JSON을 반환한 상태
- **When**: MolitApiResponse 타입으로 파싱함
- **Then**: `response.body.items.item` 배열에 MolitTransaction 객체들이 존재한다.

**Scenario 2: BatchResult 성공 케이스**
- **Given**: 배치 수집이 완료된 상태
- **When**: BatchResult를 확인함
- **Then**: `status: 'success'`, `synced_count > 0`, `last_synced_at`이 현재 시간이다.

**Scenario 3: BatchResult 실패 케이스 (Plan B 전환)**
- **Given**: 3회 재시도 모두 실패한 상태
- **When**: BatchResult를 확인함
- **Then**: `status: 'failed'`, `retry_count: 3`, `error_message`가 존재하고, Slack 경고가 발송되어야 한다.

**Scenario 4: 타임아웃 제한**
- **Given**: BATCH_RETRY_CONFIG이 정의된 상태
- **When**: TIMEOUT_MS를 확인함
- **Then**: 9000ms (9초)로, Vercel Hobby 10초 제한에 1초 여유를 둔다.

### :gear: Technical & Non-Functional Constraints
- **CON-04**: Vercel Hobby 10초 타임아웃 엄수. API 호출 시 `AbortController` + `setTimeout(9000)` 사용
- **국토부 API 특성**: 응답 필드명이 한글 혼재 + 금액이 문자열(쉼표 포함). 파싱 시 변환 필요 (`dealAmount: "90,000"` → `900000000`)
- **Rate Limit**: 국토부 API 일일 호출 제한 존재. 배치 1회에 필요한 구역 수 × 호출 = 총 호출 수가 제한 내에 있어야 함
- **Cron 스케줄**: 매일 새벽 3시(KST) 실행. Vercel Hobby: 일 1회 제한

### :checkered_flag: Definition of Done (DoD)
- [ ] 국토부 API 응답 타입(MolitApiResponse, MolitTransaction)이 정의되어 있는가?
- [ ] BatchResult 타입에 success/partial/failed 상태가 정의되어 있는가?
- [ ] Slack 경고 페이로드 타입이 정의되어 있는가?
- [ ] 재시도 정책 상수(MAX_RETRIES, TIMEOUT_MS)가 정의되어 있는가?
- [ ] `vercel.json` Cron 스케줄이 문서화되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: BE-J-001 (배치 Cron 구현), BE-J-002 (vercel.json 설정), LIB-005 (Slack Webhook), TEST-INT-003 (배치 통합 테스트)

---

## Issue #23: MOCK-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-001: 초기 Seed 데이터 CSV — 서울 주요 50개 구역(Zone) 정보"
labels: 'data, seed, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-001] Zone 테이블 초기 Seed CSV 작성
- **목적**: MVP Closed Beta에서 시스템이 즉시 동작할 수 있도록 서울 주요 50개 재개발 구역의 실제 데이터를 CSV로 가공한다. 이 데이터는 역산 필터(BE-F-001), 대시보드(BE-G-001), 그리고 B2B 매물 등록 시 구역 선택의 기반이 된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS Rollout: [`07_SRS_v1.0.md#6.7.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) "서울 주요 50개 구역 데이터를 엑셀로 가공"
- Zone 데이터 모델: [`07_SRS_v1.0.md#6.2.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- CON-02: 운영자 수동 CSV 업로드 방식
- Beta 대상 지역: 장위, 노량진 등 핵심 권역

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed-data/zones.csv` 파일 생성
- [ ] CSV 컬럼 구조 (Zone 테이블과 1:1 매핑):
  ```
  name,district,stage,total_units,estimated_ratio,avg_rights_value,latitude,longitude,data_source
  ```
- [ ] 서울 주요 재개발 구역 50건 데이터 수집 및 입력:
  - **핵심 권역 (15건)**: 장위뉴타운(성북), 노량진뉴타운(동작), 흑석뉴타운(동작), 한남뉴타운(용산), 이문·휘경(동대문) 등
  - **주요 권역 (20건)**: 영등포, 마포, 은평, 강북, 도봉, 노원, 동대문, 관악 등 주요 구 재개발 구역
  - **추가 권역 (15건)**: 서초, 강동, 송파, 광진, 중랑 등 분산 구역
- [ ] 각 구역의 `stage` 값을 실제 사업 단계로 입력 (8단계 ENUM 기준)
- [ ] `avg_rights_value`, `estimated_ratio` 등은 공공 데이터 기반 추정치 입력
- [ ] `data_source: '수동업로드'` 고정
- [ ] `latitude`, `longitude`: Google Maps 기반 참고용 좌표 입력

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: CSV 파일 구조 검증**
- **Given**: `zones.csv` 파일이 생성된 상태
- **When**: 첫 번째 행(헤더)을 확인함
- **Then**: Zone 테이블의 필수 필드에 매핑되는 컬럼명이 존재한다.

**Scenario 2: 데이터 건수 검증**
- **Given**: CSV 파일이 완성된 상태
- **When**: 데이터 행 수를 카운트함
- **Then**: 50건 이상이다.

**Scenario 3: 필수 필드 누락 없음**
- **Given**: CSV의 각 행을 확인함
- **When**: `name`, `district`, `stage` 컬럼을 검사함
- **Then**: 빈 값이 없다.

**Scenario 4: district 분포 확인**
- **Given**: 50건의 구역 데이터가 있는 상태
- **When**: `district` 값의 유니크 수를 확인함
- **Then**: 15개 이상의 서로 다른 행정구가 존재한다 (서울 25개 구 중 과반).

### :gear: Technical & Non-Functional Constraints
- **실데이터 기반**: 가급적 공공 데이터 포털, 정비사업 조합 공시 자료 등을 참조하여 현실적인 값 입력
- **CSV UTF-8**: 한글 인코딩은 UTF-8 (BOM 없음). Supabase CSV Import 호환
- **stage ENUM 매핑**: CSV의 stage 값은 Prisma `ZoneStage` ENUM 값과 정확히 일치해야 함

### :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/seed-data/zones.csv` 파일이 존재하는가?
- [ ] 50건 이상의 구역 데이터가 포함되어 있는가?
- [ ] 모든 필수 필드(name, district, stage)에 빈 값이 없는가?
- [ ] `stage` 값이 ZoneStage ENUM 값과 일치하는가?
- [ ] 15개 이상의 서로 다른 district가 존재하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-002 (Zone 테이블 스키마 확정)
- **Blocks**: MOCK-006 (Seed 스크립트), BE-F-001 (역산 알고리즘 — 데이터 필요)

---

## Issue #24: MOCK-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-002: 초기 Seed 데이터 CSV — Curated_Actual_Price_DB 구별 대표 아파트 30건"
labels: 'data, seed, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-002] Curated_Actual_Price_DB 초기 Seed CSV 작성
- **목적**: 1:1 대조 대시보드(BE-G-001)에서 기축 아파트 3개 이상 자동 추천(REQ-FUNC-008) 및 전고점 회복률 산출(REQ-FUNC-010)에 사용되는 **구별·금액대별 대표 아파트 실거래가 데이터** 30건 이상을 CSV로 가공한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.4`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- Rollout: [`07_SRS_v1.0.md#6.7.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) "9억대, 12억대 등 금액대별 비교 대상 아파트"
- REQ-FUNC-008: LTV 기반 기축 아파트 3개 이상 자동 추천
- REQ-FUNC-010: 전고점 대비 회복률(%) 표시

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed-data/curated_prices.csv` 파일 생성
- [ ] CSV 컬럼 구조:
  ```
  district,price_tier,apartment_name,latest_actual_price,peak_price_2122,recovery_rate,area_sqm
  ```
- [ ] 금액대별 분포 (최소 30건):
  - **6억대 (5건)**: 도봉구, 노원구, 중랑구, 강북구, 은평구 대표 아파트
  - **9억대 (8건)**: 성북구, 동대문구, 마포구, 동작구, 영등포구, 관악구, 강서구, 양천구
  - **12억대 (7건)**: 성동구, 광진구, 용산구, 서초구, 송파구, 강동구, 중구
  - **15억대 이상 (5건)**: 강남구, 서초구, 송파구 고가 단지
  - **기타 금액대 (5건+)**: 범위 분산 보장
- [ ] 각 아파트의 실거래가, 21-22년 전고점, 회복률 산출:
  - `recovery_rate = (latest_actual_price / peak_price_2122) * 100`
- [ ] 국토부 실거래가 공공데이터 또는 네이버 부동산 기준 현실적 값 입력

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 데이터 건수 검증**
- **Given**: `curated_prices.csv`가 완성된 상태
- **When**: 데이터 행 수를 카운트함
- **Then**: 30건 이상이다.

**Scenario 2: 금액대별 분포 검증**
- **Given**: CSV 데이터가 존재하는 상태
- **When**: `price_tier` 컬럼의 유니크 값을 확인함
- **Then**: 최소 4개 이상의 서로 다른 금액대가 존재한다.

**Scenario 3: 회복률 계산 정합성**
- **Given**: `latest_actual_price: 900000000`, `peak_price_2122: 1100000000`인 행이 있는 상태
- **When**: `recovery_rate`를 확인함
- **Then**: `81.82` (소수점 2자리)와 일치한다.

**Scenario 4: 구별 3건 이상 보장**
- **Given**: 대시보드에서 특정 구(예: '성북구')로 필터링함
- **When**: 해당 district의 데이터 건수를 확인함
- **Then**: 최소 1건 이상 존재하고, 금액대별로 가용 현금에 따라 3개 추천이 가능한 분포이다.

### :gear: Technical & Non-Functional Constraints
- **국토부 실거래가 기준**: 최신 실거래가는 2026년 1분기 기준. 최대 30일 시차 허용
- **금액 단위**: KRW 원 단위 (만원 아님). CSV에 `900000000` 형태로 저장
- **recovery_rate**: 소수점 2자리. `peak_price_2122`가 NULL인 경우 `recovery_rate`도 NULL

### :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/seed-data/curated_prices.csv` 파일이 존재하는가?
- [ ] 30건 이상의 데이터가 포함되어 있는가?
- [ ] 4개 이상의 서로 다른 `price_tier`가 존재하는가?
- [ ] `recovery_rate`가 수식과 일치하는가?
- [ ] 금액이 원 단위(KRW)로 저장되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-004 (Curated_Actual_Price_DB 스키마 확정)
- **Blocks**: MOCK-006 (Seed 스크립트), BE-G-001 (대시보드 기축 매칭)

---

## Issue #25: MOCK-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Mock] MOCK-003: 초기 Seed 데이터 CSV — Bluechip_Reference_Price 신축 대장 단지 20건"
labels: 'data, seed, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [MOCK-003] Bluechip_Reference_Price 초기 Seed CSV 작성
- **목적**: 1:1 대조 대시보드(BE-G-001)에서 재개발 구역의 미래 가치(Potential Price)를 산정(REQ-FUNC-009)할 때 참조하는 **동일 행정구 내 신축 대장 단지** 데이터 20건 이상을 CSV로 가공한다. `district` 텍스트 매칭의 실질적 대상 데이터이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.5`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- Spec-Down ②: PostGIS 제거 → `district` 텍스트 매칭
- REQ-FUNC-009: 동일 행정구 신축 대장 단지 미래 가치 산정
- REQ-FUNC-012: 동일 행정구 부재 시 인접 행정구 확장
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/seed-data/bluechip_prices.csv` 파일 생성
- [ ] CSV 컬럼 구조:
  ```
  zone_id_ref,apartment_name,district,distance_km,area_sqm,actual_price
  ```
  - `zone_id_ref`: MOCK-001의 Zone name과 매핑 가능한 참조 값 (Seed 스크립트에서 실제 UUID로 변환)
- [ ] 서울 주요 구별 신축 대장 단지 20건 이상 입력:
  - **성북구**: 래미안 등 (장위뉴타운 대응)
  - **동작구**: 아크로리버하임 등 (노량진 대응)
  - **용산구**: 래미안 첼리투스 등 (한남뉴타운 대응)
  - **동대문구**: 래미안 크레시티 등 (이문·휘경 대응)
  - **강남구, 서초구, 송파구**: 고가 대장 단지
  - **기타 구**: 분산 커버리지 보장
- [ ] 각 단지의 최신 실거래가(2026년 기준) 입력
- [ ] `distance_km`: 구역 중심부로부터의 대략적 거리 (참고용)
- [ ] **인접 행정구 테스트용**: 의도적으로 1~2개 구는 Bluechip 데이터를 비워두어, REQ-FUNC-012(인접 확장)의 테스트 시나리오 대응

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 데이터 건수 검증**
- **Given**: `bluechip_prices.csv`가 완성된 상태
- **When**: 데이터 행 수를 카운트함
- **Then**: 20건 이상이다.

**Scenario 2: district 매칭 가능성 검증**
- **Given**: MOCK-001의 Zone 데이터와 MOCK-003의 Bluechip 데이터가 존재
- **When**: Zone의 `district`와 Bluechip의 `district`를 교차 확인함
- **Then**: 최소 10개 이상의 district가 양쪽에 공통으로 존재한다.

**Scenario 3: 인접 행정구 테스트 데이터 확인**
- **Given**: CSV 데이터가 완성된 상태
- **When**: MOCK-001 Zone에는 존재하지만 MOCK-003 Bluechip에는 없는 district를 확인함
- **Then**: 1~2개의 district가 의도적으로 비어있어, 인접 확장 로직 테스트가 가능하다.

**Scenario 4: 금액 현실성 검증**
- **Given**: 강남구 대장 단지의 `actual_price`를 확인함
- **When**: 현실 시세와 비교함
- **Then**: 2026년 시장가 기준 ±20% 이내의 현실적 값이다.

### :gear: Technical & Non-Functional Constraints
- **`zone_id_ref`**: CSV에서는 Zone name을 참조키로 사용. Seed 스크립트(MOCK-006)에서 실제 UUID로 변환
- **district 일관성**: MOCK-001(Zone)과 MOCK-003(Bluechip)의 `district` 표기가 정확히 일치해야 함 (예: "성북구" ≠ "성북")
- **인접 행정구 매핑**: 인접 행정구 목록은 BE-G-001에서 정의. 이 데이터에서는 누락 district만 의도적으로 생성

### :checkered_flag: Definition of Done (DoD)
- [ ] `prisma/seed-data/bluechip_prices.csv` 파일이 존재하는가?
- [ ] 20건 이상의 데이터가 포함되어 있는가?
- [ ] MOCK-001 Zone과 10개 이상의 공통 district가 존재하는가?
- [ ] 1~2개의 의도적 district 누락이 존재하는가 (인접 확장 테스트)?
- [ ] district 표기가 MOCK-001과 정확히 일치하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-005 (Bluechip 스키마 확정), MOCK-001 (Zone CSV — district 일관성 보장)
- **Blocks**: MOCK-006 (Seed 스크립트), BE-G-001 (대시보드 미래 가치 산정)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001~004, DB-001 | ✅ 완료 |
| **Batch 02** | DB-002~006 | ✅ 완료 |
| **Batch 03** | DB-007~010, API-SPEC-001 | ✅ 완료 |
| **Batch 04** | API-SPEC-002~006 | ✅ 완료 |
| **Batch 05** | API-SPEC-007~008, MOCK-001~003 | ✅ **완료** |
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
