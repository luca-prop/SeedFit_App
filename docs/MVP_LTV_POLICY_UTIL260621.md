# SeedFit MVP LTV Policy Utility 260621

## 1. Purpose

This document completes `MVP-009: LTV 정책 조회 유틸 구현`.

The utility reads active LTV policy bands from the database and selects the policy matching a user's cash budget without hardcoding tier values in application logic.

## 2. Files

- `frontend/lib/prisma.ts`: server-only Prisma Client wrapper using the PostgreSQL adapter.
- `frontend/lib/ltvPolicyCore.ts`: pure policy selection logic.
- `frontend/lib/ltvPolicy.ts`: server-only DB lookup utility.
- `frontend/lib/ltvPolicyCore.test.ts`: unit checks for budget boundary matching.

## 3. Selection Rule

Cash bands use this rule:

```text
cash_min_krw <= user_cash_krw < cash_max_krw
```

If `cash_max_krw` is `NULL`, the band has no upper limit.

This makes adjacent bands deterministic. For example, `300,000,000 KRW` belongs to `T2`, not `T1`.

## 4. Runtime Flow

1. `listActiveLtvPolicies()` reads policies where:
   - `is_active = true`
   - `effective_from <= asOf`
   - `effective_to IS NULL OR effective_to >= asOf`
2. `getLtvPolicyForCash(cashKrw)` passes those DB rows to `selectActiveLtvPolicy()`.
3. `selectActiveLtvPolicy()` returns the matching policy or `null`.

## 5. Guardrails

- No LTV tier values are hardcoded in Reverse Filter logic.
- `ltv_ratio` can be `NULL` until a verified lending policy source exists.
- Negative cash input throws `RangeError`.
- The module is marked `server-only` so DB code is not imported into Client Components.

## 6. Verification

Commands used:

```bash
npm run test:ltv-policy
npx tsc --noEmit
npx prisma generate
```

DB smoke check against the MVP Supabase project returned:

```text
T1,T2,T3,T4
```

## 7. Deferred

- Wiring this utility into the Reverse Filter Server Action.
- Admin UI editing of active LTV policies.
- DSR calculation beyond the current note field.
