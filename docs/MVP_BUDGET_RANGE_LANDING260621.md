# SeedFit MVP 예산 범위 랜딩 260621

## 1. 목적

이 문서는 `MVP-014: B2C 단일 입력 랜딩 구현`을 사용자 결정에 따라 재정의한 결과를 정리합니다.

사용자 결정으로 MVP 검색 입력은 단일 금액이 아니라 기본적으로 예산 범위 입력을 사용합니다.

## 2. 사용자 확정 결정

- 현재 메인 랜딩은 `frontend/app/(b2c)/page.tsx`입니다.
- MVP-014 방식은 랜딩 히어로 영역에 예산 입력 UI를 직접 추가하는 방식입니다.
- 예산 검색은 기본적으로 `1억 ~ 3억`처럼 범위로 입력합니다.
- 단일 `3억` 검색도 가능하지만, 기본 UX와 내부 계약은 범위 입력입니다.
- 범위는 `1억 ~ 25억`, 이동 단위는 `5천만 원`입니다.

## 3. 변경 내용

- `.cursor/rules/007-mvp-budget-range-rules.mdc`를 추가해 MVP 전체 예산 입력 규칙을 고정했습니다.
- `ReverseFilterInput`을 `budgetMinKrw` / `budgetMaxKrw` 범위 계약으로 변경했습니다.
- `frontend/components/b2c/BudgetRangeSearch.tsx`를 추가했습니다.
- `frontend/app/(b2c)/page.tsx` 히어로 영역에 범위 입력 위젯을 삽입했습니다.
- 검색 CTA는 `/app/results?budgetMin=...&budgetMax=...`로 이동합니다.
- 랜딩 내 이모지 아이콘은 업무용 라인 아이콘으로 교체해 AI 생성물처럼 보이는 인상을 줄였습니다.
- `RESULT PREVIEW`는 `3억 예산 기준 맞춤 구역 3곳` 메시지로 구체화했습니다.
- 결과 카드에는 실제 구역 vs 기축 비교 페이지로 이동하는 CTA를 제공합니다.
- 랜딩 하단에 구역 정보 비교 프리뷰와 3억 예산 스캐터 차트 프리뷰를 추가했습니다.
- `BEFORE & AFTER`의 기존 방식 색상은 강한 빨간색 대신 회색 계열로 낮춰 시각적 튐을 줄였습니다.
- 결과 카드 hover/click 시 아래 1:1 비교 프리뷰가 선택 구역 기준으로 바뀌도록 했습니다.

## 4. UI 동작

랜딩 사용자는 다음을 할 수 있습니다.

- 슬라이더로 최소/최대 예산 범위 선택
- 히어로 기본 선택 범위와 첫 번째 빠른 선택은 `1억 ~ 3억`입니다.
- 선택된 예산 범위는 밝은 색, 선택되지 않은 트랙은 어두운 색으로 표시해 현재 선택 구간을 강조
- 빠른 선택 버튼으로 대표 범위 선택
- `3억 단일` 버튼으로 단일 금액 검색 표현
- 검색 CTA 클릭으로 결과 흐름 시작

`RESULT PREVIEW`는 2.5억~3억 입력 기준 예시로 다음 3개 구역을 노출합니다.

- 청파3구역: 신속통합기획 대상지 선정, 예상 초기투자금 3.0억, 매칭 100%
- 신정1구역: 신속통합기획 대상지 선정, 예상 초기투자금 3.0억, 매칭 100%
- 수택 2구역: 조합설립인가, 예상 초기투자금 2.6억, 매칭 87%

각 구역 카드는 `/app/comparison/{zoneId}?budget=300000000` 상세 비교 페이지로 이동합니다.

스캐터 프리뷰는 `frontend/app/lib/scatterData.ts`의 실제 스캐터 데이터를 사용하며, `/app/scatter?budgetMin=300000000&budgetMax=300000000` 전체 차트로 이동합니다.

청파3구역의 잠재 미래 가치 레퍼런스는 다음처럼 두 단지를 별도 가격으로 병렬 표기합니다.

- 이촌한가람: 30.2억
- 마포자이힐스테이트라첼스: 30.6억(분양권)

스캐터 차트 프리뷰는 청파3구역, 신정1구역, 수택 2구역을 각각 다른 색상으로 강조하고, 툴팁에는 구역명·한글 사업단계·초기투자금 범위를 표시합니다.

## 5. Reverse Filter 계약 영향

기존 단일 입력:

```ts
availableCashKrw: number
```

변경된 범위 입력:

```ts
budgetMinKrw: number
budgetMaxKrw: number
```

`within_budget`은 `budgetMinKrw <= requiredCashMinKrw <= budgetMaxKrw`일 때 적용합니다.

`near_budget`은 예산 상한 `budgetMaxKrw`를 기준으로 계산합니다.

## 6. 검증

실행한 검증 명령입니다.

```bash
npm run test:reverse-filter-dto
npm run test:reverse-filter-core
npm run test:core-business
npx tsc --noEmit
npx eslint app/(b2c)/page.tsx components/b2c/BudgetRangeSearch.tsx lib/reverseFilterDto.ts lib/reverseFilterDto.test.ts lib/reverseFilterCore.ts lib/reverseFilterCore.test.ts
```

## 7. 후속 범위

- MVP-015에서 `/app/results`가 범위 입력을 받아 실제 Server Action 결과 카드로 렌더링해야 합니다.
- 기존 `/app/page.tsx` range 입력 화면은 현재 유지하지만, 추후 같은 range contract로 정리할 수 있습니다.
