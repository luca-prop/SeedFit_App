# SeedFit MVP Naver Land Normalization 260621

## 1. Purpose

This document completes `MVP-006: Naver Land XLSX 정규화 스크립트 작성`.

The Naver Land XLSX files are listing evidence for existing apartment reference prices. The normalization script converts the required two-file XLSX set into a deterministic JSON payload that can later feed `reference_apartments` and preserve source listing evidence for curation review.

This step does not connect to Supabase. DB insertion is deferred until the seed/upsert task.

## 2. Files

- Input: `docs/Naver_Land_0503_1129.xlsx`
- Input: `docs/Naver_Land_0503_1132.xlsx`
- Script: `scripts/data/normalize_naver_land.py`
- Output: `data/normalized/naver_land_0503.normalized.json`

Run:

```bash
python scripts/data/normalize_naver_land.py --year 2026
```

Optional custom paths:

```bash
python scripts/data/normalize_naver_land.py \
  --year 2026 \
  --input docs/Naver_Land_0503_1129.xlsx docs/Naver_Land_0503_1132.xlsx \
  --output data/normalized/naver_land_0503.normalized.json
```

The XLSX filename contains month/day and time, but not the year. The script requires `--year` so the source capture timestamp is explicit.

## 3. Workflow

MVP-006 follows this curation flow:

1. Load exactly two Naver Land XLSX files: `Naver_Land_0503_1129.xlsx` and `Naver_Land_0503_1132.xlsx`.
2. Preserve all active `매매` rows as listing evidence.
3. Exclude `매물없음` rows from price calculation and count them as `withoutCurrentListing`.
4. Exclude `저층` rows from reference price calculation.
5. For each apartment complex, select the lowest price among non-low-floor listings.
6. If an apartment has only low-floor listings, select the lowest low-floor listing as a fallback and mark `isLowFloorFallback`.
7. Use that selected price as the candidate reference price for `docs/DATA_CURATION_SPEC.v.2.md`.
8. Defer Supabase upsert and Golden Sample linkage to later MVP tasks.

## 4. Source Structure

Both XLSX files use one sheet named `Sheet`.

Expected columns:

| Column | Meaning |
| --- | --- |
| `단지명` | Apartment complex name |
| `구분` | Listing floor band or source status, e.g. `저층`, `중고층`, `매물없음` |
| `거래` | Deal type; MVP accepts `매매` only |
| `전용(m2)` | Exclusive area in square meters |
| `층` | Floor text such as `4/15`, `저/15`, `고/15` |
| `가격(억)` | Listing price in `억` |
| `특징` | Source listing note |

## 5. Output Shape

```json
{
  "source": {
    "files": [
      "docs/Naver_Land_0503_1129.xlsx",
      "docs/Naver_Land_0503_1132.xlsx"
    ],
    "sourceCapturedAt": [
      "2026-05-03T11:29:00+09:00",
      "2026-05-03T11:32:00+09:00"
    ],
    "sourceYear": 2026
  },
  "referenceApartments": [],
  "referenceApartmentListingEvidence": [],
  "lowFloorFallbackApartments": [],
  "summary": {
    "sourceFileCount": 2,
    "listingCount": 529,
    "referencePriceCandidateCount": 304,
    "excludedLowFloorListingCount": 225,
    "referenceApartmentCount": 72,
    "lowFloorFallbackCount": 2,
    "withoutCurrentListing": 2,
    "warningCount": 0,
    "warnings": []
  }
}
```

## 6. Mapping Rules

`referenceApartments` is selected by apartment complex:

```text
apartmentName + isPresale
```

The script removes spaces inside apartment names to match Golden Sample naming more consistently. For example, `이촌 한가람` becomes `이촌한가람`.

All money values are normalized from `억` units to integer KRW.

Examples:

- `16.3` -> `1630000000`
- `25` -> `2500000000`
- blank -> `null`

## 7. Representative Price

Naver Land rows are listing evidence, not a single closing price. For MVP-006, the representative `currentPriceKrw` is the lowest listing price among non-low-floor listings for each apartment complex.

Rows where `구분 = 저층` are preserved as evidence. They are excluded when a non-low-floor listing exists, but if the apartment has only low-floor listings, the script uses the lowest low-floor listing as a fallback and marks `isLowFloorFallback: true`.

Rows where `구분 = 매물없음` are not evidence rows and are counted as `withoutCurrentListing`.

The output also keeps:

- `priceMinKrw`
- `priceMaxKrw`
- `priceSelectionPolicy`
- `isLowFloorFallback`
- `listingCount`
- `allListingCount`
- `selectedSourceRow`
- `selectedListingType`
- `selectedRawFloor`
- `sourceFiles`
- `sourceCapturedAt`

This keeps the DB-ready payload simple while preserving enough evidence for later curation and quality checks.

## 8. Listing Evidence

`referenceApartmentListingEvidence` preserves row-level source details:

- normalized apartment name
- area
- price
- floor text
- parsed numeric floor when possible
- floor band such as `저`, `중`, `고`
- normalized `floorTier`, e.g. `HIGH`, `MID`, `LOW`
- listing note
- source file
- source row
- whether the row was eligible for reference price selection
- low-floor exclusion reason when applicable

This section is not the final MVP DB table contract. It is a review payload for curation and future seed/upsert logic.

## 9. Validation Summary

Current generated result:

- `sourceFileCount`: 2
- `listingCount`: 529
- `referencePriceCandidateCount`: 304
- `excludedLowFloorListingCount`: 225
- `referenceApartmentCount`: 72
- `lowFloorFallbackCount`: 2
- `withoutCurrentListing`: 2
- `warningCount`: 0

`withoutCurrentListing` is not a warning. It means the source explicitly has `매물없음`, so the apartment has no current usable Naver listing in that XLSX snapshot.

`lowFloorFallbackCount` is not a warning. It means the apartment has active sale rows, but all of them are low-floor listings, so the lowest low-floor listing is selected and clearly marked.

Warning categories:

- `unexpected_headers`: XLSX columns differ from the expected contract.
- `missing_apartment_name`: `단지명` is blank.
- `non_sale_listing`: `거래` is not `매매`.
- `missing_area_m2`: `전용(m2)` is blank.
- `missing_price`: `가격(억)` is blank for an active listing.
- `parse_error`: area or money value cannot be parsed.
- missing `--year`: script exits before normalization because the capture year cannot be inferred from the filename.

For MVP-006, warnings are not failures. They are review markers for the seed/upsert and data quality tasks.

## 10. Deferred

- Supabase connection and upsert execution.
- Linking Naver reference apartments to Golden Sample comparison hints.
- District/dong enrichment for each apartment.
- Updating curated comparison prices in `docs/DATA_CURATION_SPEC.v.2.md` after human review of the generated lowest non-low-floor candidates.
