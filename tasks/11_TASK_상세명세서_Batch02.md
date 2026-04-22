# TASK 상세 명세서 — Batch 02 (DB-002 ~ DB-006)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 2 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 10/89 (Batch 01: INIT-001~004, DB-001 + Batch 02: DB-002~006)

---

## Issue #6: DB-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-002: Prisma Schema — Zone(구역) 테이블 정의 및 마이그레이션"
labels: 'database, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-002] Zone 테이블 Prisma Schema 작성
- **목적**: 시스템의 핵심 도메인 객체인 재개발 구역 정보를 저장하는 테이블을 생성한다. 역방향 필터 알고리즘(BE-F-001)과 1:1 대조 대시보드(BE-G-001)의 데이터 질의 대상이 되는 핵심 엔터티이며, Listing 및 Bluechip_Reference_Price의 FK 참조 대상이다. **`district` 필드가 PostGIS 대체 텍스트 매칭의 핵심 기준 컬럼**이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.2 Zone`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD: [`07_SRS_v1.0.md#6.2.9`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- Spec-Down ②: PostGIS 제거 → `district` 텍스트 매칭 (C-TEC-003)
- 역산 필터 시퀀스: [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `Zone` 모델 정의:
  ```prisma
  model Zone {
    zone_id          String   @id @default(uuid())
    name             String   @db.VarChar(200)
    district         String   @db.VarChar(100) // 텍스트 매칭 기준 필드
    stage            ZoneStage
    total_units      Int?
    estimated_ratio  Decimal? @db.Decimal(5, 2)
    avg_rights_value BigInt?
    latitude         Decimal? @db.Decimal(10, 7) // 참고용, 공간 쿼리 미사용
    longitude        Decimal? @db.Decimal(10, 7) // 참고용, 공간 쿼리 미사용
    data_source      String   @db.VarChar(50)
    last_synced_at   DateTime
    created_at       DateTime @default(now())
    updated_at       DateTime @updatedAt

    listings         Listing[]
    bluechip_refs    Bluechip_Reference_Price[]
  }

  enum ZoneStage {
    BASIC_PLAN          // 기본계획수립
    SAFETY_DIAGNOSIS    // 정밀안전진단
    REDEVELOPMENT_ZONE  // 정비구역지정
    UNION_APPROVAL      // 조합설립인가
    BUSINESS_APPROVAL   // 사업시행인가
    MANAGEMENT_DISPOSAL // 관리처분인가
    CONSTRUCTION        // 착공
    COMPLETION          // 준공
  }
  ```
- [ ] `district` 필드에 인덱스 추가: `@@index([district])` — 텍스트 매칭 쿼리 성능 보장
- [ ] `npx prisma migrate dev --name add-zone` 실행
- [ ] `npx prisma generate` 실행
- [ ] Prisma Studio에서 Zone 테이블 구조 + ZoneStage ENUM 확인

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Zone 레코드 생성**
- **Given**: Zone 모델이 DB에 존재하는 상태
- **When**: `prisma.zone.create({ data: { name: '장위뉴타운', district: '성북구', stage: 'MANAGEMENT_DISPOSAL', data_source: '수동업로드', last_synced_at: new Date() } })`를 실행함
- **Then**: 레코드가 정상 생성되고, `zone_id`가 UUID 형태로 자동 할당된다.

**Scenario 2: district 기반 텍스트 매칭 쿼리**
- **Given**: '성북구' district를 가진 Zone이 3건 존재하는 상태
- **When**: `prisma.zone.findMany({ where: { district: '성북구' } })`를 실행함
- **Then**: 3건이 반환되고, 모든 레코드의 `district`가 '성북구'이다.

**Scenario 3: ZoneStage ENUM 검증**
- **Given**: Zone 모델에 `stage` ENUM이 정의된 상태
- **When**: 유효하지 않은 stage 값 `'INVALID_STAGE'`로 생성을 시도함
- **Then**: Prisma 타입 에러 또는 DB 제약 조건 위반 에러가 발생한다.

**Scenario 4: 인덱스 존재 확인**
- **Given**: 마이그레이션이 완료된 상태
- **When**: 마이그레이션 SQL 파일을 확인함
- **Then**: `district` 컬럼에 대한 인덱스 생성 구문이 포함되어 있다.

### :gear: Technical & Non-Functional Constraints
- **C-TEC-003**: PostGIS 확장 사용 금지. `latitude`/`longitude`는 참고용 저장만 하며, `ST_DWithin` 등 공간 함수 호출 금지
- **Spec-Down ②**: 모든 지역 매칭은 `district` 필드의 **텍스트 완전 일치(`=`)** 또는 **텍스트 포함(`IN`)** 으로만 수행
- **8단계 ENUM**: 재개발 사업 단계를 8개 값으로 고정. 향후 단계 추가 시 마이그레이션 필요

### :checkered_flag: Definition of Done (DoD)
- [ ] `Zone` 모델이 SRS §6.2.2 명세의 모든 필드를 포함하는가?
- [ ] `ZoneStage` ENUM이 8단계를 정확히 정의하는가?
- [ ] `district` 필드에 DB 인덱스가 생성되어 있는가?
- [ ] `npx prisma migrate dev`가 에러 없이 실행되는가?
- [ ] Prisma Studio에서 Zone 테이블 구조를 확인할 수 있는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Prisma 초기화)
- **Blocks**: DB-003 (Listing FK→Zone), DB-005 (Bluechip FK→Zone), DB-009 (전체 마이그레이션 검증), MOCK-001 (Zone Seed 데이터), BE-F-001 (역산 필터), BE-G-001 (대조 대시보드), BE-J-001 (배치 Cron)

---

## Issue #7: DB-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-003: Prisma Schema — Listing(매물) 테이블 정의 및 마이그레이션"
labels: 'database, backend, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-003] Listing 테이블 Prisma Schema 작성
- **목적**: B2B 중개사가 등록하는 재개발 매물 정보를 저장하는 테이블을 생성한다. Verified 뱃지 시스템(is_verified), 교차검증(asking_price vs 주변 시세), 그리고 UI 마스킹 대상 민감 필드(owner_contact, unit_number)를 포함한다. **AES-256 암호화 제거(Spec-Down ⑤)에 따라 민감 필드는 평문 저장 + Supabase RLS 정책으로 보호**한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.3 Listing`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD: [`07_SRS_v1.0.md#6.2.9`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- Spec-Down ⑤: AES-256 제거 → 평문 저장 + RLS (C-TEC-010)
- B2B 매물 등록 시퀀스: [`07_SRS_v1.0.md#6.3.3`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-NF-010: RLS + UI 마스킹 민감 데이터 보호

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `Listing` 모델 정의:
  ```prisma
  model Listing {
    listing_id       String        @id @default(uuid())
    zone_id          String
    agent_id         String?
    property_type    PropertyType
    asking_price     BigInt
    actual_investment BigInt?
    premium          BigInt?
    rights_value     BigInt?
    is_verified      Boolean       @default(false)
    verified_at      DateTime?
    owner_contact    String?       @db.VarChar(200) // RLS 보호 대상, 평문 저장
    unit_number      String?       @db.VarChar(50)  // RLS 보호 대상, 평문 저장
    status           ListingStatus @default(ACTIVE)
    created_at       DateTime      @default(now())
    updated_at       DateTime      @updatedAt

    zone             Zone          @relation(fields: [zone_id], references: [zone_id])
    agent            User?         @relation(fields: [agent_id], references: [user_id])
  }

  enum PropertyType {
    TTUKKUNG    // 뚜껑
    DASEDAE     // 다세대
    VILLA       // 빌라
    ETC         // 기타
  }

  enum ListingStatus {
    ACTIVE
    SOLD
    WITHDRAWN
  }
  ```
- [ ] `is_verified` + `zone_id` 복합 인덱스 추가 (Verified 우선 정렬 쿼리 최적화): `@@index([zone_id, is_verified])`
- [ ] 모델 내 `owner_contact`, `unit_number` 필드에 `// ⚠️ RLS 보호 대상: DB-010에서 Supabase RLS 정책 설정 필요` 주석 명시
- [ ] `npx prisma migrate dev --name add-listing` 실행
- [ ] `npx prisma generate` 실행
- [ ] User 모델의 `listings Listing[]` 관계 필드 활성화 (DB-001에서 주석 예약한 것 해제)
- [ ] Zone 모델의 `listings Listing[]` 관계 필드가 DB-002에서 이미 정의되었는지 확인

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Listing 생성 (Verified)**
- **Given**: Zone과 User(B2B)가 존재하는 상태
- **When**: `prisma.listing.create({ data: { zone_id, agent_id, property_type: 'TTUKKUNG', asking_price: 500000000n, is_verified: true, verified_at: new Date() } })`를 실행함
- **Then**: 레코드가 정상 생성되고 `is_verified`가 `true`이다.

**Scenario 2: FK 제약 조건 (Zone 참조 무결성)**
- **Given**: Listing 테이블이 존재하는 상태
- **When**: 존재하지 않는 `zone_id`로 Listing 생성을 시도함
- **Then**: FK 제약 조건 위반 에러가 발생한다.

**Scenario 3: Verified 우선 정렬 쿼리**
- **Given**: Verified(2건)와 일반(3건) 매물이 동일 Zone에 존재하는 상태
- **When**: `prisma.listing.findMany({ where: { zone_id }, orderBy: { is_verified: 'desc' } })`를 실행함
- **Then**: Verified 매물 2건이 상위에, 일반 매물 3건이 하위에 정렬되어 반환된다.

**Scenario 4: 민감 필드 평문 저장 확인**
- **Given**: `owner_contact`에 '01012345678'을 저장한 상태
- **When**: Prisma Studio에서 해당 레코드를 조회함
- **Then**: `owner_contact` 값이 평문 '01012345678'으로 저장되어 있다 (암호화 없음, RLS로 접근 제어).

### :gear: Technical & Non-Functional Constraints
- **C-TEC-010**: `owner_contact`, `unit_number`는 암호화하지 않음. Supabase RLS + 프론트엔드 UI 마스킹으로 보호
- **Spec-Down ⑤**: AES-256 `crypto.createCipheriv()` 등의 암호화 코드 작성 금지
- **PropertyType ENUM**: 한글 구어체('뚜껑')를 영문 코드('TTUKKUNG')로 매핑. 프론트엔드 표시 시 한글 라벨 변환 필요
- **BigInt**: 한국 원화 금액 필드는 `BigInt` 사용 (JavaScript 안전 정수 범위 초과 방지)

### :checkered_flag: Definition of Done (DoD)
- [ ] `Listing` 모델이 SRS §6.2.3 명세의 모든 필드(14개)를 포함하는가?
- [ ] `PropertyType`(4값), `ListingStatus`(3값) ENUM이 정의되어 있는가?
- [ ] FK(zone_id→Zone, agent_id→User)가 정상 연결되어 있는가?
- [ ] `owner_contact`, `unit_number` 필드에 RLS 보호 대상 주석이 명시되어 있는가?
- [ ] `[zone_id, is_verified]` 복합 인덱스가 존재하는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 (User - FK 참조), DB-002 (Zone - FK 참조)
- **Blocks**: DB-010 (Supabase RLS 정책 설정), MOCK-005 (테스트 Listing Seed), BE-H-001 (매물 등록 Route Handler), BE-H-003 (매물 조회 Route Handler)

---

## Issue #8: DB-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-004: Prisma Schema — Curated_Actual_Price_DB(구별 실거래가 큐레이션) 테이블"
labels: 'database, backend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-004] Curated_Actual_Price_DB 테이블 Prisma Schema 작성
- **목적**: 운영팀이 수동/반자동으로 검증하여 관리하는 **구별·금액대별 대표 아파트 실거래가 데이터베이스**를 저장한다. 1:1 대조 대시보드(BE-G-001)에서 기축 아파트 3개 이상 자동 추천(REQ-FUNC-008) 및 전고점 대비 회복률 산출(REQ-FUNC-010)의 데이터 소스이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.4 Curated_Actual_Price_DB`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD 관계: User(ADMIN) → Curated_Actual_Price_DB (updates)
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-FUNC-008: LTV 기반 기축 아파트 3개 이상 자동 추천
- REQ-FUNC-010: 전고점 대비 회복률(%) 표시

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `Curated_Actual_Price_DB` 모델 정의:
  ```prisma
  model Curated_Actual_Price_DB {
    curated_id          String   @id @default(uuid())
    district            String   @db.VarChar(100)
    price_tier          String   @db.VarChar(50)  // e.g., "9억대", "12억대"
    apartment_name      String   @db.VarChar(200)
    latest_actual_price BigInt
    peak_price_2122     BigInt?  // 21-22년 전고점
    recovery_rate       Decimal? @db.Decimal(5, 2) // 전고점 대비 회복률 %
    area_sqm            Decimal  @db.Decimal(7, 2) // 전용면적 ㎡
    last_updated_by     String
    updated_at          DateTime @updatedAt

    admin               User     @relation(fields: [last_updated_by], references: [user_id])
  }
  ```
- [ ] `district` + `price_tier` 복합 인덱스 추가: `@@index([district, price_tier])` — 구별·금액대 필터링 성능 보장
- [ ] User 모델에 `curated_updates Curated_Actual_Price_DB[]` 관계 필드 추가
- [ ] `npx prisma migrate dev --name add-curated-price-db` 실행
- [ ] `npx prisma generate` 실행

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 큐레이션 데이터 생성**
- **Given**: Admin User가 존재하는 상태
- **When**: `prisma.curated_Actual_Price_DB.create({ data: { district: '성북구', price_tier: '9억대', apartment_name: '래미안 아파트', latest_actual_price: 900000000n, peak_price_2122: 1100000000n, recovery_rate: 81.82, area_sqm: 84.97, last_updated_by: adminUserId } })`를 실행함
- **Then**: 레코드가 정상 생성되고 `recovery_rate`가 81.82%로 저장된다.

**Scenario 2: 구별·금액대 필터링 쿼리**
- **Given**: '강남구'에 '12억대' 2건, '15억대' 1건이 존재하는 상태
- **When**: `prisma.curated_Actual_Price_DB.findMany({ where: { district: '강남구', price_tier: '12억대' } })`를 실행함
- **Then**: 2건만 반환된다.

**Scenario 3: 회복률 산출 데이터 정합성**
- **Given**: `latest_actual_price: 9억`, `peak_price_2122: 11억`인 레코드가 존재하는 상태
- **When**: 회복률을 계산함 (`latest / peak * 100`)
- **Then**: 결과가 `recovery_rate` 필드 값(81.82%)과 일치한다.

### :gear: Technical & Non-Functional Constraints
- **운영 방식**: Admin이 `/(admin)/curated-db` 패널 또는 Supabase 대시보드 CSV Import로 주 1회 업데이트 (REQ-NF-017)
- **`price_tier`**: 한글 텍스트("9억대", "12억대") 그대로 저장. 프론트엔드 표시와 일치시킴
- **`Decimal` 타입**: `recovery_rate`와 `area_sqm`은 소수점 정밀도가 중요하므로 `Float` 대신 `Decimal` 사용

### :checkered_flag: Definition of Done (DoD)
- [ ] 모델이 SRS §6.2.4 명세의 모든 필드(10개)를 포함하는가?
- [ ] FK(last_updated_by→User)가 정상 연결되어 있는가?
- [ ] `[district, price_tier]` 복합 인덱스가 존재하는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?
- [ ] User 모델에 역관계(`curated_updates`)가 추가되었는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 (User - FK 참조)
- **Blocks**: MOCK-002 (Curated Seed 데이터), BE-G-001 (대시보드 기축 매칭), BE-I-002 (Admin Curated DB 업데이트)

---

## Issue #9: DB-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-005: Prisma Schema — Bluechip_Reference_Price(신축 대장 단지 기준가) 테이블"
labels: 'database, backend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-005] Bluechip_Reference_Price 테이블 Prisma Schema 작성
- **목적**: 각 재개발 구역과 **동일 행정구(district) 내 신축 대장주 아파트**의 평형별 실거래가 데이터를 저장한다. 1:1 대조 대시보드(BE-G-001)에서 재개발 구역의 미래 가치(Potential Price)를 산정(REQ-FUNC-009)할 때 참조하는 핵심 레퍼런스 테이블이다. **`district` 필드를 텍스트 매칭 기준으로 사용하며, `distance_km`은 참고용으로만 저장**한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.5 Bluechip_Reference_Price`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD 관계: Zone → Bluechip_Reference_Price (has nearby bluechip, same district)
- Spec-Down ②: PostGIS 제거 → `district` 텍스트 일치로 매칭 기준 변경
- REQ-FUNC-009: 동일 행정구 내 신축 대장 단지 미래 가치 산정
- REQ-FUNC-012: 동일 행정구 부재 시 인접 행정구로 확장 매칭

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `Bluechip_Reference_Price` 모델 정의:
  ```prisma
  model Bluechip_Reference_Price {
    bluechip_id    String   @id @default(uuid())
    zone_id        String
    apartment_name String   @db.VarChar(200)
    district       String   @db.VarChar(100) // 텍스트 매칭 기준 필드
    distance_km    Decimal? @db.Decimal(4, 1) // 참고용, 쿼리 조건으로 미사용
    area_sqm       Decimal  @db.Decimal(7, 2)
    actual_price   BigInt
    updated_at     DateTime @updatedAt

    zone           Zone     @relation(fields: [zone_id], references: [zone_id])
  }
  ```
- [ ] `district` 필드에 인덱스 추가: `@@index([district])` — `WHERE district = ?` 및 `WHERE district IN (?)` 쿼리 최적화
- [ ] Zone 모델의 `bluechip_refs Bluechip_Reference_Price[]` 관계 필드가 DB-002에서 이미 정의되었는지 확인
- [ ] `npx prisma migrate dev --name add-bluechip-reference` 실행
- [ ] `npx prisma generate` 실행

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 동일 행정구 매칭 쿼리**
- **Given**: '성북구' district를 가진 Bluechip 레코드가 2건 존재하고, Zone '장위뉴타운'의 district도 '성북구'인 상태
- **When**: `prisma.bluechip_Reference_Price.findMany({ where: { district: zone.district } })`를 실행함
- **Then**: 2건이 반환되고 모두 '성북구' district이다.

**Scenario 2: 인접 행정구 확장 매칭 쿼리**
- **Given**: '도봉구' district에는 Bluechip 데이터가 0건이고, 인접 행정구 목록이 `['노원구', '강북구']`인 상태
- **When**: `prisma.bluechip_Reference_Price.findMany({ where: { district: { in: ['노원구', '강북구'] } } })`를 실행함
- **Then**: 인접 행정구의 Bluechip 데이터가 반환된다.

**Scenario 3: FK 제약 조건 (Zone 참조)**
- **Given**: Bluechip 테이블이 존재하는 상태
- **When**: 존재하지 않는 `zone_id`로 레코드 생성을 시도함
- **Then**: FK 제약 조건 위반 에러가 발생한다.

**Scenario 4: distance_km 참고용 확인**
- **Given**: `distance_km: 1.5`로 레코드가 생성된 상태
- **When**: 데이터를 조회함
- **Then**: `distance_km` 값이 저장되어 있으나, 이 필드를 WHERE 조건으로 사용하는 쿼리는 시스템에 존재하지 않는다.

### :gear: Technical & Non-Functional Constraints
- **Spec-Down ②**: `distance_km`은 저장만 하고 **절대 쿼리 조건으로 사용하지 않음**. 매칭 기준은 오직 `district` 텍스트 일치
- **C-TEC-003**: PostGIS 함수(`ST_DWithin`, `ST_Distance`) 호출 금지
- **인접 행정구**: 시스템이 인접 행정구 목록을 관리하는 방식은 BE-G-001에서 정의 (하드코딩 매핑 테이블 또는 별도 Adjacent_Districts 테이블)

### :checkered_flag: Definition of Done (DoD)
- [ ] 모델이 SRS §6.2.5 명세의 모든 필드(8개)를 포함하는가?
- [ ] FK(zone_id→Zone)가 정상 연결되어 있는가?
- [ ] `district` 필드에 인덱스가 존재하는가?
- [ ] `distance_km` 필드에 "참고용, 쿼리 미사용" 주석이 명시되어 있는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-002 (Zone - FK 참조)
- **Blocks**: MOCK-003 (Bluechip Seed 데이터), BE-G-001 (대시보드 미래 가치 산정)

---

## Issue #10: DB-006

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[DB] DB-006: Prisma Schema — LTV_Policy(LTV 정책 변수) 테이블"
labels: 'database, backend, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [DB-006] LTV_Policy 테이블 Prisma Schema 작성
- **목적**: 정부 LTV/DSR 대출 정책 변수를 저장하는 테이블을 생성한다. 역산 알고리즘(BE-F-001)에서 가용 현금 대비 대출 가능 최대 금액을 Tier별로 계산하는 핵심 파라미터이다. **하드코딩 금지(CON-03)**: Admin이 `/(admin)/ltv-policy` 패널에서 즉시 수정 가능해야 하며, 수정 즉시 역산 결과에 반영(REQ-FUNC-006)되어야 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 데이터 모델: [`07_SRS_v1.0.md#6.2.6 LTV_Policy`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- ERD 관계: User(ADMIN) → LTV_Policy (modifies)
- REQ-FUNC-006: LTV 대출 가능액 Admin 파라미터화
- CON-03: LTV/DSR 산출 로직 하드코딩 금지
- RISK-01: 정책 급변 리스크 → Parameterization으로 대응
- 기본값: 15억 이하→6억, 15~25억→4억, 25억 초과→2억

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `prisma/schema.prisma`에 `LTV_Policy` 모델 정의:
  ```prisma
  model LTV_Policy {
    policy_id           String   @id @default(uuid())
    tier_label          String   @db.VarChar(50) // e.g., "15억 이하"
    price_threshold_min BigInt   // 가격 하한 (KRW)
    price_threshold_max BigInt   // 가격 상한 (KRW)
    max_loan_amount     BigInt   // 최대 대출 가능액 (KRW)
    effective_from      DateTime
    updated_by          String
    updated_at          DateTime @updatedAt

    admin               User     @relation(fields: [updated_by], references: [user_id])
  }
  ```
- [ ] User 모델에 `ltv_updates LTV_Policy[]` 관계 필드 추가
- [ ] `npx prisma migrate dev --name add-ltv-policy` 실행
- [ ] `npx prisma generate` 실행
- [ ] Prisma Studio에서 테이블 구조 + 기본값 삽입 가능 여부 확인

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 3-Tier LTV 정책 생성**
- **Given**: LTV_Policy 테이블이 존재하는 상태
- **When**: 3개 Tier를 생성함:
  - Tier 1: 15억 이하 → 최대 6억
  - Tier 2: 15~25억 → 최대 4억
  - Tier 3: 25억 초과 → 최대 2억
- **Then**: 3건의 레코드가 정상 생성되고, 각 `max_loan_amount`가 올바르다.

**Scenario 2: 정책 조회 (가격 기반 Tier 매칭)**
- **Given**: 3-Tier 정책이 존재하는 상태
- **When**: 매물 가격 12억에 대해 해당하는 Tier를 조회함 (`price_threshold_min <= 1200000000 AND price_threshold_max >= 1200000000`)
- **Then**: Tier 1(15억 이하)이 반환되고 `max_loan_amount`가 6억이다.

**Scenario 3: 정책 수정 즉시 반영**
- **Given**: Tier 1의 `max_loan_amount`가 6억인 상태
- **When**: Admin이 `max_loan_amount`를 5억으로 UPDATE함
- **Then**: 다음 역산 쿼리에서 변경된 5억이 적용된다 (캐시 없음, DB 직접 조회이므로 즉시 반영).

### :gear: Technical & Non-Functional Constraints
- **CON-03**: LTV/DSR 산출 로직은 절대 코드에 하드코딩하지 않음. 반드시 DB 테이블에서 조회
- **C-TEC-008**: 캐시(Redis/KV) 미사용. 매 역산 요청마다 DB에서 최신 정책을 직접 조회함 → 수정 즉시 반영 보장
- **RISK-01 대응**: 정부 대출 정책 급변 시 Admin 패널에서 즉시 수정 가능해야 하므로, `effective_from` 필드로 정책 적용 시점을 관리

### :checkered_flag: Definition of Done (DoD)
- [ ] 모델이 SRS §6.2.6 명세의 모든 필드(8개)를 포함하는가?
- [ ] FK(updated_by→User)가 정상 연결되어 있는가?
- [ ] `price_threshold_min/max` 범위 쿼리가 정상 동작하는가?
- [ ] User 모델에 역관계(`ltv_updates`)가 추가되었는가?
- [ ] 마이그레이션이 에러 없이 실행되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-001 (User - FK 참조)
- **Blocks**: MOCK-004 (LTV 기본값 Seed), LIB-001 (ltv-policy.ts 유틸), BE-F-001 (역산 알고리즘), BE-G-001 (대조 대시보드), BE-I-001 (Admin LTV 수정)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01** | INIT-001, INIT-002, INIT-003, INIT-004, DB-001 | ✅ 완료 |
| **Batch 02** | DB-002, DB-003, DB-004, DB-005, DB-006 | ✅ **완료** |
| Batch 03 | DB-007, DB-008, DB-009, DB-010, API-SPEC-001 | ⬜ 대기 |
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
