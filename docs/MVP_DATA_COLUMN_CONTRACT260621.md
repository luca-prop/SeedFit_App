# SeedFit MVP Data Column Contract 260621

## 1. Purpose

This document defines the canonical data column contract for `MVP-003`.

It turns the current curated source files into a stable contract for the next MVP issues:

- `MVP-004`: Supabase MVP schema design
- `MVP-005`: redevelopment zone CSV normalization
- `MVP-006`: Naver Land XLSX normalization
- `MVP-007`: Supabase seed/upsert script
- `MVP-008`: data quality report

This document does not create a database schema or import script. It only fixes column names, data types, required fields, and source mapping rules.

## 2. Source Files

### Redevelopment Zone Source

Primary source:

```text
docs/golden_samples260519.csv.csv
```

Historical sources:

```text
docs/golden_samples260518.csv.csv
docs/golden_samples260513.csv.csv
docs/golden_samples260510.csv.csv
docs/golden_samples.csv
```

`golden_samples260519.csv.csv` is the MVP baseline because it is the latest curated sample file currently present in `docs/`.

### Existing Apartment Price Source

Expected source files:

```text
docs/Naver_Land_0503_1132.xlsx
docs/Naver_Land_0503_1129.xlsx
```

These files are expected to provide existing apartment price evidence. If the files are not present in a workspace checkout, the importer must fail with a clear "source file missing" message instead of silently falling back to stale values.

### Policy Source

Policy interpretation source:

```text
docs/DATA_CURATION_SPEC.v.2.md
```

This document remains an interpretation policy document. Runtime matching should use normalized database rows, not markdown tables.

## 3. Canonical Tables

The MVP uses five normalized table contracts:

1. `zones`
2. `zone_investment_snapshots`
3. `reference_apartments`
4. `zone_reference_apartments`
5. `ltv_policies`

All money columns use KRW integer values. Source files may use `억`, but normalized columns must not.

Important `DATA_CURATION_SPEC.v.2.md` rule:

- Zones are not physically assigned to fixed tiers in the master data.
- Zone master data is organized by administrative district (`district`) to keep a single source of truth.
- T1~T4 is a runtime matching result derived from user available cash and the latest `investment_min_krw`.
- Do not add a persistent `tier` column to `zones`.

## 4. Common Types And Conventions

### IDs

- Primary keys use UUID strings.
- Foreign keys use the referenced table's UUID.
- Import scripts may generate deterministic UUIDs from stable natural keys, but the application should treat them as opaque IDs.

### Money

- Store money as integer KRW.
- Convert `1억` to `100000000`.
- Convert decimal `11.7억` to `1170000000`.
- Blank money fields become `null`, not `0`.
- Range strings such as `14~16` become min/max values.

### Dates

- Source capture dates use ISO date strings: `YYYY-MM-DD`.
- If a source filename includes a date-like suffix, the importer may use that as `source_date`.
- If the source date cannot be inferred, require an explicit CLI argument in the import script.

### Text Normalization

- Trim leading/trailing whitespace.
- Collapse repeated internal spaces unless they distinguish an official name.
- Preserve Korean business terms as source-facing values.
- Normalize known stage typos before validation.

Known correction:

```text
연변 부여 -> 연번 부여
```

## 5. `zones`

Purpose: stable redevelopment zone master data.

Natural key:

```text
district + dong + zone_name
```

| Column | Type | Required | Source | Notes |
|---|---:|:---:|---|---|
| `id` | uuid | yes | generated | Primary key |
| `district` | text | yes | `행정구` | Example: `용산구` |
| `dong` | text | yes | `행정동` | Example: `청파동` |
| `zone_name` | text | yes | `구역명` | Example: `청파 1구역` |
| `stage` | text | yes | `현재 단계` | Must pass stage normalization |
| `project_type` | text | no | derived from `zone_name` or `stage` | Examples: `redevelopment`, `reconstruction`, `moa_town`, `unknown` |
| `notes` | text | no | `특징/호재` | Keep source nuance; do not parse aggressively in MVP |
| `created_at` | timestamptz | yes | generated | DB default |
| `updated_at` | timestamptz | yes | generated | Updated on upsert |

Allowed MVP `stage` values:

- `관리처분인가`
- `사업시행인가`
- `사업시행자 지정`
- `시공사선정`
- `시공사 선정`
- `조합설립인가`
- `추진위 승인`
- `추진위설립`
- `정비구역지정`
- `정비구역 지정`
- `신속통합기획 확정`
- `신속통합기획 완료`
- `신속통합기획 대상지 선정`
- `(모아)통합심의통과`
- `(모아)관리계획고시`
- `(모아)관리계획수립`
- `(모아)대상지 선정`
- `연번 부여`
- `추진준비`

MVP importers may preserve original stage strings after typo correction. A later issue can consolidate display labels.

## 6. `zone_investment_snapshots`

Purpose: versioned sale price and required cash data for each zone.

| Column | Type | Required | Source | Notes |
|---|---:|:---:|---|---|
| `id` | uuid | yes | generated | Primary key |
| `zone_id` | uuid | yes | `zones.id` | FK |
| `sale_price_min_krw` | bigint | no | `매매가` | Parsed range min |
| `sale_price_max_krw` | bigint | no | `매매가` | Parsed range max |
| `investment_min_krw` | bigint | no | `최소 실투자금(억)` | Reverse Filter primary key |
| `investment_max_krw` | bigint | no | `최대 실투자금(억)` | If blank, may equal min only when policy explicitly allows |
| `source_file` | text | yes | import context | Example: `golden_samples260519.csv.csv` |
| `source_date` | date | yes | import context | Example: `2026-05-19` |
| `created_at` | timestamptz | yes | generated | Insert time |

Reverse Filter eligibility:

- A row is eligible only when `investment_min_krw` is not null.
- If `investment_max_krw` is null, UI must display a single-sided estimate rather than a false range.
- `investment_min_krw` must be less than or equal to `investment_max_krw` when both exist.

## 7. `reference_apartments`

Purpose: existing apartment or blue-chip reference price master data.

| Column | Type | Required | Source | Notes |
|---|---:|:---:|---|---|
| `id` | uuid | yes | generated | Primary key |
| `apartment_name` | text | yes | `비교 기축 아파트` or Naver Land | Normalized name |
| `district` | text | no | Naver Land or derived | Optional in MVP if source lacks it |
| `dong` | text | no | Naver Land or derived | Optional in MVP if source lacks it |
| `area_m2` | numeric | no | Naver Land | Prefer exclusive area when available |
| `current_price_krw` | bigint | no | `기축 아파트 시세(억)` or Naver Land | Latest curated reference price |
| `is_presale` | boolean | yes | name/source parsing | true for `분양권` |
| `source_file` | text | yes | import context | Source file for current price |
| `source_captured_at` | timestamptz | no | import context | Use when XLSX capture time is known |
| `updated_at` | timestamptz | yes | generated | Updated on upsert |

Natural key for MVP:

```text
apartment_name + area_m2 + is_presale
```

If `area_m2` is missing, use:

```text
apartment_name + is_presale
```

and mark the row for quality review.

## 8. `zone_reference_apartments`

Purpose: connect redevelopment zones to one or more comparable existing apartments.

| Column | Type | Required | Source | Notes |
|---|---:|:---:|---|---|
| `id` | uuid | yes | generated | Primary key |
| `zone_id` | uuid | yes | `zones.id` | FK |
| `reference_apartment_id` | uuid | yes | `reference_apartments.id` | FK |
| `priority` | integer | yes | source order | Starts at 1 |
| `reason` | text | no | derived/import context | Example: `golden sample comparison target` |

Parsing rule:

- Split multiple apartment names in `비교 기축 아파트` into separate rows.
- Preserve source order as `priority`.
- If a price is embedded in the comparison apartment string, parse it into `reference_apartments.current_price_krw` only when unambiguous.

## 9. `ltv_policies`

Purpose: store cash-band matching policy and optional LTV/DSR interpretation values without hardcoding policy in application logic.

For the MVP, this table primarily stores dynamic cash-tier bands (`T1`~`T4`). These tiers are not assigned to zones. The application computes a user's tier at runtime by comparing available cash against the active policy bands, then compares that cash against each zone's latest `investment_min_krw`.

`ltv_ratio` remains optional until a verified lending policy source is introduced. Do not invent or backfill LTV ratios from the current curation documents.

| Column | Type | Required | Source | Notes |
|---|---:|:---:|---|---|
| `id` | uuid | yes | generated | Primary key |
| `tier_name` | text | yes | `DATA_CURATION_SPEC.v.2.md` | Example: `T1` |
| `cash_min_krw` | bigint | yes | tier range | Inclusive |
| `cash_max_krw` | bigint | no | tier range | Exclusive; null means open-ended |
| `ltv_ratio` | numeric | no | policy input | Do not invent if source lacks it |
| `dsr_note` | text | no | policy input | Explanation only in MVP |
| `effective_from` | date | yes | policy input | Required for auditability |
| `effective_to` | date | no | policy input | Null means active until replaced |
| `is_active` | boolean | yes | generated/input | Only active rows are used by MVP logic |

Initial MVP tier ranges:

| Tier | `cash_min_krw` | `cash_max_krw` |
|---|---:|---:|
| `T1` | `100000000` | `300000000` |
| `T2` | `300000000` | `500000000` |
| `T3` | `500000000` | `1000000000` |
| `T4` | `1000000000` | null |

These tiers are matching/display categories, not a replacement for investment snapshots.

Runtime classification example:

```text
user_cash_krw = 450000000 -> T2
zone.investment_min_krw = 380000000 -> budget match
zone.investment_min_krw = 520000000 -> near/over budget depending on UI rule
```

## 10. Source Mapping: `golden_samples260519.csv.csv`

| Source column | Target table | Target column | Transform |
|---|---|---|---|
| `행정구` | `zones` | `district` | trim |
| `행정동` | `zones` | `dong` | trim |
| `구역명` | `zones` | `zone_name` | trim |
| `현재 단계` | `zones` | `stage` | trim + typo normalization |
| `매매가` | `zone_investment_snapshots` | `sale_price_min_krw`, `sale_price_max_krw` | parse `억` range |
| `최소 실투자금(억)` | `zone_investment_snapshots` | `investment_min_krw` | decimal 억 to KRW |
| `최대 실투자금(억)` | `zone_investment_snapshots` | `investment_max_krw` | decimal 억 to KRW or null |
| `특징/호재` | `zones` | `notes` | preserve text |
| `비교 기축 아파트` | `reference_apartments`, `zone_reference_apartments` | `apartment_name`, relation | split into comparable apartments |
| `기축 아파트 시세(억)` | `reference_apartments` | `current_price_krw` | decimal 억 to KRW |

## 11. Expected Naver Land XLSX Contract

The Naver Land XLSX files are treated as external price evidence. The exact workbook columns may vary, so the normalizer must map them into this stable contract.

MVP rule: import only the fields needed for comparison cards and reverse-filter context. Do not store full raw history in the MVP schema unless a later issue explicitly adds a raw evidence table.

Required normalized fields:

| Normalized field | Type | Required | Notes |
|---|---:|:---:|---|
| `apartment_name` | text | yes | Must match or create `reference_apartments` |
| `current_price_krw` | bigint | yes | Use representative/current asking or transaction price selected by curation rule |
| `source_file` | text | yes | XLSX filename |
| `source_captured_at` | timestamptz | no | Capture time when known |

Recommended normalized fields:

| Normalized field | Type | Required | Notes |
|---|---:|:---:|---|
| `district` | text | no | Helps disambiguate duplicate apartment names |
| `dong` | text | no | Helps disambiguate duplicate apartment names |
| `area_m2` | numeric | no | Prefer 84-type equivalent when available |
| `is_presale` | boolean | yes | Default false unless source/name indicates presale |

If multiple prices exist for the same apartment, MVP import should choose one curated representative value and record the source file. Raw transaction history can be added after the prototype.

## 12. Validation Rules

Importers for `MVP-005` and `MVP-006` must report these issues:

- missing `district`, `dong`, or `zone_name`
- missing `investment_min_krw`
- `investment_min_krw > investment_max_krw`
- unknown or unnormalized `stage`
- duplicate `district + dong + zone_name`
- reference apartment name missing while price exists
- reference apartment price missing while name exists
- `current_price_krw <= 0`
- price change greater than 20% from previous snapshot
- missing `source_file`
- missing or ambiguous source date

Validation output should be machine-readable in later issues, but `MVP-003` only defines the required checks.

## 13. Decisions For MVP

- The normalized DB contract is the application-facing source of truth.
- Markdown specs explain interpretation policy; the app should not parse markdown tables at runtime.
- Zone master data is district-based. Tiers are dynamic runtime classifications, not fixed zone attributes.
- Money is always stored as integer KRW.
- `investment_min_krw` is the primary Reverse Filter matching value.
- `ltv_ratio` is optional until a verified policy source exists.
- Existing apartment raw history is deferred; MVP uses curated representative reference prices.
- Missing source files fail loudly.
- B2B listings, Verified listings, chat, and Admin dashboards remain out of scope for this data contract.
