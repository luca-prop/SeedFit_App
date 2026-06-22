# SeedFit MVP Reverse Filter Action 260621

## 1. Purpose

This document completes `MVP-012: Reverse Filter Server Action 구현`.

The Server Action reads the latest zone investment snapshots from Supabase via Prisma and returns candidate zones grouped by budget status.

## 2. User-Owned Decisions

Confirmed before implementation:

- MVP-011 adjustment PR must be merged before MVP-012 starts.
- `within_budget` uses minimum required cash: if `requiredCashMinKrw <= availableCashKrw`, the zone is considered reachable.
- `near_budget` uses the MVP-011 rule:
  - below `500,000,000 KRW`: over-budget gap within `50,000,000 KRW`
  - `500,000,000 KRW` and above: over-budget gap within `10%`
- `matchScore` is simple status-based scoring:
  - `within_budget`: `100`
  - `near_budget`: `70`
  - `over_budget`: `0`
- LTV policy is checked for active policy presence, but `ltvRatio` is not applied yet.
- Acquisition tax and additional cost hooks are connected, but default to `0`.
- Each output group returns up to `30` zones.

## 3. Files

- `frontend/app/actions/reverseFilter.ts`: Server Action entry point.
- `frontend/lib/reverseFilterCore.ts`: pure classification and sorting logic.
- `frontend/lib/reverseFilterCore.test.ts`: unit checks for classification rules.

## 4. Runtime Flow

1. Parse input with `reverseFilterInputSchema`.
2. Check that at least one active LTV policy exists.
3. Query all zones with their latest `zone_investment_snapshots` row.
4. Convert DB rows to snapshot candidates.
5. Build `matchedZones`, `nearZones`, and `excludedZones`.
6. Return `ReverseFilterSuccess` DTO.

## 5. Important Constraints

- Server Action output uses serializable `number KRW`.
- Internal calculations may use `bigint`.
- Zones with no latest snapshot are skipped.
- Zones whose latest snapshot has no `investmentMinKrw` are skipped until a listing is curated.
- The action is DB read-only.

## 6. Verification

Commands used:

```bash
npm run test:reverse-filter-core
npx tsc --noEmit
npx eslint app/actions/reverseFilter.ts lib/reverseFilterCore.ts lib/reverseFilterCore.test.ts
```

Supabase smoke check for `300,000,000 KRW` returned:

```json
{"candidates":84,"matched":13,"near":6,"excluded":30}
```

Active LTV policy guard smoke check returned:

```json
{"activeLtvPolicies":4}
```

## 7. Deferred

- Applying non-zero acquisition tax and additional cost policy values.
- Applying `ltvRatio` to estimate loan capacity.
- Server Action UI wiring in MVP-014 and MVP-015.
