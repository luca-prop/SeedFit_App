# SeedFit MVP Reverse Filter DTO 260621

## 1. Purpose

This document completes `MVP-011: Reverse Filter DTO 및 Zod 스키마 정의`.

The contract fixes the Server Action input/output shape before implementing the actual Reverse Filter action and result UI.

## 2. Input

`ReverseFilterInput`

```ts
{
  availableCashKrw: number;
  interestedDistricts: string[];
  sortBy: "budgetFit" | "investmentMin" | "investmentMax" | "stage" | "zoneName";
  sortDirection: "asc" | "desc";
}
```

Rules:

- `availableCashKrw` is integer KRW.
- Minimum accepted cash is `100,000,000 KRW`.
- Maximum accepted cash is `2,500,000,000 KRW`.
- Cash input moves in `50,000,000 KRW` slider steps.
- `interestedDistricts` defaults to `[]`.
- `sortBy` defaults to `budgetFit`.
- `sortDirection` defaults to `asc`.

## 3. Success Output

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

## 4. Zone Output

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

All Server Action DTO money values are serializable `number` values. Internal calculation utilities may use `bigint`, but the Server Action boundary must convert before returning to Client Components.

## 5. Budget Status Rule

Result groups stay separated as:

- `matchedZones`: budget status `within_budget`
- `nearZones`: budget status `near_budget`
- `excludedZones`: budget status `over_budget`

`near_budget` means:

- If available cash is below `500,000,000 KRW`, over-budget gap is within `50,000,000 KRW`.
- If available cash is `500,000,000 KRW` or higher, over-budget gap is within `10%` of available cash.

## 6. Error Output

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

## 7. User Review Decisions

Confirmed after MVP-011 review:

- Money values remain `number KRW` at the Server Action boundary.
- Input range is `100,000,000 KRW` to `2,500,000,000 KRW`.
- Slider movement unit is `50,000,000 KRW`.
- Result grouping keeps `matchedZones`, `nearZones`, and `excludedZones`.
- Default sort remains `budgetFit asc`.

## 8. Verification

Commands used:

```bash
npm run test:reverse-filter-dto
npx tsc --noEmit
npx eslint lib/reverseFilterDto.ts lib/reverseFilterDto.test.ts
```

## 9. Next Consumers

- `MVP-012`: Reverse Filter Server Action must return this contract.
- `MVP-014`: B2C landing input must produce this input shape.
- `MVP-015`: Result list must render `matchedZones`, `nearZones`, and `excludedZones`.
