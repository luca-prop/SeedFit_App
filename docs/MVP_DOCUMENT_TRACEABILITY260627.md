# MVP-029 문서 정리 및 원본 이슈 참조 정리 260627

## 목적

MVP-029는 SeedFit 3 Month MVP의 축약 실행 단위가 이후 full-spec 작업과 단절되지 않도록, MVP 이슈·문서·PlayBoard 상태·제외 기능의 추적 기준을 정리하는 작업이다.

이번 정리는 회고용 장문 아카이브가 아니라, 나중에 full-spec 기능을 되살릴 때 "무엇을 MVP에서 구현했고, 무엇을 의도적으로 제외했는지" 빠르게 확인할 수 있게 만드는 최소 추적성 문서다.

## 오너 결정

- 정리 범위: 원본 추적성 중심 최소 정리.
- 기준 보드: MVP Project와 PlayBoard를 현재 상태의 SoT로 둔다.
- 기존 full-spec 89개 GitHub Project는 수정하지 않는다.
- Production 전환 판단은 MVP-030에서 별도로 다룬다.

## MVP 완료 산출물 맵

| MVP | 현재 산출물 | 상태 | 비고 |
|---|---|---|---|
| MVP-001 | GitHub Project #3 / `docs/MVP_PREVIEW_WORKFLOW260621.md` | 완료 | MVP 전용 Project 기준 확립 |
| MVP-002 | `docs/MVP_PREVIEW_WORKFLOW260621.md` | 완료 | Preview 운영 규칙 |
| MVP-003 | `docs/MVP_DATA_COLUMN_CONTRACT260621.md` | 완료 | 데이터 컬럼 계약 |
| MVP-004 | `docs/MVP_SUPABASE_SCHEMA260621.md` | 완료 | Prisma/Supabase 스키마 |
| MVP-005 | `docs/MVP_GOLDEN_SAMPLES_NORMALIZATION260621.md` | 완료 | 구역 CSV 정규화 |
| MVP-006 | `docs/MVP_NAVER_LAND_NORMALIZATION260621.md` | 완료 | Naver Land XLSX 정규화 |
| MVP-007 | `docs/MVP_SUPABASE_SEED_UPSERT260621.md` | 완료 | seed/upsert 흐름 |
| MVP-008 | `docs/MVP_DATA_QUALITY_REPORT260621.md` | 완료 | 데이터 품질 리포트 |
| MVP-009 | `docs/MVP_LTV_POLICY_UTIL260621.md` | 완료 | LTV 정책 조회 유틸 |
| MVP-010 | `docs/MVP_ACQUISITION_COST_UTIL260621.md` | 완료 | 취득세/비용 계산 |
| MVP-011 | `docs/MVP_REVERSE_FILTER_DTO260621.md` | 완료 | 예산 범위 DTO/Zod 계약 |
| MVP-012 | `docs/MVP_REVERSE_FILTER_ACTION260621.md` | 완료 | Reverse Filter Server Action |
| MVP-013 | `docs/MVP_CORE_UNIT_TESTS260621.md` | 완료 | 핵심 계산 단위 테스트 |
| MVP-014 | `docs/MVP_BUDGET_RANGE_LANDING260621.md` | 완료 | 예산 범위 랜딩 |
| MVP-015 | `docs/MVP_REVERSE_FILTER_RESULTS260623.md` | 완료 | 결과 리스트 |
| MVP-016 | `docs/MVP_REVERSE_FILTER_RESULTS_FILTERS260623.md` | 완료 | 정렬/필터 UI |
| MVP-017 | `docs/MVP_REVERSE_FILTER_EMPTY_STATE260624.md` | 완료 | 0건 Empty State |
| MVP-018 | `docs/MVP_DATA_DISCLOSURE_NOTICE260624.md` | 완료 | 데이터 기준일/면책 고지 |
| MVP-019 | `docs/MVP_ZONE_DETAIL_LITE260624.md` | 완료 | 구역 상세 Lite |
| MVP-020 | `docs/MVP_REFERENCE_APARTMENT_CARD260624.md` | 완료 | 기축 레퍼런스 카드 |
| MVP-021 | `docs/MVP_COMPARISON_DATA_ACTION260624.md` | 완료 | 비교 데이터 Server Action |
| MVP-022 | `docs/MVP_SIMPLE_REPORT_SECTION260625.md` | 완료 | 간단 리포트 섹션 |
| MVP-023 | `docs/MVP_STAGE_CASH_VISUALIZATION260626.md` | 완료 | 사업 단계/실투자금 시각화 |
| MVP-024 | `docs/MVP_B2C_CORE_FLOW_E2E260626.md` | 완료 | B2C 핵심 플로우 E2E |
| MVP-025 | `docs/MVP_PREVIEW_ENVIRONMENT260627.md` | 완료 | Preview DB/env 점검 |
| MVP-026 | `docs/MVP_PRODUCTION_SMOKE_TEST_CHECKLIST260627.md` | 완료 | Production 병합 전 Smoke 기준 |
| MVP-027 | `docs/MVP_ERROR_LOADING_STATES260627.md` | 완료 | 에러/로딩 상태 |
| MVP-028 | `docs/MVP_BASIC_ACCESSIBILITY260627.md` | 완료 | 기본 접근성 점검 |
| MVP-029 | `docs/MVP_DOCUMENT_TRACEABILITY260627.md` | 완료 | MVP 산출물/제외 범위 추적성 |
| MVP-030 | `docs/MVP_RELEASE_DECISION_BRIEF260627.md` | 완료 | Preview GO / Production HOLD 판단 |
| MVP-031 | `docs/MVP_COMPARISON_ASSETS_PIPELINE260627.md` | 완료 | 최신 파일 세트 RULE 및 LTV 기축 대조군 파이프라인 계약 |

## 의도적으로 제외한 기능

MVP에서 제외한 기능은 "폐기"가 아니라 full-spec 또는 후속 MVP에서 복원 가능한 항목이다.

- Production DB/env 전환: MVP-030 릴리즈 판단 이후 결정한다.
- Admin/B2B full dashboard: 3 Month MVP 범위 밖이며 후속 full-spec에서 다룬다.
- Comparison Assets DB 테이블 영속화: MVP 완료 후 우선 후속 구현으로 남긴다.
- Naver Land raw history 저장: Phase 2 또는 별도 이슈에서 명시적으로 추가할 때만 도입한다.
- WCAG 전체 준수 선언 및 모바일 보조기기 실기 테스트: MVP-030 이후 별도 접근성 QA로 다룬다.
- Amplitude 상세 이벤트 taxonomy: PMF/시장 검증 패키지에서 확정한다.

## 후속 추적 기준

- MVP-030: Preview 검수 완료와 Production 전환 보류 판단을 회의 자료로 남긴다.
- MVP-031: 최신 파일 세트 RULE 및 LTV 기축 대조군 데이터 파이프라인 계약을 후속 DB 영속화 기준으로 남긴다.
- PlayBoard: MVP 작업 상태와 화면/제어영역 커버리지를 계속 파생 뷰로 확인한다.
- GitHub Issue: MVP Project 기준 상태를 관리하고, full-spec 89개 Project는 직접 수정하지 않는다.

## 완료 기준

- MVP-001~031 산출 문서와 상태가 한 곳에서 추적 가능하다.
- MVP-030/031 판단·계약 범위가 분리되어 있다.
- MVP에서 제외한 기능이 "누락"이 아니라 "후속 복원 대상"으로 설명된다.
