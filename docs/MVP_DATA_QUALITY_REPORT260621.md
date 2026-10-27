# SeedFit MVP Data Quality Report 260621

## 1. Purpose

This document completes `MVP-008: 데이터 품질 검증 리포트 작성`.

The report validates normalized Golden Sample data, Naver Land reference evidence, and the generated seed SQL artifact before DB-dependent runtime checks.

## 2. Overall Status

- Status: `review`
- Golden rows: `114`
- Zones: `114`
- Reverse Filter eligible zones: `108`
- Zones without current listing/investment amount: `6`
- Future-value reference hints: `114`
- Naver listing evidence rows: `529`
- Naver reference apartments: `72`

## 3. Seed SQL Counts

- `zones`: `114`
- `zoneInvestmentSnapshots`: `114`
- `referenceApartments`: `92`
- `zoneReferenceApartments`: `114`
- `ltvPolicies`: `4`
- `futureValueReferenceReasons`: `114`
- `legacyComparisonReasons`: `0`
- `commitStatements`: `1`

## 4. Findings

### `missing_investment_min`

- Severity: `info`
- Count: `6`
- Meaning: 실투자금이 비어 있어 Reverse Filter 대상에서는 제외되지만, 현재 매물 없음 상태로 관리합니다.

- `{"zoneNaturalKey": "동대문구|제기동|제기 4구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`
- `{"zoneNaturalKey": "성북구|하월곡동|신월곡 1구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`
- `{"zoneNaturalKey": "동작구|노량진동|노량진 14구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`
- `{"zoneNaturalKey": "동작구|사당동|사당 19구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`
- `{"zoneNaturalKey": "동작구|상도동|상도 24구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`
- `{"zoneNaturalKey": "성동구|행당동|행당 8구역", "sourceFile": "golden_samples261027.csv.csv", "sourceDate": "2026-10-27"}`

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


### `moa_stage_on_non_moa_zone`

- Severity: `error`
- Count: `0`
- Meaning: 구역명에 모아가 없는데 (모아)* 단계가 붙어 있습니다. 장위15 사고 — 일반 재개발 통합심의를 모아로 읽지 않습니다.


### `price_spread_over_20_percent`

- Severity: `warning`
- Count: `79`
- Meaning: 단일 source의 min/max 가격 범위가 20% 이상 벌어진 항목입니다. 시계열 변동률은 sourceDate가 추가된 뒤 별도 산정합니다.

- `{"type": "zone_sale_price_range", "naturalKey": "강북구|미아동|미아 2구역", "minKrw": 750000000, "maxKrw": 1250000000, "spreadRatio": 0.6667}`
- `{"type": "zone_investment_range", "naturalKey": "강북구|미아동|미아 2구역", "minKrw": 420000000, "maxKrw": 648000000, "spreadRatio": 0.5429}`
- `{"type": "zone_sale_price_range", "naturalKey": "강북구|미아동|미아 4구역", "minKrw": 1120000000, "maxKrw": 1600000000, "spreadRatio": 0.4286}`
- `{"type": "zone_sale_price_range", "naturalKey": "강북구|미아동|미아 9-2구역(재건축)", "minKrw": 600000000, "maxKrw": 1000000000, "spreadRatio": 0.6667}`
- `{"type": "zone_investment_range", "naturalKey": "강북구|미아동|미아 9-2구역(재건축)", "minKrw": 550000000, "maxKrw": 750000000, "spreadRatio": 0.3636}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양2동 649(B)(모아타운)", "minKrw": 900000000, "maxKrw": 1200000000, "spreadRatio": 0.3333}`
- `{"type": "zone_investment_range", "naturalKey": "광진구|자양동|자양동 772-1(건대모아)", "minKrw": 800000000, "maxKrw": 1300000000, "spreadRatio": 0.625}`
- `{"type": "zone_sale_price_range", "naturalKey": "구리시|수택동|수택 2구역", "minKrw": 310000000, "maxKrw": 390000000, "spreadRatio": 0.2581}`
- `{"type": "zone_investment_range", "naturalKey": "구리시|수택동|수택 2구역", "minKrw": 300000000, "maxKrw": 370000000, "spreadRatio": 0.2333}`
- `{"type": "zone_sale_price_range", "naturalKey": "금천구|독산동|독산 1구역", "minKrw": 690000000, "maxKrw": 1200000000, "spreadRatio": 0.7391}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산 1구역", "minKrw": 590000000, "maxKrw": 1120000000, "spreadRatio": 0.8983}`
- `{"type": "zone_sale_price_range", "naturalKey": "금천구|독산동|독산 2구역", "minKrw": 480000000, "maxKrw": 1070000000, "spreadRatio": 1.2292}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산 2구역", "minKrw": 273000000, "maxKrw": 797000000, "spreadRatio": 1.9194}`
- `{"type": "zone_sale_price_range", "naturalKey": "금천구|독산동|독산시흥구역", "minKrw": 658000000, "maxKrw": 930000000, "spreadRatio": 0.4134}`
- `{"type": "zone_investment_range", "naturalKey": "금천구|독산동|독산시흥구역", "minKrw": 235000000, "maxKrw": 658000000, "spreadRatio": 1.8}`
- `{"type": "zone_investment_range", "naturalKey": "동대문구|용두동|용두 7구역", "minKrw": 315000000, "maxKrw": 380000000, "spreadRatio": 0.2063}`
- `{"type": "zone_investment_range", "naturalKey": "동대문구|전농동|전농 8구역", "minKrw": 950000000, "maxKrw": 1200000000, "spreadRatio": 0.2632}`
- `{"type": "zone_sale_price_range", "naturalKey": "동작구|노량진동|노량진 1구역", "minKrw": 2020000000, "maxKrw": 2700000000, "spreadRatio": 0.3366}`
- `{"type": "zone_sale_price_range", "naturalKey": "동작구|노량진동|노량진 3구역", "minKrw": 2000000000, "maxKrw": 3300000000, "spreadRatio": 0.65}`
- `{"type": "zone_sale_price_range", "naturalKey": "동작구|대방동|노량진 7구역", "minKrw": 2100000000, "maxKrw": 3100000000, "spreadRatio": 0.4762}`
- ... and 59 more

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
- Count: `119`
- Meaning: Golden Sample normalization warning count.

- `{"row": 2, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "강북구|미아동|미아 2구역"}`
- `{"row": 3, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "강북구|미아동|미아 3구역"}`
- `{"row": 4, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "강북구|미아동|미아 4구역"}`
- `{"row": 5, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "강북구|미아동|미아 9-2구역(재건축)"}`
- `{"row": 6, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양 7구역"}`
- `{"row": 7, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양1동 779(모아타운)"}`
- `{"row": 8, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양2동 649(B)(모아타운)"}`
- `{"row": 9, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양4동 A구역"}`
- `{"row": 10, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양3동A구역"}`
- `{"row": 11, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "광진구|자양동|자양동 772-1(건대모아)"}`
- `{"row": 12, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "구리시|수택동|수택 2구역"}`
- `{"row": 13, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "금천구|독산동|독산 1구역"}`
- `{"row": 14, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "금천구|독산동|독산 2구역"}`
- `{"row": 15, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "금천구|독산동|독산시흥구역"}`
- `{"row": 16, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|용두동|용두 7구역"}`
- `{"row": 17, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|이문동|이문 4구역"}`
- `{"row": 18, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|전농동|전농 8구역"}`
- `{"row": 19, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|제기동|제기 4구역"}`
- `{"row": 20, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|제기동|제기 6구역"}`
- `{"row": 21, "code": "reference_name_without_price", "message": "reference apartment exists without shared price", "zoneNaturalKey": "동대문구|청량리동|청량리 6구역"}`
- ... and 99 more

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
