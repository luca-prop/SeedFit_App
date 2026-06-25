# SeedFit MVP Golden Samples Normalization 260621

## 1. Purpose

This document completes `MVP-005: 구역 CSV 정규화 스크립트 작성`.

`docs/golden_samples260519.csv.csv` is the MVP source of truth for redevelopment zone candidates. The normalization script converts that CSV into a deterministic JSON payload that can later be adapted into Prisma seed data or Supabase upsert payloads.

This step does not connect to Supabase. DB insertion is deferred until the seed/upsert task.

## 2. Files

- Input: `docs/golden_samples260519.csv.csv`
- Script: `scripts/data/normalize_golden_samples.py`
- Output: `data/normalized/golden_samples260519.normalized.json`

Run:

```bash
python scripts/data/normalize_golden_samples.py
```

Optional custom paths:

```bash
python scripts/data/normalize_golden_samples.py \
  --input docs/golden_samples260519.csv.csv \
  --output data/normalized/golden_samples260519.normalized.json
```

## 3. Output Shape

The JSON output is intentionally aligned with the MVP data contract while keeping DB-generated IDs out of the file.

```json
{
  "source": {
    "file": "docs/golden_samples260519.csv.csv",
    "sourceDate": "2026-05-19"
  },
  "zones": [],
  "zoneInvestmentSnapshots": [],
  "referenceApartmentHints": [],
  "summary": {
    "rowCount": 84,
    "zoneCount": 84,
    "eligibleForReverseFilter": 81,
    "withoutCurrentListing": 3,
    "referenceHintCount": 97,
    "warningCount": 0,
    "warnings": []
  }
}
```

## 4. Mapping Rules

`zones` uses `행정구 + 행정동 + 구역명` as `naturalKey`. This is a temporary import key for MVP scripts and should not be exposed as a user-facing ID.

| CSV column | Output field |
| --- | --- |
| `행정구` | `zones[].district` |
| `행정동` | `zones[].dong` |
| `구역명` | `zones[].zoneName` |
| `현재 단계` | `zones[].stage` |
| `특징/호재` | `zones[].notes` |
| `매매가` | `zoneInvestmentSnapshots[].salePriceMinKrw`, `salePriceMaxKrw` |
| `최소 실투자금(억)` | `zoneInvestmentSnapshots[].investmentMinKrw` |
| `최대 실투자금(억)` | `zoneInvestmentSnapshots[].investmentMaxKrw` |
| `비교 기축 아파트` | `referenceApartmentHints[]` |
| `기축 아파트 시세(억)` | `referenceApartmentHints[].currentPriceKrw`, when safely assignable |

## 5. Money Rules

All money values are normalized from `억` units to integer KRW.

Examples:

- `11.7` -> `1170000000`
- `14~16` -> `1400000000`, `1600000000`
- blank -> `null`

This follows the fixed money unit rule from `docs/MVP_DATA_COLUMN_CONTRACT260621.md`: application code should not mix `억`, `만원`, and KRW floats after normalization.

## 6. Reference Apartment Hints

`비교 기축 아파트` can contain one or more apartment names separated by `/`.

The script creates `referenceApartmentHints` instead of final `reference_apartments` rows because the CSV is not authoritative enough to resolve every apartment identity. The later Naver LAND XLSX normalization task should confirm names, prices, and final representative apartments.

If a row has multiple apartment names and each apartment name embeds its own price, the script assigns those prices directly.

For the curated Yongsan comparison group, the CSV stores `이촌한가람 30.2억 / 마포자이힐스테이트라첼스 30.6억(분양권)`. The script parses these as separate reference hints and preserves the 분양권 flag for 마포자이힐스테이트라첼스.

If a row has multiple apartment names but only one shared `기축 아파트 시세(억)` value, the script records `ambiguous_reference_price` and leaves per-apartment fallback price as `null` unless the price is embedded directly in the apartment text.

If a single apartment name embeds a price and the shared `기축 아파트 시세(억)` column has a different value, the script keeps both values and records `reference_price_mismatch`.

## 7. Validation Summary

Current generated result:

- `rowCount`: 84
- `zoneCount`: 84
- `eligibleForReverseFilter`: 81
- `withoutCurrentListing`: 3
- `referenceHintCount`: 97
- `warningCount`: 0

Warning categories:

- `ambiguous_reference_price`: multiple comparison apartment names share one price column, so price assignment needs curator review.
- `reference_price_mismatch`: embedded apartment price differs from the shared price column.
- `unknown_stage`: stage is not in the current allowed stage list.
- `money_parse_error`: money text cannot be converted to KRW integer.
- `duplicate_zone`: duplicate `행정구 + 행정동 + 구역명`.

`withoutCurrentListing` is not a warning. It means the source has no current listing/investment amount, so those zones are excluded from Reverse Filter matching until a listing is curated.

For MVP-005, warnings are not failures. They are review markers for the next data curation tasks.

## 8. Deferred

- Supabase connection and upsert execution.
- Prisma seed command integration.
- Naver LAND XLSX parsing and final reference apartment identity resolution.
- Admin UI for correcting warnings.
