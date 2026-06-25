RESOLVED: 5 / TOTAL: 5
- [x] T1 | CORE | 5개 테이블 구성이 MVP에 적정한가 | depends:- | status:RESOLVED | decision:5개 테이블(`zones`, `zone_investment_snapshots`, `reference_apartments`, `zone_reference_apartments`, `ltv_policies`) 유지 | applied:docs/MVP_DATA_COLUMN_CONTRACT260621.md,.cursor/rules/006-mvp-data-curation-rules.mdc
- [x] T2 | CORE | `ltv_policies`가 실제로 무엇을 저장하는가 | depends:T1 | status:RESOLVED | decision:MVP에서는 예산 티어 밴드와 optional LTV/DSR 정책값을 저장하며 `ltv_ratio`는 검증 출처 전까지 optional | applied:docs/MVP_DATA_COLUMN_CONTRACT260621.md,.cursor/rules/006-mvp-data-curation-rules.mdc
- [x] T3 | CORE | 금액 단위를 KRW integer로 고정한다는 의미 | depends:T1 | status:RESOLVED | decision:정규화/DB 금액은 원 단위 integer KRW로 저장하고 원천의 `억` 표기는 import 단계에서 변환 | applied:docs/MVP_DATA_COLUMN_CONTRACT260621.md,.cursor/rules/006-mvp-data-curation-rules.mdc
- [x] T4 | CORE | Naver Land XLSX를 raw data로 저장할지 대표 가격만 쓸지 | depends:T1 | status:RESOLVED | decision:MVP에서는 비교 카드에 필요한 대표 기축 가격만 정규화하고 raw history 저장은 Phase 2로 이연 | applied:docs/MVP_DATA_COLUMN_CONTRACT260621.md,.cursor/rules/006-mvp-data-curation-rules.mdc
- [x] T5 | MINOR | 검증 규칙이 충분하고 이해 가능한가 | depends:T3,T4 | status:RESOLVED | decision:현재 validation checklist 유지, 이후 import 이슈에서 machine-readable output으로 구현 | applied:docs/MVP_DATA_COLUMN_CONTRACT260621.md

STOP: ALL_RESOLVED
