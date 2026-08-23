# 재개발 매물 수집 런북 (Zone Listing Crawl)

최종 갱신: 2026-08-22

이 문서는 SeedFit Golden Sample용 **재개발·모아타운 빌라/다가구 매물**을 네이버에서 가져와
검수 보드 → 승인 → 실투자금 반영까지 가는 운영 계약이다.

관련 스크립트: `scripts/data/fetch_zone_listing_candidates.py`,
`enrich_listing_details.py`, `export_listings_sheet.py`, `render_listing_review_html.py`,
`apply_approved_listing_investments.py`.

---

## 1. 한 줄로 요약

```
구역 폴리곤 ∩ 법정동(cortar) 합집합 수집 → PIP로 안쪽만 남김 → 상세 보강 → 검수 보드 → 승인 → 실투자금만 Golden 반영
```

**설명에 구역명이 적힌 매물만 가져오는 방식이 아니다.**  
문구 매칭(`mentions_zone`)은 점수·플래그일 뿐이고, **구역 소속 판정의 주축은 폴리곤(PIP)** 이다.

### 법정동 겹침 (행정동 ≠ 법정동)

네이버 API는 **법정동 cortarNo**만 받는다. 지도 UI의 「충현동」은 행정동이라 북아현동만 조회하면 충정로2·3가 매물이 빠진다.

- 기본: `--overlap-cortars`(ON) — 구역 폴리곤과 교차하는 지적 PNU의 앞 10자리(법정동)를 모두 조회
- 해석/캐시: `scripts/data/resolve_overlapping_cortars.py` → `data/reference/zone_cortar_overlays.json`
- 끄기: `--no-overlap-cortars` / 캐시만: `--no-overlap-live`

### 관리처분인가 이후 — 정비사업 단지(`redevelopmentAreaNo`) 채널

빌라/다가구(`VL:DDDGG`, 법정동 `articleList`)만으로 **모든 단계**를 커버하지 않는다.

**관리처분계획 인가**를 받은 사업장은 네이버가 아파트 단지처럼 **구역 코드**를 따로 준다. 목록은 `houses`가 아니라 `complexes` + `a=JGB` + `redevelopmentAreaNo`다.

예:

| 구역 | 채널 | `redevelopmentAreaNo` |
| :--- | :--- | :--- |
| 방배 13구역 | JGB 단지 | `10025169` |
| 미아 3구역 | JGB 단지 | `1000318` |
| 미아 4구역 | JGB 단지 | `10013796` |
| 이문 4구역 | JGB ID는 있으나 **매물 0** → 빌라/다가구 혼용 | `10025237` |

URL 형태: `https://new.land.naver.com/complexes?ms=…&a=JGB&b=A1&e=RETAIL&ad=true&redevelopmentAreaNo={id}`

운영 규칙:

1. **기본은 기존 빌라/다가구 + PIP.** 관리처분인가여도 법정동 크롤을 건너뛰지 않는다. 코드가 100% 붙는 것도 아니다.
2. 관리처분인가(및 이후)인데 PIP **좌표 안 매물이 0건**이면, 알려진 `redevelopmentAreaNo`로 **JGB 목록을 병행**한다 (`realEstateType=JGB` + 단지명 힌트 + PIP).
3. JGB 페이지에 매물이 없으면 빌라 결과만 둔다 (이문4 ID 페이지 0건이어도 동 JGB 목록은 있을 수 있음).
4. 관리처분 **공람만**이면 단지 코드가 없을 수 있다 → 빌라만.
5. 구역 ID 레지스트리: `data/reference/naver_jgb_area_ids.json`. 스크립트: `scripts/data/fetch_jgb_listing_fallback.py`.
6. `redevelopmentAreaNo`는 문자열 또는 **배열**. 북아현 3구역은 `1000085`와 `1000612`를 모두 쓴다.
7. `descriptionExclude`가 있으면 단지명·매물특징·태그에 그 문구가 있는 매물은 버린다. 북아현 3구역: 지상권, 무허가, 59제곱, 59타입, 59배정.

---

## 2. 폴리곤은 왜 필요한가? (효용)

네이버 `new.land /api/articles` **빌라 목록**은 **구역이 아니라 법정동(cortarNo)** 단위로만 준다.
자양동에 자양7·자양4동A·모아타운 B가 함께 있으면, API 한 번으로 그 매물이 한꺼번에 온다.

| 단계 | 역할 |
|------|------|
| 동 전수 수집 | 후보 풀을 빠짐없이 확보 (`--max-pages`로 `isMoreData` 소진) |
| 폴리곤 PIP (`--pip-filter`) | 좌표가 구역 폴리곤 **안**인 매물만 남김 → 인접 구역 혼입 제거 |
| 좌표 미공개 | 네이버가 lat/lon을 숨긴 매물 — PIP 불가 → **구역명을 말할 때만 통과** (아래 참조) |
| 소속 필터 (`listing_zone_filters.py`) | 다른 구역 명시 · 근생 · 무검증 좌표미공개를 보드 진입 전에 제거 |

실측 예(2026-08-04): 자양동 800건 수집 → 자양7 폴리곤 안 **18건**.  
폴리곤이 없으면 자양동 전체를 구역별로 나눌 수 없다. **폴리곤 효용은 핵심이다.**

### 소속 필터 — PIP 다음에 반드시 거친다 (2026-08-22 신설)

PIP만으로는 세 종류의 오염을 못 막는다. 2026-08-22 검수에서 58구역 중 13구역이 **보드 5칸 전부**를
구역과 무관한 매물로 채웠고, 원인은 모두 아래 셋 중 하나였다.

| 규칙 | 플래그 | 왜 |
|---|---|---|
| **좌표 미공개는 구역명 필수** | `--no-coord-policy require-mention` (기본) | 좌표 미공개 매물이 무검증 통과해, 폴리곤 안 매물이 0건인 구역(관리처분 후 이주 완료)이 **법정동 전체 매물**로 채워졌다. 미아3·이문4(휘경동)·노량진7(상도동)·대조1이 전부 이 경우. |
| **다른 구역 명시 → 제외** | `--exclude-other-zone` (기본 on) | 설명에 `노량진14구역`·`독산B구역`·`성북2구역`이 적혀 있어도 예전엔 가점만 줬다. 이제 **거부권**이다. 숫자·영문(`B구역`)·`13의6` 표기를 모두 정규화해 비교한다. |
| **구역외 자백 → 제외** | 위와 같은 플래그 | 중개사가 직접 `신흥동구역외`·`재개발 제외`라고 적은 매물. 폴리곤이 시드 확장본이면 이 문구가 폴리곤보다 정확하다 — 신흥 1구역 보드 1·2위가 이런 매물이었다. |
| **같은 이름 다른 사업 → 제외** | 위와 같은 플래그 | `신흥3소규모재개발`은 `신흥 3구역`(LH 순환재개발)이 아니다. 헤드라인에 `소규모재개발`·`가로주택`·`모아타운`·`지구단위`가 있으면 제외한다. Golden 구역 자체가 모아타운이면 적용하지 않는다 — 폴리곤의 `different_project_penalty`와 같은 취지다. |
| **근생 제외** | `--exclude-non-residential` (기본 on) | 매물유형이 `상가`·`근린생활시설`·`사무실`·`빌딩/건물`·`토지`면 무조건 제외. 설명의 `근생`은 아래 두 경우에만 제외한다. |

**타구역·구역외·다른사업 판정은 헤드라인(제목·매물특징)만 본다.** 상세 설명 끝에는
"인근 수진1구역·태평3구역 수익성 분석 상담" 같은 중개사 홍보문이 붙고, 전체 텍스트를 스캔했더니
신흥 3구역 401건 중 280건이 홍보문 때문에 잘려나갔다. 매물이 어느 구역인지는 헤드라인이 말한다.

**설명의 `근생`은 헤드라인이 자기 구역명을 말하면 거부권을 잃는다.** 재개발 구역에서 「근생주택」은
상가주택 = 조합원 물건이고 감정가가 높아 오히려 찾는 물건이다. 이 예외가 없던 동안
신흥 3구역의 7.5억 매물이 잘려 보드가 8.55억부터 시작했고, 금호21구역은 84배정 8건이 통째로 사라졌다.
구역명이 없으면(`근생빌라, 갭투자용`) 예전대로 제외하고, `배정`·`입주권`·`조합원`·`분양신청`·`권리가`·`감정가`
신호도 계속 구제 사유다. **매물유형이 `상가`면 구역명이 있어도 제외**한다.

예외 하나 더: **JGB 채널 매물은 좌표 미공개 정책을 건너뛴다.** `redevelopmentAreaNo`로 직접 조회했으므로
구역 ID 자체가 소속 증거다. 네이버는 정비사업 단지 매물에 좌표를 아예 안 준다.

경기(성남·구리)는 정비구역 WFS가 없어 **PNU 합집합 + 버퍼**를 쓴다. 경계 물건 혼입은 구조적 한계로 인정하고,
`--require-zone-mention`으로 보정한다. 이 요구는 **확정 폴리곤에서만 면제**된다 — 시드 지번을
연결요소로 고시 면적까지 부풀린 폴리곤(`pnu_union_*_expanded`)은 윤곽이 추정치라 "안에 있음"이
소속을 증명하지 못한다. `insideCore` 면제는 별지 지번표로 그린 폴리곤에만 적용한다.

정부 구역계 SoT: `fetch_zone_polygons.py` → `zone_polygons_*.geojson` (서울 Plan+ SHP / 경기 VWorld WFS).

### 폴리곤 오매칭 — 왜 생기고, 어떻게 막는가 (2026-08-22)

서울 Plan+ 레이어에는 진짜 정비구역과 **이름 점수가 똑같은** 다른 사업지가 함께 있다.
`partial_ratio`가 양쪽 다 100을 주면 승자는 SHP 등장 순서나 핀 몇 미터 차이로 갈렸다.

| Golden 구역 | 잘못 붙은 폴리곤 | 정답 | 증상 |
|---|---|---|---|
| 독산 2구역 | `독산2동 380 일대` 12.2ha | `독산2구역` 8.2ha | 독산3(=B구역) 매물 혼입 |
| 자양 7구역 | `자양7특별계획구역 가로주택정비사업` 0.8ha | `자양7` 4.5ha | 구역 매물 대신 지구단위 단독주택 |
| 장위 15구역 | `장위` 32.6ha (촉진지구 축약명) | `장위15구역` 18.9ha | 장위13-6 등 인접 사업지 흡수 |

**방지 규칙 (`different_project_penalty`)** — Golden 이름이 평범한 「N구역」인데 후보에
`일대`·`가로주택`·`소규모재건축`·`소규모재개발`·`특별계획`·`자율주택`·`촉진지구`·`지구단위`가 있으면 **−30**.
Golden 자체가 모아타운/가로주택이면 적용하지 않는다.

**결합정비구역은 별개 문제다.** `신월곡 1구역`은 정부 폴리곤이 *정확*하지만, 결합개발 상대인
**성북2구역(성북동)** 까지 MultiPolygon으로 묶여 있어 성북동 매물이 PIP를 통과했다.
매물 수집에는 하월곡동 본체만 쓴다 (`repair_zone_polygons_260822.py`의 `KEEP_PART_NEAR`).

### 경기 시드 지번 오기 — 두 구역이 통째로 뒤바뀐다 (2026-08-22)

경기는 정비구역 WFS가 없어 `zone_parcel_lists/*.json`의 **대표지번 하나**를 시드로 잡고
연결요소를 고시 면적까지 확장한다. 시드가 틀리면 폴리곤은 **다른 구역 위에 정확한 모양으로** 그려진다.

| 구역 | 있던 시드 | 고시 지번 | 결과 |
|---|---|---|---|
| 신흥 1구역 | 신흥동 `4000` | 신흥동 **4900** (19만6,693㎡) | 신흥3구역 자리를 잡음 |
| 신흥 3구역 | 지번 없음 (zone_geo 중심 좌표) | 신흥동 **2890** (15만3,218㎡) | 신흥1구역 자리를 잡음 |

두 폴리곤이 서로 뒤바뀐 채 면적만 맞아, 신흥 3구역 보드는 폴리곤 안 69건이 **전부 "신흥1구역"**
이라 적힌 매물이었는데도 통과했다. 매물이 없다시피 하니 JGB 25억 상가주택 한 건이 보드를 차지했다.

**시드 지번은 반드시 고시·보도 기사로 교차검증하고 `sourceNote`에 출처를 남긴다.**
면적 커버리지(0.98)는 시드가 틀려도 맞으므로 검증 신호가 못 된다.

**감사 신호 — 폴리곤 안 매물이 하나같이 다른 구역명을 말하면 폴리곤을 의심하라.**
소속 필터가 조용히 다 걸러내므로 보드는 "매물이 없는 구역"처럼 보일 뿐 오류를 드러내지 않는다.
`diagnose_zone_polygon_listings.py`의 `other_zone_in_copy`가 이 신호다.

**상시 감사:** `diagnose_zone_polygon_listings.py`가 면적 이상치(<1ha, >30ha), 지도 핀과 600m 초과 이격,
보드가 좌표 미공개로만 채워진 구역, 다른 구역 언급을 한 번에 뽑는다. 크롤 후 매번 돌린다.

```bash
python scripts/data/diagnose_zone_polygon_listings.py \
  --candidates data/reports/zone_listing_candidates_YYMMDD.json \
  --polygons  data/normalized/zone_polygons_YYMMDD.geojson \
  --geo       data/normalized/zone_geoYYMMDD.json \
  --output    data/reports/zone_polygon_listing_audit_YYMMDD.json
```

### 경기 CORE 4건 — 정비구역 WFS는 없고, 지적도(PNU) 병합으로 확보

대상: 구리 수택2 · 성남 수진1 · 신흥1 · 신흥3.

#### 흔한 오해 vs 실측 (2026-08-05)

| 주장 | 실측 |
|------|------|
| `LT_C_UQ111` = 정비구역 | **거짓.** GetCapabilities 제목 = **도시지역(용도지역)**. 성남 bbox 샘플 = `제2종일반주거지역` 등 |
| `lt_c_ud501`/`ud701` WFS로 경기 일괄 | **불가.** Capabilities에 미등록. 광역 조회해도 구리·성남 정비구역 0건 |
| K-Geo `LSMD_CONT_UD501_*_경기.zip` | 페이지상 **2,013 BYTES** — 서울·인천도 2~4KB. 사실상 빈 스텁 |
| `lp_pa_cbnd_bubun` + PNU 필터 | **동작.** 지번→PNU→`unary_union` / 연결요소 확장으로 구역 폴리곤 생성 가능 |

진단: `scripts/data/diagnose_vworld_coverage.py`, `data/reports/vworld_coverage_diag.json`

#### 채택 파이프라인 (글의 3번 기법)

```bash
# 1) 고시/보상공고 지번목록 JSON → 필지 병합 (+ 고시면적까지 연결확장)
python scripts/data/build_zone_polygon_from_parcels.py \
  --input data/reference/zone_parcel_lists/sujin1.json
# → data/reference/zone_polygons_manual.geojson 에 upsert

# 2) CORE 매칭 (manual이 Seoul SHP / VWorld보다 우선)
python scripts/data/fetch_zone_polygons.py \
  --golden data/normalized/golden_samples260727.normalized.json \
  --geo data/normalized/zone_geo260728.json \
  --coverage CORE \
  --manual-polygons data/reference/zone_polygons_manual.geojson
```

| 구역 | 시드 | 면적 coverage | 비고 |
|------|------|---------------|------|
| 수진1 | LH 현금청산 121필지 | ~0.98 | 시드 가장 풍부 |
| 신흥1 | 4000번지 | ~1.02 | provisional |
| 신흥3 | 중심좌표 최근접 필지 | ~0.98 | provisional |
| 수택2 | 454-9번지 | ~0.98 | provisional |

`polygon_source=pnu_union_vworld_cbnd_expanded`, `provisional=true` — 고시 **별지 지번표 전수**가 오면 `--no-expand`로 재생성해 확정본으로 교체.

지번목록 템플릿: `data/reference/zone_parcel_lists/*.json`

#### 경기 매물 수집 계약

```bash
python scripts/data/fetch_zone_listing_candidates.py \
  --geo … --golden … \
  --polygons data/normalized/zone_polygons_260805.geojson \
  --pip-filter --provisional-buffer-m 20 \
  --require-zone-mention \
  --session-playwright --enrich-details --enrich-limit 12 \
  --zone-keys "구리시|수택동|수택 2구역,…"
```

| 규칙 | 값 |
|------|-----|
| 경계 | PNU 병합 폴리곤 + **외곽 버퍼 20m** (`--provisional-buffer-m`) |
| 소속 판정 | PIP(버퍼 포함) |
| 보드 후보 | **구역명 문구 매칭 필수** (`--require-zone-mention`, 상세 설명 재스코어 후) |
| 정렬 | 구역명 언급 → 구역 안 → 예상 초투 낮은 순 |

---

## 3. 파이프라인 절차

```bash
# 1) 폴리곤 (없을 때)
python scripts/data/fetch_zone_polygons.py --golden … --geo data/normalized/zone_geo….json

# 2) 동 전수 + PIP + (선택) 상세 보강
python scripts/data/fetch_zone_listing_candidates.py \
  --geo data/normalized/zone_geo….json \
  --polygons data/normalized/zone_polygons_….geojson \
  --pip-filter --polygon-zones-only \
  --session-playwright \
  --enrich-details --enrich-limit 5 \
  --max-pages 60 --delay 0.9 \
  --output-json data/reports/zone_listing_candidates_YYMMDD.json

# 2b) 이미 후보 JSON이 있고 상세 필드만 다시 채울 때
python scripts/data/enrich_listing_details.py \
  --input data/reports/zone_listing_candidates_YYMMDD.json \
  --enrich-limit 5

# 3) 검수 보드 (구역당 최저 예상초투 5건 → 통합본 범위, 구→구역 네비)
python scripts/data/render_listing_review_html.py \
  --input data/reports/zone_listing_candidates_YYMMDD.json \
  --golden-csv docs/golden_samples….csv.csv \
  --limit 5 \
  --output data/reports/listing_review_YYMMDD.html
# → 같이 생성: data/reports/구역_통합본_YYMMDD.csv (예상초투·매매가 범위)

# 4) 구역 통합본 승인 CSV → 실투자금만 반영 (매매가 G 금지)
# 보드에서「통합본 승인」→「구역 통합본 CSV」다운로드 후:
python scripts/data/apply_approved_listing_investments.py --input 구역_통합본_승인.csv --golden-csv …
```

### 구역당 몇 건을 보여줄까?

| 단계 | 권장 | 이유 |
|------|------|------|
| 수집·PIP | 구역 안 **전부** 보관 | 감사·누락 검증용 JSON SoT |
| 상세 보강 (`--enrich-limit`) | **8+** | 보증금은 상세 API에만 있음 → 보강 후에야 예상 초투 정렬 가능 |
| 검수 보드 (`--limit`) | **5** | **예상 초투**(호가 − 기보증금) 낮은 순. 보증 미입력=0 → 호가 전체가 예상 초투라 뒤로 밀림 |
| Golden 승인 | 구역당 **2건 이상** 권장 | 초투 min/max 범위 확보 |

**정렬은 `예상초투 → 호가` 뿐이고, 동가일 때만 좌표 확인분을 앞세운다.**
소속 판정은 앞선 PIP + 소속 필터에서 이미 끝났다. 여기에 자격 신호를 다시 얹으면 최저가가 밀린다.

| 잘못된 정렬 키 | 사고 |
|---|---|
| `mentions_zone` 우선 | 폴리곤 안 8.5억(`신길제2구역`)이 구역명을 쓴 13.9억에 밀림. 방배15는 25억이 33억 뒤로. |
| `insidePolygon` 우선 | 금호21구역이 폴리곤 안 5건으로 자리가 차서, 구역명을 명시한 13억 좌표미공개 매물이 15억 뒤로. |

표기 변형(`신길 2구역` ↔ `신길제2구역`)은 `zone_listing_phrase.zone_name_variants`가 흡수한다.

### 기보증금 / 월세 (필수 계약)

네이버 매매 매물의 세입자 보증·월세는 목록 API가 아니라 상세 `articlePrice`에 있다.

| API 필드 | 의미 | 단위 |
|----------|------|------|
| `allWarrantPrice` | 기보증금 | 만원 (9000 = 0.9억) |
| `allRentPrice` | 월세 | 만원 (30 = 30만) |
| `warrantPrice` / `rentPrice` | 매매 행에서는 보통 0 | — |
| `financePrice` | 융자금 (기보증금 아님) | 만원 |

`warrantPrice or allWarrantPrice`처럼 쓰면 0이 truthy 실패로 떨어지지 않고 **0이 먼저 선택되어 버그**가 난다. 반드시 `all*`를 우선하고 양수만 채택한다.

설명 문구 보강: `기보증금/월세 9,000/30만원`, `전세 2억4천` 등.

**예상 초투** = 매매호가(억) − 기보증금(억). 보증 없으면 0 처리.  
이 값으로 보드 상위 5건을 고른다. 향후 구역별 호가·실투 범위 자동 산출의 입력으로 쓴다.

---

## 4. 세션·인증 (429를 피하는 방법)

### 왜 429가 뜨는가

- HTTP 429 = Too Many Requests. 네이버가 **IP 단위**로 요청을 제한한다.
- 쿠키만으로는 부족하다. SPA가 발급하는 `Authorization: Bearer <JWT>`가 필요하다.
- 검수 브라우저와 크롤러가 **같은 IP**를 쓰므로, 보드에서 매물을 연타하면 다음 수집이 막힌다.

### 크롤러 쪽 필수 패턴

1. Playwright로 `new.land.naver.com/houses?ms=lat,lon,z`를 실제로 연다.
2. SPA 요청에서 Bearer를 스니핑해 `/api/articles`에 붙인다.
3. **상세** `/api/articles/{no}`는 `page.evaluate`의 same-origin `fetch`로만 호출한다  
   (`page.request` / httpx는 429).
4. 동일 `cortarNo`는 **1회만** 수집해 구역들이 재사용한다.
5. `--max-pages`를 넉넉히(60+) 줘 동 목록을 소진한다. 끊기면 `page_cap_reached`.
6. 대기 시간에 **지터**(0.8~1.6×)를 준다. 고정 간격 자체가 봇 신호다.
7. 429 시 **즉시 재시도하지 말고** 20/40/60초 백오프 + 지도 재시드(최대 3회).

### 검수 보드 쪽

- 설명 전문·주소·대지지분·면적이 이미 있으면 **매물을 열지 않는다**.
- `매물 찍어서 열기`: 탭 1개 재사용 + `OPEN_GAP_MS`(기본 2500ms) 자동 간격.
- 10분 내 `BURST_LIMIT`(기본 25) 초과 시 휴식 배너.
- 주소만 필요하면 `링크 복사`(네이버 요청 0회).
- 속도가 답답하면:

```bash
python scripts/data/render_listing_review_html.py … --open-gap-ms 1500 --burst-limit 40
```

차단이 다시 보이면 값을 되돌린다.

---

## 5. 수집 필드 (상세 보강 후)

| 필드 | 출처 |
|------|------|
| 호가 매매가 | list `dealOrWarrantPrc` |
| 전용/공급/대지지분 | detail `articleSpace` (+ 평 병기) |
| 설명 전문 | detail `detailDescription` |
| 초투·갭·P·전세·월세 힌트 | 설명 문구 파서 (`listing_detail_parse.py`) |
| 기보증금 | detail `warrantPrice` (없으면 전세 힌트) |
| 월세 | detail `rentPrice` / 설명 |
| 융자금 | detail `financePrice` |
| 입주가능일 | `moveInTypeName` / `moveInPossibleYmd` + 협의가능 |
| 주소·준공·용도지역·중개사 | detail |

**프리미엄(P) 표기:** `프리미엄` · `프미` · `P` · **`피`** 를 같은 힌트로 읽는다.  
예: `피8억`, `피 15억`, `피10억4천`. `커피`·`피부`처럼 다른 한글에 붙은 `피`는 버린다.

**절대 금지:** 호가·힌트를 Golden `매매가`(G)·실투자금(C)에 자동 기입.  
**1차 승인 단위 = 구역 통합본** (상위 5건 → `예상 초투 a~b억` / `매매가 c~d억`).  
보드「통합본 승인」또는 구역 CSV에서 승인=`Y`이면 예상초투 min/max → Golden 실투자금.  
매물 상세 CSV 경로(레거시): 승인=`Y` + 검수상태=`ok` + `설명_초투(억)` 입력 후에만 반영.  
매매가 범위는 참고만 — G열 자동 반영 금지.

---

## 6. 검수 보드 UX

- 좌측 **행정구** → 중간 **구역** → 우측 **해당 구역 매물만** (한 구역씩).
- 구역 상태: `미착수` / `진행중` / `승인완료` (브라우저 localStorage).
- 구별 `N/M 완료` 카운터로 작업한 곳·안 한 곳 구분.
- `이 구역 검수 완료` 체크박스로 구역을 닫을 수 있다.

### 모바일 검수 (휴가·폰)

1. 매물 검수 보드: `data/reports/listing_review_YYMMDD.html` (제목 `매물 검수 보드 — YYYY-MM-DD`, file:// 로 안내)  
   배포 시 `frontend/public/ops/listing-review.html` → `https://<host>/ops/listing-review.html`
2. 폰에서 구역 통합본 승인(또는 개별 승인). 상태는 해당 브라우저 localStorage에 자동 저장.
3. 하단 **승인 JSON 저장**(또는 클립보드 복사) → 카톡/메일/클라우드로 노트북에 전달.
4. 노트북에서 같은 보드를 연 뒤 **승인 JSON 가져오기** → **구역 통합본 CSV** 다운로드.  
   또는: `python scripts/data/approvals_bundle_to_csv.py --input seedfit_listing_approvals.json --output data/reports/구역_통합본_승인_from_phone.csv --approved-only`
5. `apply_approved_listing_investments.py`에 구역 CSV 전달 (기존과 동일).

기기 간 localStorage는 공유되지 않으므로 **JSON 핸드오프가 필수**다.

---

## 7. 실패 시

- 429가 지속되면 수 분~수십 분 쿨다운 후 재시도.
- 그래도 막히면 `--manual-json` / `--manual-csv` + `--skip-live`로 동일 스키마 검수만 진행.
