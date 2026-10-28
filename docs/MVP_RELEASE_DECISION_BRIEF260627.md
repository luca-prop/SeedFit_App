# MVP-030 MVP 릴리즈 판단 회의 자료 260627

## 결론

SeedFit 3 Month MVP는 Preview 환경 기준으로 검수 가능한 상태다.

Production 병합/전환은 이번 MVP 완료 선언의 필수 조건으로 보지 않고, Production DB/env 준비와 운영 리스크 확인 이후 별도 결정한다.

## 판단 요약

| 항목 | 판단 | 근거 |
|---|---|---|
| B2C 핵심 흐름 | GO | 예산 범위 입력 → 결과 → 구역 상세 Lite → 기축 레퍼런스 → 간단 리포트 흐름이 Preview에서 확인 가능 |
| 데이터 기준 고지 | GO | 기준일/면책/데이터 한계가 주요 화면에 노출됨 |
| 계산 로직 | GO | Reverse Filter, 취득세, LTV 정책 유틸, 비교 데이터 Server Action 단위가 분리됨 |
| 시각화/필터 | GO | 사업 단계/실투자금 스캐터 차트와 상호 필터 카운트가 검증됨 |
| QA 기본선 | GO | B2C 핵심 E2E, smoke checklist, 에러/로딩, 기본 접근성 점검 문서가 준비됨 |
| Production 전환 | HOLD | Production `DATABASE_URL`/`DIRECT_URL` 등 운영 env 확정 전이며, Preview alias 기준 검수가 더 안전함 |

## 구현 완료 기능

- 예산 범위 기반 Reverse Filter 검색.
- 결과 리스트, 정렬, 자치구/사업 단계 필터.
- 사업 단계 × 실투자금 스캐터 차트.
- 구역 상세 Lite.
- 기축 레퍼런스 카드와 기축 필요 현금 비교.
- 간단 리포트 섹션.
- 데이터 기준일/면책 고지.
- Preview 환경 검수, smoke checklist, 기본 접근성 점검.
- PlayBoard 기반 MVP 상태 추적.

## 제외 기능

- Production DB/env 전환 및 운영 데이터 고정.
- Admin/B2B full dashboard.
- Comparison Assets DB 테이블 영속화.
- Naver Land raw history 저장.
- WCAG 전체 준수 선언.
- Amplitude 상세 이벤트 taxonomy와 PMF 분석 대시보드.

## 데이터 품질 한계

- MVP 데이터는 큐레이션 기준이며, 실제 투자 판단 전 현장 검증이 필요하다.
- 기축 필요 현금은 MVP 가정치로 계산하며 실제 대출 승인액이 아니다.
- Naver Land 비교 데이터는 MVP 비교 카드에 필요한 대표 기축 가격 중심으로 정규화했다.
- LTV/DSR 정책값은 임의 하드코딩하지 않으며, 검증 가능한 정책 출처와 운영 표면이 확정되어야 Production 전환 판단이 가능하다.

## 릴리즈 판단

### Recommended Decision

Preview 릴리즈 GO / Production 전환 HOLD.

이 판단은 "사용자에게 공유 가능한 MVP 검수 링크는 제공한다"와 "운영 Production으로 병합해 외부 서비스처럼 고정 운영하는 것은 아직 보류한다"를 분리한다.

### Production 전환 전 체크

- Production `DATABASE_URL`/`DIRECT_URL` 확정.
- Preview DB와 Production DB 데이터 동기화 정책 결정.
- 운영 도메인/alias 기준 검수.
- `/app/preview-health` 또는 동등한 health route 확인.
- 핵심 B2C flow 재검수.
- 데이터 업데이트/rollback 책임자 확정.

## 다음 단계 제안

1. MVP-031 산출물 기준으로 후속 Comparison Assets DB 영속화 범위를 별도 이슈로 분리한다.
2. PMF 검증을 위한 이벤트 taxonomy와 사용자 시나리오를 별도 MVP로 정의한다.
3. Production 전환은 데이터 파이프라인과 운영 env가 정리된 뒤 다시 GO/NO-GO로 판단한다.

## 오너 결정 기록

- 이번 MVP-030의 기준 결론은 `Preview 검수 완료, Production 전환 보류`다.
- MVP 완료 선언은 Preview alias 검수 가능 상태를 기준으로 한다.
- Production 병합은 MVP-031 이후 별도 의사결정으로 남긴다.
