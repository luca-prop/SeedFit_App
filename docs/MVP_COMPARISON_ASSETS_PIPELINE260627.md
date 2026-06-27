# MVP-031 최신 파일 세트 RULE 및 LTV 기축 대조군 데이터 파이프라인 260627

## 목적

MVP-031은 기축 레퍼런스와 대조군 데이터가 앱/문서/룰 사이에서 서로 다른 기준으로 움직이지 않도록, 최신 원천 파일 세트와 LTV 모델의 운영 계약을 정리하는 작업이다.

이번 MVP에서는 DB 영속화나 자동 배치를 새로 구현하지 않는다. 대신 후속 구현자가 같은 기준으로 `reference_apartments` 또는 Comparison Assets 파이프라인을 만들 수 있도록 입력 파일, 정규화, 검증, 정책 SoT를 확정한다.

## 오너 결정

- Comparison Assets DB 영속화: 이번 MVP-031에서는 계약과 문서만 확정하고, Prisma schema/seed/upsert 구현은 후속으로 둔다.
- XLSX 갱신 방식: 수동 갱신 + 버전/기준일 기록.
- LTV 정책 SoT: `ltv_policies` 테이블 참조 원칙을 유지하고, 검증 출처 없는 LTV/DSR 값은 임의 하드코딩하지 않는다.

## 최신 파일 세트 RULE

| 항목 | 기준 |
|---|---|
| 기준 원천 | `docs/Naver_Land_0503_1129.xlsx`, `docs/Naver_Land_0503_1132.xlsx` |
| 파일 단위 | 두 XLSX를 하나의 세트로 취급한다. 일부 파일만 교체하지 않는다. |
| 갱신 방식 | 새 파일 세트를 추가할 때 파일명, 기준일, 수집 시각, 큐레이터를 문서에 기록한다. |
| 원본 보존 | 원본 raw history 저장은 Phase 2 또는 별도 이슈에서 명시적으로 추가할 때만 도입한다. |
| 앱 반영 | XLSX 산출값은 바로 앱 DB에 쓰지 않고, 큐레이션 검토 후 DATA_CURATION_SPEC와 seed/upsert 계약에 반영한다. |

## Naver Land 정규화 규칙

- `매물없음`은 오류가 아니라 현재 사용 가능한 호가가 없다는 상태로 관리한다.
- `저층` 제외 `중고층` 이상 매물 중 최저가를 우선 후보로 삼는다.
- `중고층` 이상 매물이 없고 `저층` 매물만 있으면 저층 최저가를 fallback 후보로 반영한다.
- fallback 후보는 사용자-facing 기준가로 사용할 때 저층 기준임을 내부 검토 기록에 남긴다.
- 금액은 정규화 단계에서 원 단위 integer KRW로 변환한다.
- 빈 금액은 `0`이 아니라 `null`로 둔다.

## LTV 기축 대조군 모델

Comparison Assets는 동일 기축 기준가에 대해 최소 두 개의 현금 필요액 모델을 가진다.

| 모델 | 의미 | 산식 |
|---|---|---|
| 생애최초 70% | 내 집 마련이 처음인 사용자의 비교 시나리오 | `매매가 - min(매매가 * 70%, 대출 Max)` |
| 일반 40% | 일반 주택담보대출 비교 시나리오 | `매매가 - min(매매가 * 40%, 대출 Max)` |

대출 Max는 MVP 기축 레퍼런스 가정치와 동일하다.

- 기준가 15억 이하: 최대 대출 6억.
- 기준가 15억 초과 25억 이하: 최대 대출 4억.
- 기준가 25억 초과: 최대 대출 2억.

## 후속 DB 계약 초안

후속 구현에서 `reference_apartments` 또는 동일 목적의 Comparison Assets 테이블을 만들 경우, 최소 필드는 다음 기준을 따른다.

| 필드 | 의미 |
|---|---|
| `id` | 내부 식별자 |
| `name` | 기축 단지명 |
| `district` | 소재 행정구 |
| `area_label` | 평형/면적 라벨 |
| `baseline_price_krw` | 기축 기준가 |
| `source_file_set` | 기준 XLSX 파일 세트 |
| `source_observed_at` | 원천 기준일 또는 수집 시각 |
| `floor_basis` | `mid_high`, `low_floor_fallback`, `unknown` |
| `first_home_cash_required_krw` | 생애최초 70% 모델 필요 현금 |
| `general_cash_required_krw` | 일반 40% 모델 필요 현금 |
| `previous_peak_price_krw` | 전고점 기준가, 없으면 `null` |
| `status` | `active`, `no_listing`, `needs_review` |

## 완료 기준

- 최신 Naver Land 파일 세트를 교체할 때의 기준이 문서화되어 있다.
- LTV 70%/40% 기축 대조군 모델과 대출 Max 가정이 한 문서에서 확인된다.
- DB 영속화는 후속 구현으로 분리되어 Production 리스크를 늘리지 않는다.
- PlayBoard에서 MVP-031과 데이터 파이프라인 제어영역을 추적할 수 있다.
