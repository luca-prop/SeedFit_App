---
name: Development Guidelines
description: 개발 표준 및 비기능 요구사항
---

# 003. Development Guidelines

## Version Control & Workflow
- Git + GitHub Issue 연동 (Task ID 명시)
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- GitHub Project 로드맵에 맞춘 DAG 병렬 개발 프로세스

## Architecture Principles
- **Next.js Full-stack Monorepo**: 프론트엔드와 백엔드를 Next.js 하나로 통합
- **Server-side Reverse Calculation**: 역산(취득세, 대출 산정) 로직은 브라우저에서 수행하지 않고, 반드시 Next.js Server Action(`app/actions/`) 내부에서 처리 (ADR-01)
- **Curated DB**: 기축 비교군은 수동/반자동 큐레이션 (ADR-02)
- **LTV Parameterization**: DB에 저장하여 관리자 패널을 통해 수정 가능 (ADR-03)

## Performance Standards (SRS)
- Server Action 응답 시간 (Reverse Filter): p95 ≤ 1.5s
- Landing Render (LCP): ≤ 1.0s
- 시스템 가용성: Vercel SLA 기준

## Code Quality
- 주석: WHY 중심. 비즈니스 로직(역산, LTV)은 한국어, 프레임워크 수준 기술적 주석은 영어
- 데이터 무결성: 면책 조항(Disclaimer)을 모든 데이터 화면에 노출
