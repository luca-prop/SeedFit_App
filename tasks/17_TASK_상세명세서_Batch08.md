# TASK 상세 명세서 — Batch 08 (FE-F-003 ~ FE-F-005, BE-F-001 ~ BE-F-002)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 8 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 40/89

---

## Issue #36: FE-F-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-F-003: 매칭 0건 시 Empty State + Lead Gen 버튼"
labels: 'frontend, ui, b2c, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-F-003] 매칭 0건 시 빈 상태(Empty State) 안내 + Lead Gen 버튼
- **목적**: 역산 결과 매칭 0건 시 사용자가 이탈하지 않도록 "현재 예산 범위 내 구역이 없습니다" 안내와 함께, **"예산 내 매물 출현 시 알림 받기"** Lead Gen CTA 버튼을 제공한다. 이 버튼 클릭 시 BE-F-002(Lead 구독 Server Action)이 호출된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-004: 매칭 0건 시 안내 + Lead Gen 버튼
- REQ-FUNC-007: Lead Gen 알림 구독 등록
- API-SPEC-007: SubscribeLeadAlertInput/Output DTO

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/_components/empty-state.tsx` Client Component 생성:
  - 중앙 정렬 일러스트 또는 아이콘 (shadcn/ui 기반)
  - "현재 예산 범위 내 진입 가능한 구역이 없습니다" 헤딩
  - "가용 현금을 높이거나, 예산 내 매물이 등록되면 알려드릴까요?" 서브 텍스트
  - **"알림 등록하기"** CTA 버튼 (shadcn/ui Button variant="default")
  - "예산 수정하기" 보조 링크 → 랜딩 페이지로 돌아가기
- [ ] Lead Gen 모달/인라인 폼: 버튼 클릭 시 예산(자동 채움) + 관심 지역(optional) 입력
- [ ] Server Action 호출: `subscribeLeadAlert()` → 구독 성공 시 "등록 완료" 토스트 알림

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 0건 시 Empty State 표시**
- **Given**: 역산 결과가 0건인 상태
- **When**: 검색 결과 페이지가 렌더링됨
- **Then**: 구역 카드 리스트 대신 Empty State 컴포넌트가 표시되고, "알림 등록하기" 버튼이 보인다.

**Scenario 2: Lead Gen 구독 성공**
- **Given**: Empty State가 표시된 상태
- **When**: "알림 등록하기" 버튼을 클릭하고, 기본 예산이 자동 채워진 채로 제출함
- **Then**: "등록 완료" 토스트가 표시되고, 버튼이 "등록됨" 상태로 변경된다.

**Scenario 3: 예산 수정 링크**
- **Given**: Empty State가 표시된 상태
- **When**: "예산 수정하기" 링크를 클릭함
- **Then**: `/(b2c)/` 랜딩 페이지로 돌아간다.

### :gear: Technical & Non-Functional Constraints
- **UX**: Empty State는 사용자 이탈 방지가 목적. 부정적 톤("없습니다") 대신 건설적 안내("알림 받기") 권장
- **예산 자동 채움**: URL Query Param의 `cash` 값을 Lead Gen 폼에 자동 주입

### :checkered_flag: Definition of Done (DoD)
- [ ] 매칭 0건 시 Empty State 컴포넌트가 렌더링되는가?
- [ ] "알림 등록하기" CTA 버튼이 존재하고 동작하는가?
- [ ] Lead Gen 구독 성공 시 UI 피드백(토스트)이 표시되는가?
- [ ] "예산 수정하기" 클릭 시 랜딩 페이지로 돌아가는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-002 (결과 리스트 — 0건 분기), API-SPEC-007 (Lead DTO)
- **Blocks**: BE-F-002 (Lead Server Action)

---

## Issue #37: FE-F-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-F-004: 데이터 동기화 지연 안내 배너 — last_synced_at 30일 초과 시"
labels: 'frontend, ui, b2c, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-F-004] 데이터 동기화 지연 안내 배너
- **목적**: 국토부 API 배치 수집(BE-J-001) 실패가 장기화되어 `last_synced_at`이 30일을 초과한 경우, 검색 결과 페이지 상단에 경고 배너를 노출하여 사용자에게 데이터 최신성에 대한 투명성을 제공한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-005: data_synced_at 30일 초과 시 안내 배너
- API-SPEC-001 Output: `data_synced_at` 필드 (ISO 8601)
- CON-04: 국토부 API 불안정성 대응

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/_components/sync-warning-banner.tsx` 컴포넌트 생성:
  ```typescript
  interface SyncWarningBannerProps {
    dataSyncedAt: string; // ISO 8601
  }

  export function SyncWarningBanner({ dataSyncedAt }: SyncWarningBannerProps) {
    const syncDate = new Date(dataSyncedAt);
    const daysSinceSync = Math.floor((Date.now() - syncDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceSync <= 30) return null; // 30일 이내면 미노출

    return (
      <Alert variant="warning" className="mb-4">
        <AlertDescription>
          ⚠️ 마지막 데이터 갱신일: {syncDate.toLocaleDateString('ko-KR')} ({daysSinceSync}일 전).
          일부 실거래가 데이터가 최신이 아닐 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }
  ```
- [ ] `/(b2c)/search/page.tsx`에 배너 삽입: 결과 리스트 상단

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 30일 이내 — 배너 미노출**
- **Given**: `data_synced_at`이 5일 전인 상태
- **When**: 검색 결과 페이지를 렌더링함
- **Then**: 경고 배너가 표시되지 않는다.

**Scenario 2: 30일 초과 — 배너 노출**
- **Given**: `data_synced_at`이 45일 전인 상태
- **When**: 검색 결과 페이지를 렌더링함
- **Then**: 상단에 "마지막 데이터 갱신일: ... (45일 전)" 경고 배너가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **Server Component 호환**: `data_synced_at`은 Server Action 응답에서 전달. 날짜 계산은 컴포넌트 내에서 수행
- **비차단**: 배너가 있어도 검색 결과는 정상 표시

### :checkered_flag: Definition of Done (DoD)
- [ ] 30일 초과 시 경고 배너가 노출되는가?
- [ ] 30일 이내 시 배너가 렌더링되지 않는가?
- [ ] 갱신 일자와 경과 일수가 정확히 표시되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-002 (결과 리스트 — 배너 삽입 위치)
- **Blocks**: 없음

---

## Issue #38: FE-F-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-F-005: B2C Layout Footer 면책 조항 고정 노출"
labels: 'frontend, ui, b2c, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-F-005] B2C Layout Footer 면책 조항 고정 노출
- **목적**: REQ-FUNC-020에 따라 B2C 모든 페이지에 걸쳐 Footer에 **"본 데이터는 국토부 실거래가 및 동일 행정구 기준이며, 현장 호가와 다를 수 있습니다"** 면책 조항을 고정 노출한다. 법적 리스크 방지를 위한 필수 요소이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-020: 면책 조항 고정 노출
- CON-05: 데이터 정확성 면책 조항
- `/(b2c)/layout.tsx`: INIT-002에서 생성된 B2C 레이아웃

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/layout.tsx` 수정: Footer 영역에 면책 조항 고정
  ```typescript
  export default function B2CLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t py-4 px-6 text-xs text-muted-foreground text-center">
          <p>⚠️ 본 데이터는 국토부 실거래가 및 동일 행정구 기준 비교이며, 현장 호가·분양가와 다를 수 있습니다.</p>
          <p>투자 판단의 책임은 이용자에게 있으며, 본 서비스는 투자 자문을 제공하지 않습니다.</p>
        </footer>
      </div>
    );
  }
  ```
- [ ] 모바일에서도 Footer가 페이지 하단에 고정 표시되도록 `flex flex-col min-h-screen` 구조 보장

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 랜딩 페이지에서 면책 조항 노출**
- **Given**: `/(b2c)/` 랜딩 페이지에 접속한 상태
- **When**: 페이지 하단으로 스크롤함
- **Then**: 면책 조항 텍스트가 표시된다.

**Scenario 2: 검색 결과 페이지에서도 동일 노출**
- **Given**: `/(b2c)/search` 페이지에 접속한 상태
- **When**: 페이지 하단을 확인함
- **Then**: 동일한 면책 조항이 표시된다 (Layout 레벨이므로 모든 B2C 페이지에 적용).

**Scenario 3: B2B/Admin에는 미노출**
- **Given**: `/(b2b)/` 또는 `/(admin)/` 페이지에 접속한 상태
- **When**: Footer를 확인함
- **Then**: B2C 면책 조항이 표시되지 않는다 (Route Group 격리).

### :gear: Technical & Non-Functional Constraints
- **CON-05**: 면책 조항 문구는 법무팀 검토 후 확정 가능. MVP에서는 위 텍스트를 기본값으로 사용
- **Route Group 격리**: `/(b2c)/layout.tsx`에만 적용되므로 B2B/Admin에는 영향 없음

### :checkered_flag: Definition of Done (DoD)
- [ ] B2C 모든 페이지 Footer에 면책 조항이 노출되는가?
- [ ] B2B/Admin 페이지에는 노출되지 않는가?
- [ ] 모바일에서도 Footer가 페이지 하단에 정상 위치하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-002 (B2C Layout)
- **Blocks**: 없음 (법적 요구사항이므로 독립 완료 가능)

---

## Issue #39: BE-F-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-F-001: reverse-filter Server Action — 역방향 필터 알고리즘 핵심 구현"
labels: 'backend, feature, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-F-001] 역방향 필터 알고리즘 Server Action 구현
- **목적**: 시스템의 **핵심 비즈니스 알고리즘**을 구현한다. 사용자가 입력한 가용 현금으로부터 (1) LTV 정책 기반 대출 가능액 역산 → (2) 취득세 산출 → (3) 이주비 고려 → (4) "필요 총투자금 ≤ 가용 현금"인 Zone/Listing 필터링 → (5) 매칭 결과를 적합도(match_score) 정렬하여 반환한다. **DB Read Only (상태 변경 없음)**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- 역산 시퀀스 다이어그램: [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) ⚠️ **이 시퀀스 다이어그램을 정독할 것**
- REQ-FUNC-002: 역산 결과 p95 ≤ 1.5초
- REQ-FUNC-003: 실투자금 오차율 ±5% 이내
- REQ-FUNC-006: LTV 정책 DB 조회 (하드코딩 금지)
- API-SPEC-001: `ReverseFilterInput` / `ReverseFilterOutput` DTO
- LIB-001: `getMaxLoanAmount(price)` — LTV 정책 기반 대출액
- LIB-002: `calculateAcquisitionTax(price, isRedevelopment)` — 취득세 산출

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/reverse-filter.ts` 파일 생성 (`'use server'`)
- [ ] 핵심 알고리즘 구현:
  ```typescript
  'use server';
  import { reverseFilterInputSchema } from '@/schemas/reverse-filter';
  import { getMaxLoanAmount } from '@/lib/ltv-policy';
  import { calculateAcquisitionTax } from '@/lib/tax-calculator';
  import { prisma } from '@/lib/prisma';
  import type { ReverseFilterInput, ReverseFilterOutput, ReverseFilterZone } from '@/types/reverse-filter';

  export async function reverseFilter(input: ReverseFilterInput): Promise<ReverseFilterOutput> {
    // Step 1: Zod 입력 검증
    const validated = reverseFilterInputSchema.parse(input);
    const cash = validated.cash;

    // Step 2: 모든 Zone + 해당 Zone의 Listing(가격 있는 것) 조회
    const zones = await prisma.zone.findMany({
      include: { listings: { where: { status: 'ACTIVE' } } },
    });

    // Step 3: 각 Zone에 대해 "진입 가능 여부" 역산
    const matchedZones: ReverseFilterZone[] = [];

    for (const zone of zones) {
      // 권리 가액 기반 예상 투자금 산출
      const avgPrice = zone.avg_rights_value ? Number(zone.avg_rights_value) : null;
      if (!avgPrice) continue;

      // LTV 대출 가능액 조회 (DB 직접)
      const maxLoan = await getMaxLoanAmount(avgPrice);

      // 취득세 산출
      const tax = calculateAcquisitionTax(avgPrice, true);

      // 필요 실투자금 = 매물가 - 대출 + 취득세
      const requiredInvestment = avgPrice - maxLoan + tax;

      // 필터: 가용 현금 >= 필요 실투자금
      if (cash >= requiredInvestment) {
        // 매칭 적합도 산출 (예산 대비 여유율)
        const matchScore = Math.min(100, Math.round((cash / requiredInvestment) * 100 - 100));
        
        matchedZones.push({
          zone_id: zone.zone_id,
          zone_name: zone.name,
          district: zone.district,
          stage: zone.stage,
          estimated_investment_range: {
            min: requiredInvestment,
            max: Math.round(requiredInvestment * 1.15), // 호가 변동 ±15% 상한
          },
          match_score: Math.max(0, matchScore),
        });
      }
    }

    // Step 4: match_score 내림차순 정렬
    matchedZones.sort((a, b) => b.match_score - a.match_score);

    // Step 5: 최근 동기화 시점 조회
    const latestSync = await prisma.zone.findFirst({
      orderBy: { last_synced_at: 'desc' },
      select: { last_synced_at: true },
    });

    return {
      zones: matchedZones,
      total_count: matchedZones.length,
      data_synced_at: latestSync?.last_synced_at.toISOString() ?? new Date().toISOString(),
    };
  }
  ```
- [ ] **LTV 정책 조회 최적화**: Zone 루프 외부에서 `getPolicies()` 1회 호출 후 메모리 캐싱
  ```typescript
  // 최적화: N+1 쿼리 방지
  const policies = await getPolicies();
  function getMaxLoanFromCache(price: number) { /* policies 배열에서 매칭 */ }
  ```
- [ ] 에러 처리: Zod 검증 실패 시 명확한 에러 반환, DB 에러 시 INTERNAL_ERROR 반환

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 가용 현금 3억 → 매칭 구역 반환**
- **Given**: Zone 50건 + LTV 3-Tier + Seed 데이터가 존재하는 상태
- **When**: `reverseFilter({ cash: 300000000 })`를 실행함
- **Then**: 1건 이상의 매칭 구역이 반환되고, `total_count > 0`이다.

**Scenario 2: 가용 현금 5천만 → 매칭 0건**
- **Given**: Seed 데이터가 존재하는 상태
- **When**: `reverseFilter({ cash: 50000000 })`를 실행함
- **Then**: `zones` 배열이 비어있고, `total_count === 0`이다.

**Scenario 3: 오차율 ±5% 이내**
- **Given**: 특정 Zone의 실제 필요 투자금이 알려진 상태
- **When**: 역산 결과의 `estimated_investment_range.min`을 확인함
- **Then**: 실제 투자금과의 오차가 ±5% 이내이다.

**Scenario 4: match_score 정렬**
- **Given**: 여러 Zone이 매칭된 상태
- **When**: 결과 배열을 확인함
- **Then**: `match_score` 내림차순으로 정렬되어 있다 (예산 여유가 큰 구역이 상위).

**Scenario 5: data_synced_at 포함**
- **Given**: 결과가 반환된 상태
- **When**: `data_synced_at` 필드를 확인함
- **Then**: ISO 8601 형식의 날짜 문자열이 존재한다.

**Scenario 6: 성능 — p95 ≤ 1.5초**
- **Given**: 50건 Zone + 5건 Listing이 존재하는 상태
- **When**: reverseFilter를 20회 반복 실행함
- **Then**: 95번째 백분위 응답 시간이 1.5초 이내이다.

### :gear: Technical & Non-Functional Constraints
- **CON-01**: Server Action(`'use server'`)에서만 실행. 클라이언트 호출 금지
- **CON-03**: LTV 금액 하드코딩 금지. 반드시 `getMaxLoanAmount()` 또는 `getPolicies()` 사용
- **REQ-FUNC-002**: p95 ≤ 1.5초. N+1 쿼리 방지를 위해 LTV 정책을 루프 외부에서 1회 조회
- **DB Read Only**: 이 Server Action은 DB 상태를 변경하지 않음. INSERT/UPDATE/DELETE 금지
- **BigInt 주의**: Prisma BigInt 필드를 `Number()`로 변환 시 안전 정수 범위 확인

### :checkered_flag: Definition of Done (DoD)
- [ ] `app/actions/reverse-filter.ts`가 Server Action으로 구현되어 있는가?
- [ ] LTV 정책을 DB에서 조회하여 대출 가능액을 산출하는가 (하드코딩 없음)?
- [ ] 취득세를 포함하여 필요 실투자금을 산출하는가?
- [ ] `cash >= requiredInvestment` 조건으로 필터링하는가?
- [ ] 결과가 `match_score` 내림차순으로 정렬되는가?
- [ ] `data_synced_at`이 응답에 포함되는가?
- [ ] p95 응답 시간이 1.5초 이내인가?
- [ ] TEST-005 (역산 단위 테스트)가 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: LIB-001 (LTV 정책), LIB-002 (취득세), DB-009 (마이그레이션 완료), MOCK-006 (Seed 데이터), API-SPEC-001 (Input/Output DTO)
- **Blocks**: FE-F-002 (결과 리스트 렌더링), TEST-005 (단위 테스트), TEST-INT-002 (E2E 플로우), NFR-001 (Cold Start 최적화)

---

## Issue #40: BE-F-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Backend] BE-F-002: Lead Gen 알림 구독 Server Action 구현"
labels: 'backend, feature, b2c, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [BE-F-002] Lead Gen 알림 구독 Server Action 구현
- **목적**: 매칭 0건 시 사용자가 "알림 등록하기" 버튼을 클릭했을 때 호출되는 Server Action을 구현한다. `Lead_Alert_Subscription` 테이블에 사용자의 예산과 관심 지역을 INSERT한다. **DB Write: INSERT**.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-007: Lead Gen 알림 구독 등록
- API-SPEC-007: `SubscribeLeadAlertInput` / `SubscribeLeadAlertOutput` DTO
- DB-007: Lead_Alert_Subscription 테이블

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/actions/lead.ts` 파일 생성 (`'use server'`)
- [ ] 구현:
  ```typescript
  'use server';
  import { subscribeLeadAlertSchema } from '@/schemas/lead';
  import { prisma } from '@/lib/prisma';
  import type { SubscribeLeadAlertInput, SubscribeLeadAlertOutput } from '@/types/lead';

  export async function subscribeLeadAlert(input: SubscribeLeadAlertInput): Promise<SubscribeLeadAlertOutput> {
    // Step 1: Zod 입력 검증
    const validated = subscribeLeadAlertSchema.parse(input);

    // Step 2: 임시 User 생성 (B2C 비로그인)
    const user = await prisma.user.create({
      data: { role: 'B2C', available_cash: BigInt(validated.budget) },
    });

    // Step 3: Lead_Alert_Subscription INSERT
    const subscription = await prisma.lead_Alert_Subscription.create({
      data: {
        user_id: user.user_id,
        budget: BigInt(validated.budget),
        target_regions: validated.regions ?? [],
        status: 'ACTIVE',
      },
    });

    return {
      subscription_id: subscription.subscription_id,
      status: 'active',
      message: '알림 등록이 완료되었습니다. 예산 범위 내 매물이 등록되면 알려드리겠습니다.',
    };
  }
  ```
- [ ] 에러 처리: Zod 검증 실패 시 명확한 에러 반환

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 정상 구독 등록**
- **Given**: `{ budget: 300000000, regions: ['성북구'] }`이 주어짐
- **When**: `subscribeLeadAlert(input)`를 실행함
- **Then**: `subscription_id`가 UUID로 반환되고, DB에 레코드가 INSERT된다.

**Scenario 2: 예산 검증 실패**
- **Given**: `{ budget: -100 }`이 주어짐
- **When**: `subscribeLeadAlert(input)`를 실행함
- **Then**: Zod 검증 에러가 반환된다.

**Scenario 3: regions 미제공 시 기본값**
- **Given**: `{ budget: 300000000 }` (regions 없음)이 주어짐
- **When**: `subscribeLeadAlert(input)`를 실행함
- **Then**: `target_regions`가 빈 배열 `[]`로 저장된다.

### :gear: Technical & Non-Functional Constraints
- **B2C 비로그인**: 사용자 ID가 없으므로 임시 User 레코드 생성. Phase 2에서 인증 연동 시 머지 가능
- **DB Write**: 이 Server Action은 2개 INSERT(User + Subscription) 수행. 트랜잭션으로 묶을 것
- **MVP 범위**: 실제 알림 발송은 구현하지 않음. 데이터 수집만

### :checkered_flag: Definition of Done (DoD)
- [ ] `app/actions/lead.ts`가 Server Action으로 구현되어 있는가?
- [ ] Zod 검증이 적용되어 있는가?
- [ ] DB에 User + Lead_Alert_Subscription 레코드가 생성되는가?
- [ ] 트랜잭션으로 2개 INSERT가 원자적으로 처리되는가?
- [ ] 성공 시 subscription_id와 메시지가 반환되는가?

### :construction: Dependencies & Blockers
- **Depends on**: DB-007 (Lead_Alert_Subscription), DB-001 (User), API-SPEC-007 (DTO)
- **Blocks**: FE-F-003 (Empty State Lead Gen 버튼 연동)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~07** | INIT~LIB, FE-F-001~002 | ✅ 완료 (35개) |
| **Batch 08** | FE-F-003~005, BE-F-001~002 | ✅ **완료** |
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
