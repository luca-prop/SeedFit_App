# SeedFit MVP Reverse Filter DTO 260621

## 1. 목적

이 문서는 `MVP-011: Reverse Filter DTO 및 Zod 스키마 정의`의 계약을 정리합니다.

MVP-014 사용자 결정에 따라 SeedFit MVP의 예산 검색은 단일 금액이 아니라 기본적으로 예산 범위 입력을 사용합니다.

## 2. 입력

`ReverseFilterInput`

```ts
{
  budgetMinKrw: number;
  budgetMaxKrw: number;
  interestedDistricts: string[];
  sortBy: "budgetFit" | "investmentMin" | "investmentMax" | "stage" | "zoneName";
  sortDirection: "asc" | "desc";
}
```

규칙:

- `budgetMinKrw`, `budgetMaxKrw`는 정수 KRW입니다.
- 최소 입력값은 `100,000,000 KRW`입니다.
- 최대 입력값은 `2,500,000,000 KRW`입니다.
- 예산 범위는 `50,000,000 KRW` 단위로 이동합니다.
- `budgetMinKrw <= budgetMaxKrw`여야 합니다.
- 단일 금액 검색은 `budgetMinKrw = budgetMaxKrw`로 표현합니다.
- `interestedDistricts` 기본값은 `[]`입니다.
- `sortBy` 기본값은 `budgetFit`입니다.
- `sortDirection` 기본값은 `asc`입니다.

## 3. 성공 응답

`ReverseFilterSuccess`

```ts
{
  ok: true;
  input: ReverseFilterInput;
  matchedZones: ReverseFilterZone[];
  nearZones: ReverseFilterZone[];
  excludedZones: ReverseFilterExcludedZone[];
  totalMatchedCount: number;
  dataSyncedAt: string;
  disclaimer: string;
}
```

## 4. 구역 응답

`ReverseFilterZone`

```ts
{
  zoneId: string;
  zoneName: string;
  district: string;
  dong: string;
  stage: string;
  projectType: string | null;
  investmentMinKrw: number;
  investmentMaxKrw: number | null;
  requiredCashMinKrw: number;
  requiredCashMaxKrw: number | null;
  budgetGapKrw: number;
  budgetStatus: "within_budget" | "near_budget" | "over_budget";
  matchScore: number;
  sourceDate: string;
  excludedReason?: string | null;
}
```

Server Action 응답 금액은 직렬화 가능한 `number KRW`를 사용합니다. 내부 계산 유틸은 `bigint`를 사용할 수 있지만, Client Component로 반환하기 전 반드시 변환합니다.

## 5. 예산 상태 규칙

결과 그룹은 아래처럼 유지합니다.

- `matchedZones`: 선택한 예산 범위 안에 들어오는 구역
- `nearZones`: 예산 상한을 넘지만 근접 기준 안에 들어오는 구역
- `excludedZones`: 예산 범위보다 낮거나, 예산 상한을 크게 초과하는 구역

`near_budget` 기준:

- `budgetMaxKrw`가 `500,000,000 KRW` 미만이면 예산 초과액 `50,000,000 KRW` 이내
- `budgetMaxKrw`가 `500,000,000 KRW` 이상이면 예산 초과액이 `budgetMaxKrw`의 `10%` 이내

## 6. 오류 응답

`ReverseFilterError`

```ts
{
  ok: false;
  errorCode:
    | "INVALID_INPUT"
    | "NO_ACTIVE_LTV_POLICY"
    | "POLICY_NOT_CONFIGURED"
    | "DATA_NOT_READY"
    | "INTERNAL_ERROR";
  message: string;
  fieldErrors?: Record<string, string[]>;
}
```

## 7. 사용자 확정 결정

MVP-014에서 확정한 전체 MVP 규칙:

- 예산 검색은 기본적으로 범위 입력입니다. 예: `2.5억 ~ 3.5억`
- 단일 `3억` 검색도 가능하지만, 기본 UX와 DTO는 범위 계약을 우선합니다.
- Server Action 경계의 금액값은 `number KRW`로 유지합니다.
- 입력 범위는 `1억 ~ 25억`입니다.
- 슬라이더 이동 단위는 `5천만 원`입니다.
- 결과 그룹은 `matchedZones`, `nearZones`, `excludedZones`를 유지합니다.
- 기본 정렬은 `budgetFit asc`입니다.

## 8. 검증

실행한 검증 명령입니다.

```bash
npm run test:reverse-filter-dto
npx tsc --noEmit
npx eslint lib/reverseFilterDto.ts lib/reverseFilterDto.test.ts
```

## 9. 다음 소비자

- `MVP-012`: Reverse Filter Server Action은 이 범위 계약을 반환해야 합니다.
- `MVP-014`: B2C 랜딩 입력 UI는 이 범위 입력을 만들어야 합니다.
- `MVP-015`: 결과 리스트는 `matchedZones`, `nearZones`, `excludedZones`를 렌더링해야 합니다.
