# TASK 상세 명세서 — Batch 03 (DB-007 ~ DB-010, API-SPEC-001)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 3 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 15/89

---

## Issue #11: DB-007

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-007: Prisma Schema — Lead_Alert_Subscription(매물 출현 알림 구독) 테이블"
labels: 'database, backend, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-007] Lead_Alert_Subscription 테이블 Prisma Schema 작성
- **목적**: 역산 필터링 결과 매칭 구역 0건 시 노출되는 "예산 내 매물 출현 시 알림 받기" Lead Gen 버튼의 구독 데이터를 저장한다. 사용자의 예산과 관심 지역을 기록하여, 향후 매칭 매물 등록 시 알림을 발송할 수 있는 기반 데이터를 확보한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.7 Lead_Alert_Subscription`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD 관계: User → Lead_Alert_Subscription (subscribes)
- REQ-FUNC-004: 매칭 0건 시 안내 + Lead Gen 버튼
- REQ-FUNC-007: Lead Gen 알림 구독 등록
- 역산 시퀀스: [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (opt: Lead Gen 버튼 클릭 흐름)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `Lead_Alert_Subscription` 모델 정의:
  ```prisma
  model Lead_Alert_Subscription {
    subscription_id String             @id @default(uuid())
    user_id         String
    budget          BigInt             // 알림 기준 예산 (KRW)
    target_regions  String[]           @default([])
    status          SubscriptionStatus @default(ACTIVE)
    created_at      DateTime           @default(now())

    user            User               @relation(fields: [user_id], references: [user_id])
  }

  enum SubscriptionStatus {
    ACTIVE
    PAUSED
    CANCELLED
  }
  ```
- [ ] User 모델에 `subscriptions Lead_Alert_Subscription[]` 관계 필드 활성화
- [ ] `npx prisma migrate dev --name add-lead-alert-subscription` 실행
- [ ] `npx prisma generate` 실행

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 알림 구독 생성**
- **Given**: User가 존재하는 상태
- **When**: `prisma.lead_Alert_Subscription.create({ data: { user_id, budget: 300000000n, target_regions: ['성북구', '동대문구'], status: 'ACTIVE' } })`를 실행함
- **Then**: 레코드가 정상 생성되고 `status`가 `ACTIVE`이다.

**Scenario 2: 구독 상태 변경**
- **Given**: ACTIVE 상태의 구독이 존재하는 상태
- **When**: `prisma.lead_Alert_Subscription.update({ where: { subscription_id }, data: { status: 'PAUSED' } })`를 실행함
- **Then**: `status`가 `PAUSED`로 변경된다.

**Scenario 3: 사용자별 구독 목록 조회**
- **Given**: 특정 User에 구독 2건이 존재하는 상태
- **When**: `prisma.lead_Alert_Subscription.findMany({ where: { user_id } })`를 실행함
- **Then**: 2건이 반환된다.

### :gear: Technical & Non-Functional Constraints
- **MVP 범위**: 알림 발송 로직 자체는 MVP 범위 밖 (구독 데이터 수집만 수행)
- **BigInt**: 예산 금액은 `BigInt` 타입 사용
- **String[]**: `target_regions`는 PostgreSQL의 text array, SQLite에서는 JSON으로 시뮬레이션

### :checkered_flag: Definition of Done (DoD)
- [ ] 모델이 SRS §6.2.7 명세의 모든 필드(6개)를 포함하는가?
- [ ] `SubscriptionStatus` ENUM이 3개 값을 정의하는가?
- [ ] FK(user_id→User)가 정상 연결되어 있는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 (User - FK 참조)
- **Blocks**: BE-F-002 (Lead Gen Server Action)

---

## Issue #12: DB-008

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-008: Prisma Schema — B2B_Partner(B2B 파트너 중개사) 테이블"
labels: 'database, backend, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-008] B2B_Partner 테이블 Prisma Schema 작성
- **목적**: B2B 파트너 중개사의 기본 정보(사업자등록번호, 상호명, 담당 거점)를 관리한다. Admin이 `/(admin)/partners` 패널에서 활성/비활성 토글을 관리하며, **Spec-Down ③에 따라 복잡한 인증 만료 관리 없이 시크릿 패스코드 + 기본 파트너 정보 관리로 단순화**되었다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.8 B2B_Partner`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD 관계: User → B2B_Partner (has partner profile, 1:1)
- Spec-Down ③: 복잡한 인증 → 시크릿 패스코드 (C-TEC-009)
- ASM-04: MVP 기간 B2B 파트너 5곳 이내 한정
- UC-12: B2B 파트너 패스코드 관리

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `B2B_Partner` 모델 정의:
  ```prisma
  model B2B_Partner {
    partner_id          String   @id @default(uuid())
    user_id             String   @unique // 1:1 관계
    business_license_no String   @unique @db.VarChar(50)
    partner_name        String   @db.VarChar(100)
    coverage_zones      String[] @default([])
    is_active           Boolean  @default(true)
    created_at          DateTime @default(now())
    updated_at          DateTime @updatedAt

    user                User     @relation(fields: [user_id], references: [user_id])
  }
  ```
- [ ] User 모델에 `partner B2B_Partner?` 관계 필드 활성화 (1:1 Optional)
- [ ] `npx prisma migrate dev --name add-b2b-partner` 실행
- [ ] `npx prisma generate` 실행

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 파트너 등록**
- **Given**: B2B 역할의 User가 존재하는 상태
- **When**: `prisma.b2B_Partner.create({ data: { user_id, business_license_no: '123-45-67890', partner_name: '장위부동산', coverage_zones: ['성북구', '동대문구'] } })`를 실행함
- **Then**: 레코드가 정상 생성되고 `is_active`가 `true`(기본값)이다.

**Scenario 2: 사업자등록번호 UNIQUE 제약**
- **Given**: '123-45-67890'으로 파트너가 이미 존재하는 상태
- **When**: 동일한 `business_license_no`로 새 파트너 생성을 시도함
- **Then**: UNIQUE 제약 위반 에러가 발생한다.

**Scenario 3: Admin 비활성화 토글**
- **Given**: 활성 상태(`is_active: true`)의 파트너가 존재하는 상태
- **When**: Admin이 `prisma.b2B_Partner.update({ where: { partner_id }, data: { is_active: false } })`를 실행함
- **Then**: `is_active`가 `false`로 변경된다.

**Scenario 4: 1:1 관계 검증**
- **Given**: 이미 B2B_Partner가 연결된 User가 있는 상태
- **When**: 동일한 `user_id`로 또 다른 B2B_Partner 생성을 시도함
- **Then**: UNIQUE 제약(`user_id`) 위반 에러가 발생한다.

### :gear: Technical & Non-Functional Constraints
- **ASM-04**: MVP 기간 중 파트너는 5곳 이내. 대규모 파트너 관리 로직 불필요
- **C-TEC-009**: 파트너 인증은 시크릿 패스코드로 수행. B2B_Partner 테이블은 프로필 정보 관리만 담당
- **`user_id` UNIQUE**: User:B2B_Partner = 1:1 관계. 한 User에 하나의 파트너 프로필만 허용

### :checkered_flag: Definition of Done (DoD)
- [ ] 모델이 SRS §6.2.8 명세의 모든 필드(8개)를 포함하는가?
- [ ] `business_license_no`에 UNIQUE 제약이 있는가?
- [ ] `user_id`에 UNIQUE 제약이 있는가 (1:1 관계)?
- [ ] FK(user_id→User)가 정상 연결되어 있는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 (User - FK 참조)
- **Blocks**: MOCK-005 (테스트 파트너 Seed), BE-I-003 (Admin 파트너 관리)

---

## Issue #13: DB-009

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-009: Prisma 전체 마이그레이션 통합 실행 및 ERD 검증"
labels: 'database, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-009] Prisma 전체 마이그레이션 통합 실행 및 ERD 자동 생성 검증
- **목적**: DB-001~008에서 개별적으로 작성한 8개 엔터티(User, Zone, Listing, Curated_Actual_Price_DB, Bluechip_Reference_Price, LTV_Policy, Lead_Alert_Subscription, B2B_Partner)의 전체 스키마를 통합 마이그레이션하고, 모든 FK 관계·인덱스·ENUM이 정상적으로 생성되었는지 검증한다. 로컬 SQLite 및 Supabase PostgreSQL 양쪽에서 동기 확인한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS ERD: [`07_SRS_v1.0.md#6.2.9 ERD`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 전체 데이터 모델: [`07_SRS_v1.0.md#6.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (§6.2.1 ~ §6.2.8)
- C-TEC-003: Prisma + SQLite(로컬) / Supabase PostgreSQL(배포)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma` 전체 리뷰: 8개 모델의 모든 관계(Relations)가 양방향으로 정의되었는지 확인
- [ ] 로컬 SQLite DB 초기화: `npx prisma migrate reset` → `npx prisma migrate dev` 전체 실행
- [ ] 마이그레이션 SQL 파일 검토: `prisma/migrations/` 디렉토리 내 모든 SQL 파일의 테이블·인덱스·FK 생성 구문 확인
- [ ] Prisma Studio(`npx prisma studio`) 실행 → 8개 테이블 구조 시각적 확인, 관계 연결 확인
- [ ] Prisma ERD 자동 생성 도구(`prisma-erd-generator` 또는 `prisma-dbml-generator`) 설치 → SRS §6.2.9 ERD와 대조
- [ ] Supabase PostgreSQL 연결 테스트: `.env`에 `DATABASE_URL`을 Supabase 연결 문자열로 변경 → `npx prisma db push` (또는 `migrate deploy`) 실행 → 원격 DB 테이블 생성 확인
- [ ] **체크리스트: 테이블별 검증**

| 테이블 | 필드 수 | FK | 인덱스 | ENUM |
|---|---|---|---|---|
| User | 7 | - | - | Role(3) |
| Zone | 13 | - | `district` | ZoneStage(8) |
| Listing | 14 | zone_id, agent_id | `[zone_id, is_verified]` | PropertyType(4), ListingStatus(3) |
| Curated_Actual_Price_DB | 10 | last_updated_by | `[district, price_tier]` | - |
| Bluechip_Reference_Price | 8 | zone_id | `district` | - |
| LTV_Policy | 8 | updated_by | - | - |
| Lead_Alert_Subscription | 6 | user_id | - | SubscriptionStatus(3) |
| B2B_Partner | 8 | user_id (UNIQUE) | - | - |

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 로컬 SQLite 전체 마이그레이션**
- **Given**: `prisma/schema.prisma`에 8개 모델이 정의된 상태
- **When**: `npx prisma migrate dev`를 실행함
- **Then**: 모든 마이그레이션이 에러 없이 적용되고, `prisma/dev.db` 파일에 8개 테이블이 생성된다.

**Scenario 2: Supabase PostgreSQL 동기화**
- **Given**: Supabase 프로젝트가 생성되고 `DATABASE_URL`이 설정된 상태
- **When**: `npx prisma db push`를 실행함
- **Then**: Supabase 대시보드의 Table Editor에서 8개 테이블과 ENUM 타입이 확인된다.

**Scenario 3: ERD 자동 생성 대조**
- **Given**: ERD 생성 도구가 설치된 상태
- **When**: `npx prisma generate`를 실행함
- **Then**: 생성된 ERD가 SRS §6.2.9의 Mermaid ERD와 구조적으로 일치한다 (테이블 8개, 관계 7개).

**Scenario 4: 관계 무결성 통합 테스트**
- **Given**: 8개 테이블이 모두 존재하는 상태
- **When**: User → B2B_Partner → Listing → Zone 순서로 관계 데이터를 생성함
- **Then**: 모든 FK 관계가 정상 동작하고, `include` 옵션으로 중첩 조회가 가능하다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-003**: SQLite와 PostgreSQL 간 호환성 주의. `String[]` 타입은 PostgreSQL에서는 `text[]`, SQLite에서는 JSON으로 처리됨. Prisma가 자동 변환하나, 배열 쿼리(`has`, `hasSome`) 동작 차이 인지 필요
- **ENUM 호환**: SQLite는 ENUM을 네이티브 지원하지 않음. Prisma가 체크 제약으로 시뮬레이션함. 배포 시 PostgreSQL ENUM으로 정상 변환 확인 필요
- **마이그레이션 파일 관리**: 개별 마이그레이션 파일은 Git에 커밋하여 팀원 간 스키마 동기화 보장

### :checkered_flag: Definition of Done (DoD)
- [ ] 8개 테이블이 로컬 SQLite에서 모두 생성되는가?
- [ ] 8개 테이블이 Supabase PostgreSQL에서 모두 생성되는가?
- [ ] 모든 FK 관계가 정상 동작하는가 (`include` 중첩 조회)?
- [ ] 모든 인덱스가 생성되어 있는가 (4개: district×2, zone_id+is_verified, district+price_tier)?
- [ ] 5개 ENUM 타입이 올바른 값으로 정의되어 있는가?
- [ ] 자동 생성된 ERD가 SRS §6.2.9와 구조적으로 일치하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 ~ DB-008 (전체 모델 정의 완료)
- **Blocks**: DB-010 (Supabase RLS 정책), MOCK-006 (전체 Seed 스크립트), 모든 BE-* 태스크

---

## Issue #14: DB-010

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-010: Supabase RLS 정책 설정 — Listing 민감 필드 접근 제어"
labels: 'database, security, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-010] Supabase RLS(Row Level Security) 정책 설정
- **목적**: Spec-Down ⑤(AES-256 제거)에 따라 `Listing` 테이블의 민감 필드(`owner_contact`, `unit_number`)를 **Supabase RLS 정책으로 행 단위 접근 제어**한다. B2B 등록자(agent_id) 본인과 Admin만 원본 데이터를 조회할 수 있고, B2C 사용자나 비인가 요청에서는 해당 필드가 반환되지 않도록 보호한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.3 Listing`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (RLS 보호 대상 필드)
- C-TEC-010: UI 마스킹 + Supabase RLS 조합
- REQ-NF-010: RLS + UI 마스킹 민감 데이터 보호
- REQ-NF-012: 패스코드 기반 접근 제어
- 검증 방법: [`07_SRS_v1.0.md#6.8.2 REQ-NF-010`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] Supabase 대시보드에서 `Listing` 테이블의 RLS 활성화 (Enable Row Level Security)
- [ ] **Policy 1 — B2C 공개 조회 (SELECT)**: `owner_contact`, `unit_number`를 제외한 필드만 조회 가능
  ```sql
  -- B2C: 민감 필드를 제외한 조회 허용
  CREATE POLICY "b2c_read_listings" ON "Listing"
    FOR SELECT
    USING (true);
  -- 별도 View 생성으로 민감 필드 제외
  CREATE VIEW listing_public AS
    SELECT listing_id, zone_id, property_type, asking_price, 
           actual_investment, premium, rights_value, 
           is_verified, verified_at, status, created_at, updated_at
    FROM "Listing";
  ```
- [ ] **Policy 2 — B2B 등록자 본인 전체 접근 (SELECT)**: `agent_id`가 현재 사용자와 일치하는 행만 전체 필드 접근 허용
  ```sql
  CREATE POLICY "b2b_read_own_listings" ON "Listing"
    FOR SELECT
    USING (agent_id = auth.uid()); -- 또는 Prisma 쿼리 레벨에서 agent_id 필터
  ```
- [ ] **Policy 3 — Admin 전체 접근 (SELECT/INSERT/UPDATE)**: Admin 역할의 사용자는 모든 행 전체 필드 접근 가능
- [ ] **대안 접근법 (Prisma 쿼리 레벨 제어)**: Supabase Auth를 사용하지 않으므로(C-TEC-009), RLS의 `auth.uid()`를 사용할 수 없음. 따라서:
  - Prisma 쿼리에서 `select` 옵션으로 민감 필드 제외/포함을 코드 레벨에서 제어
  - B2C Route: `select: { owner_contact: false, unit_number: false, ... }`
  - B2B Route: `where: { agent_id: currentAgentId }` 후 전체 필드 반환
  - Admin Route: 전체 접근
  - **⚠️ 이 접근법을 별도 Prisma 쿼리 헬퍼 유틸(`lib/listing-query.ts`)로 추출**
- [ ] `src/lib/listing-query.ts` 작성: 역할별 Listing 조회 함수
  ```typescript
  // B2C용: 민감 필드 제외
  export const LISTING_PUBLIC_SELECT = {
    listing_id: true, zone_id: true, property_type: true,
    asking_price: true, premium: true, rights_value: true,
    is_verified: true, verified_at: true, status: true,
    // owner_contact: false, unit_number: false (기본 제외)
  } as const;
  
  // B2B용: agent_id 기반 전체 조회
  export const LISTING_B2B_SELECT = { ...LISTING_PUBLIC_SELECT, owner_contact: true, unit_number: true };
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: B2C 역할 — 민감 필드 접근 불가**
- **Given**: B2C 사용자(비로그인)가 Listing을 조회하는 상태
- **When**: `/api/v1/listings` GET을 호출함
- **Then**: 응답에 `owner_contact`, `unit_number` 필드가 포함되지 않는다.

**Scenario 2: B2B 등록자 — 본인 매물 전체 접근**
- **Given**: B2B 중개사가 자신이 등록한 매물을 조회하는 상태
- **When**: `agent_id`가 일치하는 Listing을 조회함
- **Then**: `owner_contact`, `unit_number` 필드가 원본 그대로 반환된다.

**Scenario 3: B2B 등록자 — 타인 매물 민감 필드 접근 불가**
- **Given**: B2B 중개사가 다른 중개사가 등록한 매물을 조회하는 상태
- **When**: `agent_id`가 불일치하는 Listing을 조회함
- **Then**: `owner_contact`, `unit_number` 필드가 반환되지 않는다.

**Scenario 4: Admin — 전체 데이터 접근**
- **Given**: Admin이 Listing을 조회하는 상태
- **When**: Admin 패널에서 전체 매물 목록을 조회함
- **Then**: 모든 행의 모든 필드(민감 필드 포함)에 접근 가능하다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-009**: Supabase Auth를 사용하지 않으므로 RLS의 `auth.uid()` 함수 사용 불가. **Prisma 쿼리 레벨에서 `select` 옵션 제어로 대체**
- **C-TEC-010**: 이 태스크는 DB 레벨 접근 제어. 프론트엔드 UI 마스킹(`010-****-1234`)은 LIB-004(MaskingUtil)에서 별도 처리
- **이중 방어**: Prisma 쿼리 레벨 제어(1차) + Supabase RLS 정책(2차, 배포 시)으로 이중 방어 구성

### :checkered_flag: Definition of Done (DoD)
- [ ] `src/lib/listing-query.ts`에 역할별 `SELECT` 상수가 정의되어 있는가?
- [ ] B2C 조회 시 `owner_contact`, `unit_number`가 응답에서 제외되는가?
- [ ] B2B 조회 시 본인 매물에 대해서만 민감 필드에 접근 가능한가?
- [ ] Admin 조회 시 전체 필드에 접근 가능한가?
- [ ] Supabase 배포 환경에서 RLS가 활성화되어 있는가? (배포 시 확인)
- [ ] TEST-INT-005 (RLS 보안 통합 테스트)의 시나리오가 모두 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-009 (전체 마이그레이션 완료), DB-003 (Listing 테이블 생성)
- **Blocks**: TEST-INT-005 (RLS 보안 통합 테스트), BE-H-003 (Listings GET - 역할별 필드 제어), FE-H-004 (B2C 매물 리스트 - 민감 필드 비노출)

---

## Issue #15: API-SPEC-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[API Spec] API-SPEC-001: reverse-filter Server Action 입출력 DTO 및 Zod 스키마 정의"
labels: 'api-contract, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [API-SPEC-001] 역방향 필터 Server Action의 통신 계약(Contract) 정의
- **목적**: `app/actions/reverse-filter.ts`(API-01)의 입력(Input)과 출력(Output) 데이터 구조를 TypeScript 타입과 Zod 검증 스키마로 엄밀하게 정의한다. 이 계약이 확립되면 프론트엔드(FE-F-001~002)와 백엔드(BE-F-001)가 동시에 독립 개발을 시작할 수 있다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS API 명세: [`07_SRS_v1.0.md#6.1 API-01`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- API Overview: [`07_SRS_v1.0.md#3.3 API-01`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- 역산 시퀀스: [`07_SRS_v1.0.md#3.6.1, #6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-002: 역산 결과 p95 ≤ 1.5초
- REQ-FUNC-003: 오차율 ±5% 이내
- REQ-FUNC-005: data_synced_at 포함

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/types/reverse-filter.ts` 파일 생성: Input/Output TypeScript 타입 정의
- [ ] `src/schemas/reverse-filter.ts` 파일 생성: Zod 검증 스키마 정의
- [ ] Input DTO 정의:
  ```typescript
  // src/types/reverse-filter.ts
  export interface ReverseFilterInput {
    cash: number;           // 가용 현금 (KRW, 양의 정수)
    options?: {
      include_tax: boolean; // 취득세 포함 여부 (default: true)
      loan_preference: 'aggressive' | 'conservative' | 'none'; // 대출 선호도
    };
  }
  ```
- [ ] Output DTO 정의:
  ```typescript
  export interface ReverseFilterOutput {
    zones: ReverseFilterZone[];
    total_count: number;
    data_synced_at: string; // ISO 8601 datetime
  }

  export interface ReverseFilterZone {
    zone_id: string;
    zone_name: string;
    district: string;
    stage: string;
    estimated_investment_range: {
      min: number;  // 최소 실투자금
      max: number;  // 최대 실투자금
    };
    match_score: number; // 0~100, 예산 대비 매칭 적합도
  }
  ```
- [ ] Zod 스키마 정의:
  ```typescript
  // src/schemas/reverse-filter.ts
  import { z } from 'zod';
  
  export const reverseFilterInputSchema = z.object({
    cash: z.number()
      .int('가용 현금은 정수여야 합니다')
      .positive('가용 현금은 양수여야 합니다')
      .min(10000000, '최소 1,000만 원 이상 입력해 주세요')
      .max(100000000000, '최대 1,000억 원까지 입력 가능합니다'),
    options: z.object({
      include_tax: z.boolean().default(true),
      loan_preference: z.enum(['aggressive', 'conservative', 'none']).default('aggressive'),
    }).optional(),
  });
  
  export type ReverseFilterInputSchema = z.infer<typeof reverseFilterInputSchema>;
  ```
- [ ] 에러 응답 타입 정의:
  ```typescript
  export interface ReverseFilterError {
    code: 'VALIDATION_ERROR' | 'DB_ERROR' | 'INTERNAL_ERROR';
    message: string;
    field?: string;
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 유효한 Input 검증 통과**
- **Given**: `{ cash: 300000000 }`이 주어진 상태
- **When**: `reverseFilterInputSchema.parse(input)`를 실행함
- **Then**: 에러 없이 파싱된 객체가 반환되고, `options`는 기본값(`{ include_tax: true, loan_preference: 'aggressive' }`)이 적용된다.

**Scenario 2: 음수 cash 입력 시 검증 실패**
- **Given**: `{ cash: -100 }`이 주어진 상태
- **When**: `reverseFilterInputSchema.parse(input)`를 실행함
- **Then**: `ZodError`가 throw되고, 메시지에 '양수'가 포함된다.

**Scenario 3: Output 구조 검증**
- **Given**: Server Action이 정상 실행된 상태
- **When**: 결과를 확인함
- **Then**: `zones` 배열의 각 요소에 `zone_id`, `zone_name`, `district`, `stage`, `estimated_investment_range`, `match_score`가 존재하고, `data_synced_at`이 ISO 8601 형식이다.

**Scenario 4: 최소 금액 미만 입력**
- **Given**: `{ cash: 5000000 }` (500만 원)이 주어진 상태
- **When**: `reverseFilterInputSchema.parse(input)`를 실행함
- **Then**: `ZodError`가 throw되고, '최소 1,000만 원' 관련 메시지가 포함된다.

### :gear: Technical & Non-Functional Constraints
- **TypeScript strict mode**: 모든 타입 정의에 `strict: true` 준수
- **Zod**: 런타임 검증 라이브러리로 Zod v3 사용. Server Action 진입 시점에서 즉시 검증
- **네이밍 규칙**: Input DTO에 `Schema` 접미사, Output 타입에 `Output` 접미사
- **숫자 범위**: `cash`는 `number`(JavaScript safe integer 범위 내). DB 저장 시 `BigInt` 변환은 Server Action 내부에서 처리

### :checkered_flag: Definition of Done (DoD)
- [ ] `src/types/reverse-filter.ts`에 Input/Output 타입이 정의되어 있는가?
- [ ] `src/schemas/reverse-filter.ts`에 Zod 검증 스키마가 정의되어 있는가?
- [ ] 유효한 입력에 대해 파싱이 성공하는가?
- [ ] 잘못된 입력(음수, 최소 미만, 타입 오류)에 대해 명확한 에러 메시지가 반환되는가?
- [ ] Output 타입에 `data_synced_at` 필드가 포함되어 있는가?
- [ ] 에러 응답 타입이 정의되어 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Zod 패키지 설치)
- **Blocks**: BE-F-001 (역산 Server Action 구현), FE-F-001 (랜딩 UI - Input 타입 참조), FE-F-002 (결과 리스트 - Output 타입 참조), TEST-005 (역산 단위 테스트)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001~004, DB-001 | ✅ 완료 |
| **Batch 02** | DB-002~006 | ✅ 완료 |
| **Batch 03** | DB-007~010, API-SPEC-001 | ✅ **완료** |
| Batch 04 | API-SPEC-002~006 | ⬜ 대기 |
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
