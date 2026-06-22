# SeedFit MVP Data Quality Report 260621

## 1. Purpose

This document completes `MVP-008: 데이터 품질 검증 리포트 작성`.

The report validates normalized Golden Sample data, Naver Land reference evidence, and the generated seed SQL artifact before DB-dependent runtime checks.

## 2. Overall Status

- Status: `review`
- Golden rows: `84`
- Zones: `84`
- Reverse Filter eligible zones: `81`
- Zones without current listing/investment amount: `3`
- Future-value reference hints: `97`
- Naver listing evidence rows: `529`
- Naver reference apartments: `72`

## 3. Seed SQL Counts

- `zones`: `84`
- `zoneInvestmentSnapshots`: `84`
- `referenceApartments`: `86`
- `zoneReferenceApartments`: `97`
- `ltvPolicies`: `4`
- `futureValueReferenceReasons`: `97`
- `legacyComparisonReasons`: `0`
- `commitStatements`: `1`

## 4. Findings

### `missing_investment_min`

- Severity: `info`
- Count: `3`
- Meaning: 실투자금이 비어 있어 Reverse Filter 대상에서는 제외되지만, 현재 매물 없음 상태로 관리합니다.

- `{"zoneNaturalKey": "성동구|행당동|행당 8구역", "sourceFile": "golden_samples260519.csv.csv", "sourceDate": "2026-05-19"}`
- `{"zoneNaturalKey": "동작구|사당동|사당 19구역", "sourceFile": "golden_samples260519.csv.csv", "sourceDate": "2026-05-19"}`
- `{"zoneNaturalKey": "동작구|상도동|상도 24구역", "sourceFile": "golden_samples260519.csv.csv", "sourceDate": "2026-05-19"}`

### `inverted_min_max`

- Severity: `error`
- Count: `0`
- Meaning: min 값이 max 값보다 큰 항목입니다. 앱 매칭 전에 수정이 필요합니다.


### `duplicate_zone`

- Severity: `error`
- Count: `0`
- Meaning: 행정구 + 행정동 + 구역명 natural key가 중복된 구역입니다.


### `unknown_stage`

- Severity: `error`
- Count: `0`
- Meaning: 허용 stage 목록에 없는 단계 값입니다.


### `price_spread_over_20_percent`

- Severity: `warning`
- Count: `33`
- Meaning: 단일 source의 min/max 가격 범위가 20% 이상 벌어진 항목입니다. 시계열 변동률은 sourceDate가 추가된 뒤 별도 산정합니다.

- `{"type": "zone_sale_price_range", "naturalKey": "용산구|청파동|청파 2구역", "minKrw": 650000000, "maxKrw": 800000000, "spreadRatio": 0.2308}`
- `{"type": "zone_investment_range", "naturalKey": "용산구|청파동|청파 2구역", "minKrw": 550000000, "maxKrw": 790000000, "spreadRatio": 0.4364}`
- `{"type": "zone_investment_range", "naturalKey": "용산구|후암동|동후암 1구역", "minKrw": 460000000, "maxKrw": 630000000, "spreadRatio": 0.3696}`
- `{"type": "zone_investment_range", "naturalKey": "용산구|후암동|동후암 3구역", "minKrw": 600000000, "maxKrw": 720000000, "spreadRatio": 0.2}`
- `{"type": "zone_investment_range", "naturalKey": "용산구|청파동|청파 3구역", "minKrw": 300000000, "maxKrw": 480000000, "spreadRatio": 0.6}`
- `{"type": "zone_sale_price_range", "naturalKey": "용산구|후암동|남산 2구역", "minKrw": 550000000, "maxKrw": 700000000, "spreadRatio": 0.2727}`
- `{"type": "zone_investment_range", "naturalKey": "용산구|후암동|남산 2구역", "minKrw": 450000000, "maxKrw": 560000000, "spreadRatio": 0.2444}`
- `{"type": "zone_investment_range", "naturalKey": "성동구|용답동|용답 2구역", "minKrw": 410000000, "maxKrw": 550000000, "spreadRatio": 0.3415}`
- `{"type": "zone_investment_range", "naturalKey": "성동구|사근동|사근동 190-2", "minKrw": 220000000, "maxKrw": 370000000, "spreadRatio": 0.6818}`
- `{"type": "zone_investment_range", "naturalKey": "성동구|금호동|금호 22구역", "minKrw": 250000000, "maxKrw": 350000000, "spreadRatio": 0.4}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양2동 681(모아타운)", "minKrw": 390000000, "maxKrw": 740000000, "spreadRatio": 0.8974}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양2동 649(B)(모아타운)", "minKrw": 580000000, "maxKrw": 700000000, "spreadRatio": 0.2069}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|구의동|구의동 46", "minKrw": 330000000, "maxKrw": 430000000, "spreadRatio": 0.303}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양2동 663(C)(모아타운)", "minKrw": 520000000, "maxKrw": 680000000, "spreadRatio": 0.3077}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|중곡동|중곡동 232-1(A4)", "minKrw": 200000000, "maxKrw": 250000000, "spreadRatio": 0.25}`
- `{"type": "zone_sale_price_range", "naturalKey": "광진구|구의동|구의1동 221-1", "minKrw": 540000000, "maxKrw": 650000000, "spreadRatio": 0.2037}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|구의동|구의1동 221-1", "minKrw": 400000000, "maxKrw": 500000000, "spreadRatio": 0.25}`
- `{"type": "zone_sale_price_range", "naturalKey": "광진구|구의동|구의동 32", "minKrw": 600000000, "maxKrw": 730000000, "spreadRatio": 0.2167}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양동 629(모아타운)", "minKrw": 340000000, "maxKrw": 415000000, "spreadRatio": 0.2206}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|상도동|상도 16구역", "minKrw": 230000000, "maxKrw": 400000000, "spreadRatio": 0.7391}`
- ... and 13 more

### `reference_link_count_mismatch`

- Severity: `error`
- Count: `0`
- Meaning: Golden future-value reference hint 수와 seed SQL의 zone-reference link 수가 다릅니다.


### `seed_count_mismatch`

- Severity: `error`
- Count: `0`
- Meaning: 정규화 payload 기준 기대 건수와 seed SQL INSERT 건수가 다릅니다.


### `golden_normalization_warnings`

- Severity: `warning`
- Count: `0`
- Meaning: Golden Sample normalization warning count.


### `naver_normalization_warnings`

- Severity: `warning`
- Count: `0`
- Meaning: Naver Land normalization warning count.


### `low_floor_fallback_reference`

- Severity: `info`
- Count: `2`
- Meaning: 중고층 이상 매물이 없어 저층 기준가로 fallback된 레퍼런스 단지입니다.

- `{"apartmentName": "교문동하나", "listingCount": 1, "reason": "only_low_floor_listings"}`
- `{"apartmentName": "청구e편한세상", "listingCount": 1, "reason": "only_low_floor_listings"}`

## 5. Notes

- reference_apartments는 동일 예산 기축 대조군이 아니라 구역별 미래가치 레퍼런스 단지입니다.
- DATA_CURATION_SPEC.v.2.md section 3의 LTV 기반 동일 예산 기축 대조군은 MVP-008 검증 대상 데이터에 아직 포함되지 않습니다.
- 20% 이상 가격 변동은 현재 단일 source min/max range spread로 산정했습니다. sourceDate가 누적되면 시계열 변동률 검증으로 확장해야 합니다.
- 현재 리포트는 정규화 payload와 seed SQL 산출물 기준 검증입니다. Supabase 실제 row count는 별도 DB client 검증 또는 Dashboard 확인으로 보완합니다.
