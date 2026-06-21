# SeedFit MVP Supabase Schema 260621

## 1. Purpose

This document completes `MVP-004: Supabase MVP 스키마 설계`.

The MVP uses Supabase Postgres as the actual database and Prisma as the application schema/type layer.

```text
Supabase Postgres = source database, dashboard, manual inspection, CSV import target
Prisma = schema contract, generated client, Next.js Server Action access layer
```

No remote Supabase migration is executed in this issue.

## 2. Do We Need Supabase Signup Now?

Not yet.

`MVP-004` only defines the schema contract in `frontend/prisma/schema.prisma`. Supabase signup or project creation becomes necessary before one of these steps:

- running `prisma migrate` against a real Supabase database
- importing curated CSV/XLSX data into Supabase
- configuring Vercel Preview environment variables
- testing Server Actions against a remote database

Recommended timing:

```text
MVP-004: schema design only
MVP-005~006: local normalization scripts
MVP-007: create Supabase Preview project/schema, run migration, seed/upsert data
MVP-025: connect Vercel Preview environment variables
```

## 3. Current Schema Decision

`frontend/prisma/schema.prisma` is switched to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
}
```

With Prisma 7, connection URLs are loaded from `frontend/prisma.config.ts`, not from `schema.prisma`.

Supabase still uses this environment split:

- `DATABASE_URL`: pooled/runtime connection
- `DIRECT_URL`: direct migration connection, configured when migrations are executed against a real Supabase project

Actual values are not committed.

## 4. Tables

### `zones`

Stable redevelopment zone master.

Important rule:

- no persistent `tier` column
- district-based SSOT
- runtime tier matching uses user cash and latest `investment_min_krw`

Key constraints:

- unique: `district + dong + zone_name`
- index: `district`
- index: `stage`

### `zone_investment_snapshots`

Versioned sale price and required cash data.

Key points:

- money uses `BigInt` KRW
- `investment_min_krw` is the Reverse Filter primary matching value
- `source_file` and `source_date` are required for auditability

Indexes:

- `zone_id + source_date`
- `investment_min_krw`

### `reference_apartments`

Curated existing apartment reference prices.

MVP rule:

- store representative price needed for comparison cards
- do not store full Naver Land raw history in this MVP schema

Natural key:

- `apartment_name + area_m2 + is_presale`

### `zone_reference_apartments`

Join table connecting zones to comparable reference apartments.

Key constraints:

- unique: `zone_id + reference_apartment_id`
- index: `zone_id + priority`

### `ltv_policies`

Cash-band policy and optional LTV/DSR values.

MVP rule:

- T1~T4 are runtime matching bands, not fixed zone attributes
- `ltv_ratio` is optional until a verified lending policy source exists
- policy values must not be hardcoded in application logic

## 5. Prisma To Supabase Mapping

Prisma model names use PascalCase. Supabase table names use snake_case.

| Prisma model | Supabase table |
|---|---|
| `Zone` | `zones` |
| `ZoneInvestmentSnapshot` | `zone_investment_snapshots` |
| `ReferenceApartment` | `reference_apartments` |
| `ZoneReferenceApartment` | `zone_reference_apartments` |
| `LtvPolicy` | `ltv_policies` |

## 6. Migration Policy

Do not run migrations against Production from an issue branch.

Recommended migration flow:

1. Create a Supabase Preview project or dedicated MVP schema.
2. Add Preview-only `DATABASE_URL` and `DIRECT_URL`.
3. Run Prisma migration from a controlled local environment.
4. Verify tables in Supabase Dashboard.
5. Use seed/upsert scripts from `MVP-007`.

## 7. Out Of Scope

The following are not part of `MVP-004`:

- Supabase account creation
- Supabase remote project creation
- Vercel environment variable changes
- data import scripts
- RLS policies
- B2B listings
- Verified listings
- Admin dashboard tables
- Naver Land raw history table

## 8. Follow-Up Issues

- `MVP-005`: normalize `golden_samples260519.csv.csv`
- `MVP-006`: normalize Naver Land XLSX into `reference_apartments`
- `MVP-007`: create Supabase seed/upsert script and run against Preview DB
- `MVP-008`: produce data quality validation report
