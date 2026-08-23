# SeedFit MVP Data Quality Report 260621

## 1. Purpose

This document completes `MVP-008: 데이터 품질 검증 리포트 작성`.

The report validates normalized Golden Sample data, Naver Land reference evidence, and the generated seed SQL artifact before DB-dependent runtime checks.

## 2. Overall Status

- Status: `fail`
- Golden rows: `110`
- Zones: `110`
- Reverse Filter eligible zones: `103`
- Zones without current listing/investment amount: `7`
- Future-value reference hints: `110`
- Naver listing evidence rows: `529`
- Naver reference apartments: `72`

## 3. Seed SQL Counts

- `zones`: `84`
- `zoneInvestmentSnapshots`: `83`
- `referenceApartments`: `85`
- `zoneReferenceApartments`: `83`
- `ltvPolicies`: `4`
- `futureValueReferenceReasons`: `83`
- `legacyComparisonReasons`: `0`
- `commitStatements`: `1`

## 4. Findings

### `missing_investment_min`

- Severity: `info`
- Count: `7`
- Meaning: 실투자금이 비어 있어 Reverse Filter 대상에서는 제외되지만, 현재 매물 없음 상태로 관리합니다.

- `{"zoneNaturalKey": "동대문구|제기동|제기 4구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "동대문구|청량리동|청량리 6구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "성북구|하월곡동|신월곡 1구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "동작구|노량진동|노량진 14구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "동작구|사당동|사당 19구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "동작구|상도동|상도 24구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`
- `{"zoneNaturalKey": "성동구|행당동|행당 8구역", "sourceFile": "golden_samples260823.csv.csv", "sourceDate": "2026-08-23"}`

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
- Count: `58`
- Meaning: 단일 source의 min/max 가격 범위가 20% 이상 벌어진 항목입니다. 시계열 변동률은 sourceDate가 추가된 뒤 별도 산정합니다.

- `{"type": "zone_investment_range", "naturalKey": "강북구|미아동|미아 2구역", "minKrw": 620000000, "maxKrw": 1050000000, "spreadRatio": 0.6935}`
- `{"type": "zone_investment_range", "naturalKey": "강북구|미아동|미아 4구역", "minKrw": 1120000000, "maxKrw": 1600000000, "spreadRatio": 0.4286}`
- `{"type": "zone_investment_range", "naturalKey": "강북구|미아동|미아 9-2구역(재건축)", "minKrw": 540000000, "maxKrw": 1000000000, "spreadRatio": 0.8519}`
- `{"type": "zone_investment_range", "naturalKey": "구리시|수택동|수택 2구역", "minKrw": 240000000, "maxKrw": 290000000, "spreadRatio": 0.2083}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산 1구역", "minKrw": 690000000, "maxKrw": 1180000000, "spreadRatio": 0.7101}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산 2구역", "minKrw": 480000000, "maxKrw": 880000000, "spreadRatio": 0.8333}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산시흥구역", "minKrw": 335000000, "maxKrw": 930000000, "spreadRatio": 1.7761}`
- `{"type": "zone_investment_range", "naturalKey": "동대문구|용두동|용두 7구역", "minKrw": 315000000, "maxKrw": 380000000, "spreadRatio": 0.2063}`
- `{"type": "zone_investment_range", "naturalKey": "동대문구|전농동|전농 8구역", "minKrw": 950000000, "maxKrw": 1255000000, "spreadRatio": 0.3211}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|노량진동|노량진 1구역", "minKrw": 1580000000, "maxKrw": 2700000000, "spreadRatio": 0.7089}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|노량진동|노량진 3구역", "minKrw": 2000000000, "maxKrw": 3300000000, "spreadRatio": 0.65}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|대방동|노량진 7구역", "minKrw": 2100000000, "maxKrw": 3100000000, "spreadRatio": 0.4762}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|사당동|사당 12구역", "minKrw": 155000000, "maxKrw": 410000000, "spreadRatio": 1.6452}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|사당동|사당 17구역", "minKrw": 1000000000, "maxKrw": 1350000000, "spreadRatio": 0.35}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|사당동|사당 5구역(재건축)", "minKrw": 750000000, "maxKrw": 1200000000, "spreadRatio": 0.6}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|상도동|상도 14구역", "minKrw": 680000000, "maxKrw": 860000000, "spreadRatio": 0.2647}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|상도동|상도 15구역", "minKrw": 800000000, "maxKrw": 960000000, "spreadRatio": 0.2}`
- `{"type": "zone_investment_range", "naturalKey": "동작구|상도동|상도 21구역(모아타운)", "minKrw": 180000000, "maxKrw": 390000000, "spreadRatio": 1.1667}`
- `{"type": "zone_sale_price_range", "naturalKey": "동작구|흑석동|흑석 10구역", "minKrw": 950000000, "maxKrw": 1350000000, "spreadRatio": 0.4211}`
- `{"type": "zone_investment_range", "naturalKey": "마포구|공덕동|공덕 7구역", "minKrw": 948000000, "maxKrw": 1150000000, "spreadRatio": 0.2131}`
- ... and 38 more

### `reference_link_count_mismatch`

- Severity: `error`
- Count: `1`
- Meaning: Golden future-value reference hint 수와 seed SQL의 zone-reference link 수가 다릅니다.

- `{"referenceHintCount": 110, "seedLinkCount": 83}`

### `seed_count_mismatch`

- Severity: `error`
- Count: `3`
- Meaning: 정규화 payload 기준 기대 건수와 seed SQL INSERT 건수가 다릅니다.

- `{"name": "zones", "expected": 110, "actual": 84}`
- `{"name": "zoneInvestmentSnapshots", "expected": 110, "actual": 83}`
- `{"name": "zoneReferenceApartments", "expected": 110, "actual": 83}`

### `golden_normalization_warnings`

- Severity: `warning`
- Count: `1`
- Meaning: Golden Sample normalization warning count.

- `{"row": 70, "code": "missing_zone_key", "message": "district, dong, or zone_name is missing", "zoneNaturalKey": "||—— SUB (구역지정 전 · Watch) ——"}`

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
