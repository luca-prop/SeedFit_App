# SeedFit MVP Acquisition Cost Utility 260621

## 1. Purpose

This document completes `MVP-010: 취득세 및 비용 계산 유틸 구현`.

The implementation provides pure backend-safe calculation helpers for acquisition tax, simple additional cost aggregation, reverse budget checks, and investment error-rate checks.

## 2. Files

- `frontend/lib/acquisitionCostCore.ts`: pure calculation utility.
- `frontend/lib/acquisitionCostCore.test.ts`: unit checks for tax, cost aggregation, budget gap, and error-rate tolerance.

## 3. Money Unit

All amounts are handled as integer KRW using `bigint`.

This preserves the MVP data contract established in `MVP_DATA_COLUMN_CONTRACT260621.md` and avoids floating-point rounding in reverse calculation logic.

## 4. Tax Rate Unit

Acquisition tax rate is passed as basis points (`bps`).

Examples:

- `300 bps` = `3.00%`
- `500 bps` = `5.00%`

The utility does not hardcode tax policy tables. The caller must provide the policy rate so future policy parameterization can be added without replacing the calculation function.

## 5. Supported Helpers

- `calculateAcquisitionTax()`: `basePriceKrw * taxRateBps / 10,000`
- `sumCostItems()`: sums named additional KRW cost items.
- `calculateEntryCost()`: combines base investment, acquisition tax, and additional costs.
- `checkReverseBudget()`: compares available cash against required cash.
- `calculateErrorRate()`: calculates absolute error rate using actual curated value as denominator.

## 6. Error-Rate Rule

Default tolerance is `500 bps`, which equals `5%`.

The formula is:

```text
absolute(expected_krw - actual_krw) / actual_krw
```

If `actual_krw` is zero, the function throws because no meaningful error rate can be calculated.

## 7. Verification

Commands used:

```bash
npm run test:cost-utils
npx tsc --noEmit
npx eslint lib/acquisitionCostCore.ts lib/acquisitionCostCore.test.ts
```

## 8. Deferred

- 법정 취득세율 테이블 parameterization.
- Reverse Filter Server Action integration.
- 취득세 외 지역/주택수/생애최초 등 상세 세법 분기.
