# SeedFit MVP Comparison Data Action 260624

## 1. 목적

이 문서는 `MVP-021: 비교 데이터 생성 Server Action 구현`의 구현 기준을 정리합니다.

MVP-021의 목적은 비교 화면이 mock 데이터가 아니라 Supabase/Prisma DB의 구역, 최신 투자금 스냅샷, `DATA_CURATION_SPEC.v.2.md` 3번의 `Comparison Assets`를 기반으로 렌더링되게 하는 것입니다.

중요: 구역 상세 Lite의 `기축 레퍼런스`와 비교 페이지의 `같은 실투자금 기축단지 비교`는 다른 개념입니다.

- `기축 레퍼런스`: 구역별 잠재 미래가치 비교 기준 단지입니다. `DATA_CURATION_SPEC.v.2.md` 2번 표와 `zone_reference_apartments` 관계를 따릅니다.
- `Comparison Assets`: 구역 최소 실투자금으로 살 수 있는 기축 대조군입니다. `DATA_CURATION_SPEC.v.2.md` 3번 표의 `투자금(A)`를 매칭 키로 사용합니다.

## 2. Server Action

구현 파일:

- `frontend/app/actions/comparisonData.ts`

입력:

```ts
{
  zoneId: string;
  zoneName?: string;
  ltvModel?: "firstHome70" | "general40";
}
```

`zoneId`는 기본적으로 `zones.id`입니다. 과거 mock URL 또는 fallback 흐름을 흡수하기 위해 `zoneName`이 있으면 구역명으로도 조회합니다.

## 3. 출력 데이터

Server Action은 다음 데이터를 반환합니다.

- 선택 구역 기본 정보
- 최신 `zone_investment_snapshots` 기준 실투자금 범위
- 구역 최소 실투자금 이하로 진입 가능한 `Comparison Assets`
- 대조군 필요 실투자금
- 구역 최소 실투자금 대비 현금 여유분
- 비교용 요약값

## 4. Comparison Assets 매칭 규칙

비교 페이지는 구역별 `reference_apartments`를 사용하지 않습니다.

기축 대조군은 `frontend/lib/comparisonAssets.ts`의 `DATA_CURATION_SPEC.v.2.md` 3번 표 기반 데이터셋을 사용합니다.

```text
availableCash = zone_investment_snapshots.investment_min_krw
allowedShortfall = min(2천만 원, availableCash * 5%)
matchedAssets = Comparison Assets 중 requiredCashKrw <= availableCash + allowedShortfall
정렬 = abs(availableCash - requiredCashKrw)가 작은 순서
기본 시나리오 = firstHome70
```

`firstHome70`은 생애최초 LTV 70% 모델, `general40`은 일반 LTV 40% 모델입니다.

소액 부족 후보는 제외하지 않고 카드에서 `0.1억 부족`처럼 표시합니다. 큰 부족 후보까지 무분별하게 보여주지 않기 위해 MVP에서는 부족 허용 범위를 `2천만 원`과 `구역 최소 실투자금의 5%` 중 작은 값으로 제한합니다.

## 5. 화면 반영

`frontend/app/app/comparison/[id]/page.tsx`는 Server Component로 전환했습니다.

기존 mock 기반 비교 화면의 임시 요소는 제거하고, 다음을 표시합니다.

- 구역 사업 단계
- 구역 실투자금
- 적용 LTV 시나리오
- 진입 가능 또는 소액 부족 기축 대조군 개수
- 최고 후보 매매가
- 대조군 기축 카드 목록

## 6. 데이터 영속화 결정

MVP 개발 중에는 `frontend/lib/comparisonAssets.ts` 코드 데이터셋을 유지합니다.

이유:

- `Comparison Assets`의 화면 UX와 매칭 규칙을 먼저 빠르게 검증합니다.
- 데이터 양이 작고, MVP 단계에서는 Git diff로 변경 이력을 확인하기 쉽습니다.
- DB 마이그레이션, Admin, 운영 권한 설계로 MVP 범위를 키우지 않습니다.

단, MVP 개발 완료 후에는 최소 월 1회 데이터 업데이트 운영을 전제로 `comparison_assets` DB 테이블을 반드시 추가합니다.

후속 DB 테이블 후보 필드:

```text
comparison_assets
- id
- ltv_model: first_home_70 | general_40
- target_price_band
- actual_price_krw
- apartment_name
- location
- area_label
- required_cash_krw
- max_loan_krw
- applied_loan_krw
- peak_price_krw
- source_name
- source_captured_at
- effective_from
- effective_to
- is_active
- created_at
- updated_at
```

운영 전환 기준:

- 월 1회 이상 가격 업데이트를 실행한다.
- `DATA_CURATION_SPEC.v.2.md` 3번 표와 앱 데이터의 불일치를 허용하지 않는다.
- DB 반영 전에는 seed/import script에서 금액, LTV 모델, 대출 Max, 필요 실투자금 정합성을 검증한다.
- Admin 화면은 후속 과제로 두되, DB 테이블과 seed/import 파이프라인은 MVP 완료 후 우선 구현한다.

## 7. 검증

권장 검증 명령:

```bash
npm run test:comparison-assets
npm run test:reference-apartment-cash
npx eslint app/actions/comparisonData.ts "app/app/comparison/[id]/page.tsx" components/domain/ComparisonAssetCard.tsx lib/comparisonAssets.ts lib/comparisonAssets.test.ts
npx tsc --noEmit
npm run test:core-business
```

로컬 확인:

```text
/app/comparison/[zone-id]?budgetMin=1000000000&budgetMax=1500000000&sort=budgetFitAsc&zoneName=자양4동%20A구역
```
