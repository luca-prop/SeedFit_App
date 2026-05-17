---
description: SeedFit 프로젝트 개요 및 핵심 도메인 컨텍스트
globs: ["**/*"]
alwaysApply: true
---
# PROJECT OVERVIEW: 씨드핏 (SeedFit)

## Vision
투자금(예산) 맞춤 재개발 투자 플랫폼.
내 예산을 입력하면 진입 가능한 재개발 구역을 비교 분석해주고, 파트너 중개사의 Verified 매물을 연결합니다.
동일 예산으로 재개발 구역 vs 기축 아파트 비교 분석 기능을 제공합니다.

## Core Features (Phase 1 MVP)
- ① Reverse Filter: 가용 현금 입력 → 취득세·대출 역산 → 진입 가능 구역 자동 산출
- ② 1:1 Comparison Dashboard: 기축 아파트 vs 재개발 구역 투자 구조·현금 흐름·미래 가치 심층 비교
- ③ B2B Verified Listings: 현지 중개사 보증 매물에 Verified 뱃지 부여, 교차검증 파이프라인
- ④ Single Search Landing: 복잡한 지도 탐색 대신 '가용 현금' 단일 입력창 중심 UX
- ⑤ Multi-Zone Scatter Chart: 사업단계(X축) vs 실투자금(Y축) Range 시각화, 덤벨 마커, Position Dodge

## Target Audience
- Primary (B2C): 스마트 비기너 — 재개발 예비 투자자 (30대, 본업이 바빠 정보 탐색에 어려움)
- Secondary (B2B): 공인중개사 — 디지털 브리핑 도구로 2030 세대 리드 전환

## Project Goals & Success Metrics
- North Star KPI: 가용 현금 쿼리 검색 완료율 ≥ 65% (Amplitude 퍼널)
- Verified 매물 CTR ≥ 40%
- 1:1 대조 대시보드 체류 시간 ≥ 3분
- 정보 탐색 시간 90% 단축 (주 15시간 → 1.5시간)
- 허위매물 오프라인 헛걸음 0%

## Architecture Decision Records (ADR)
- **ADR-01**: 역산(취득세, 대출 산정) 로직은 반드시 백엔드(Server-side)에서 처리. 세법·대출 규제 변동 시 서버 배포만으로 즉각 반영.
- **ADR-02**: 기축 아파트 비교군 데이터는 자동 크롤링이 아닌 수동/반자동(Curated DB) 큐레이션 방식. 네이버 부동산 크롤링의 법적 리스크 원천 제거.
- **ADR-03**: LTV/DSR 정책은 하드코딩 금지, Admin 패널에서 전역 변수로 관리자가 즉시 수정·배포 가능한 Parameterization 구조.

## Key Documents
- PRD: `SeedFit_app/docs/00_PRD_v0.1.md`
- SRS: `SeedFit_app/docs/01_SRS-001_v1.2.md`
- Data Spec: `SeedFit_app/docs/DATA_CURATION_SPEC.v.2.md`
- Scatter Chart Spec: `SeedFit_app/docs/Phase2_scatter_chart검토.md`

## See also:
- [002-tech-stack.md](002-tech-stack.md) for implementation details
- [003-development-guidelines.md](003-development-guidelines.md) for development standards
