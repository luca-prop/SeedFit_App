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
- Minimum accepted cash is `10,000,000 KRW`.
- Maximum accepted cash is `20,000,000,000 KRW`.
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

## 5. Error Output

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

## 6. Verification

Commands used:

```bash
npm run test:reverse-filter-dto
npx tsc --noEmit
npx eslint lib/reverseFilterDto.ts lib/reverseFilterDto.test.ts
```

## 7. Next Consumers

- `MVP-012`: Reverse Filter Server Action must return this contract.
- `MVP-014`: B2C landing input must produce this input shape.
- `MVP-015`: Result list must render `matchedZones`, `nearZones`, and `excludedZones`.
