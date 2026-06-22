# SeedFit MVP Supabase Seed Upsert 260621

## 1. Purpose

This document completes `MVP-007: Supabase seed/upsert 스크립트 작성`.

MVP-007 turns the normalized data outputs from MVP-005 and MVP-006 into a reproducible SQL seed/upsert file for Supabase Postgres.

Important terminology:

- `reference_apartments` in this issue means **future-value reference complexes** attached to each redevelopment zone.
- These records answer "which new or near-new apartment complex should anchor the completed-zone value benchmark?"
- They do not mean **same-budget existing apartment alternatives** selected by user cash and LTV.
- Same-budget comparison assets from `DATA_CURATION_SPEC.v.2.md` section 3 remain a separate, unimplemented dataset.

This issue does not require a Supabase account to be available locally. The generated SQL can be reviewed without DB access and later executed in the Supabase Preview SQL editor or through a controlled `psql` session.

## 2. Files

- Golden input: `data/normalized/golden_samples260519.normalized.json`
- Naver input: `data/normalized/naver_land_0503.normalized.json`
- Generator: `scripts/data/generate_mvp_seed_sql.py`
- Output: `data/seed/seed_mvp_data.sql`

Run:

```bash
python scripts/data/generate_mvp_seed_sql.py
```

Optional custom paths:

```bash
python scripts/data/generate_mvp_seed_sql.py \
  --golden data/normalized/golden_samples260519.normalized.json \
  --naver data/normalized/naver_land_0503.normalized.json \
  --output data/seed/seed_mvp_data.sql \
  --policy-date 2026-06-21
```

## 3. Output Summary

Current generated result:

- `zones`: 84
- `zone_investment_snapshots`: 84
- `reference_apartments`: 86
- `zone_reference_apartments`: 97
- `ltv_policies`: 4
- `warnings`: 0

The SQL file wraps all changes in a single transaction:

```sql
BEGIN;
-- upsert/delete/insert statements
COMMIT;
```

## 4. Upsert Strategy

The generator uses deterministic UUIDs so repeated generation produces stable IDs.

| Table | Strategy |
| --- | --- |
| `zones` | `ON CONFLICT (district, dong, zone_name) DO UPDATE` |
| `zone_investment_snapshots` | delete same `source_file + source_date`, then insert deterministic rows |
| `reference_apartments` | `ON CONFLICT (id) DO UPDATE` |
| `zone_reference_apartments` | `ON CONFLICT (zone_id, reference_apartment_id) DO UPDATE` |
| `ltv_policies` | delete same `effective_from`, then insert T1~T4 rows |

`reference_apartments` uses `id` conflict instead of `apartment_name + area_m2 + is_presale` because Postgres unique constraints treat `NULL` values as distinct. Golden Sample fallback references can have `area_m2 = NULL`, so deterministic IDs are safer for idempotent re-runs.

## 5. Future-Value Reference Merge Rule

The seed combines two reference sources:

1. Naver Land normalized reference apartments.
2. Golden Sample future-value reference hints.

If a Golden hint matches a Naver reference by normalized apartment name and `isPresale`, the Naver reference is used because it has area and listing evidence.

If no Naver reference exists, the Golden hint becomes a fallback `reference_apartments` row with:

- `area_m2 = NULL`
- `source_file = golden_samples260519.csv.csv`
- `current_price_krw` from the Golden hint

This allows `zone_reference_apartments` to be fully populated for zone-level future-value benchmarking while preserving which references still need Naver enrichment.

The SQL stores link `reason` as `future value reference benchmark` to avoid confusing this dataset with LTV-based same-budget comparison assets.

## 6. Supabase Execution

Before running the SQL against a real database, confirm:

- The Preview Supabase project exists.
- Prisma migration for `frontend/prisma/schema.prisma` has been applied.
- The target is Preview/MVP DB, not Production.
- `data/seed/seed_mvp_data.sql` has been reviewed in PR.

Execution options:

```bash
psql "$DATABASE_URL" -f data/seed/seed_mvp_data.sql
```

or paste the SQL into the Supabase SQL editor for the Preview project.

Do not run this SQL against Production during MVP Sprint 1.

## 7. Deferred

- Automated execution through Prisma Client.
- Supabase project creation and environment variable setup.
- RLS policy creation.
- Data quality report after DB import.
- Vercel Preview DB wiring.
- Same-budget existing apartment comparison assets based on user cash and LTV.
