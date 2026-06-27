# MVP-026 Production 병합 전 Smoke Test 체크리스트 260627

## 목적

MVP-026은 Production 병합 전에 SeedFit B2C 핵심 흐름이 Preview 기준에서 깨지지 않았는지 빠르게 확인하는 수동 Smoke Test 기준이다.

이 문서는 기능 완성도를 새로 평가하는 QA 문서가 아니라, 배포 직전에 반드시 통과해야 하는 최소 안전장치다.

## 기준 환경

- 검수 URL: 최신 Vercel Preview alias URL을 사용한다.
- 폐기 URL: 과거 Vercel 해시 Preview URL은 생성 시점의 스냅샷이므로 검수 기준으로 쓰지 않는다.
- DB 기준: localhost와 Vercel Preview는 같은 MVP Preview DB/schema를 본다.
- 환경 점검: `/app/preview-health`가 `READY`여야 한다.
- 오류 기준: 핵심 B2C flow에서 P0 runtime/console 오류가 없어야 한다.

## Smoke Test 체크리스트

### 1. Preview Health

- [ ] `/app/preview-health`가 열린다.
- [ ] 상태가 `READY`다.
- [ ] `DATABASE_URL`과 `DIRECT_URL`이 set 상태다.
- [ ] DB 연결이 정상이다.
- [ ] `zones`, `zone_investment_snapshots`, `reference_apartments`, active `ltv_policies` row count가 0보다 크다.
- [ ] 최신 snapshot 기준일이 표시된다.

### 2. Landing

- [ ] 랜딩 페이지가 열린다.
- [ ] 예산 범위 입력 UX가 보인다.
- [ ] MVP 예산 범위 기준인 최소 1억, 최대 25억, 이동 단위 5천만 원이 깨지지 않는다.
- [ ] 빠른 선택 또는 입력 후 결과 페이지로 이동할 수 있다.

### 3. Search

- [ ] `10억 ~ 15억` 예산 검색이 가능하다.
- [ ] URL query가 `budgetMinKrw`/`budgetMaxKrw` 또는 현재 라우트 계약에 맞게 예산 범위를 전달한다.
- [ ] `Reverse Filter 처리 중 오류가 발생했습니다.` 문구가 노출되지 않는다.
- [ ] 검색 결과가 빈 화면이나 무한 로딩으로 멈추지 않는다.

### 4. Results

- [ ] 결과 페이지 상단에 입력 예산 범위가 표시된다.
- [ ] 사업 단계 X축, 실투자금 Y축 차트가 표시된다.
- [ ] 예산 범위 하이라이트가 표시된다.
- [ ] 구역 카드 목록이 표시된다.
- [ ] 구역 상세 보기 링크가 동작한다.
- [ ] 같은 예산 기축단지 비교 링크가 동작한다.
- [ ] 데이터 기준 및 면책 문구가 노출된다.

### 5. Zone Detail

- [ ] 구역 상세 Lite 페이지가 열린다.
- [ ] 구역명, 행정구, 동, 사업 단계, 필요 현금 범위가 표시된다.
- [ ] 기축 레퍼런스 영역이 표시된다.
- [ ] 기축 기준가와 기축 필요 현금 문구가 사용자-facing 용어로 표시된다.
- [ ] 결과 페이지 또는 비교 페이지로 돌아가는 이동 경로가 어색하지 않다.
- [ ] 데이터 기준 및 면책 문구가 노출된다.

### 6. Comparison

- [ ] 비교 페이지가 열린다.
- [ ] 재개발 구역과 기축 레퍼런스가 같은 예산 기준으로 비교된다.
- [ ] `일반 40%` LTV 모델 선택 또는 표시가 깨지지 않는다.
- [ ] 기축 필요 현금은 MVP 가정치로 표시된다.
- [ ] 차이값은 `기축 필요 현금 - 구역 최소 실투자금` 기준으로 표시된다.
- [ ] 별도 Simple Report 섹션이 되살아나지 않고, 요약 카드 중심 구조를 유지한다.
- [ ] 데이터 기준 및 면책 문구가 노출된다.

### 7. Console/Runtime

- [ ] Chrome DevTools Console에 P0 runtime error가 없다.
- [ ] 주요 페이지 이동 중 hydration mismatch가 반복 노출되지 않는다.
- [ ] Vercel Analytics/Speed Insights 관련 local-only 오류가 Preview 검수에 영향을 주지 않는다.

## 통과 기준

Production 병합 전 통과 기준:

- Preview Health가 `READY`다.
- Landing → Search → Results → Zone Detail → Comparison 흐름이 끊기지 않는다.
- `10억 ~ 15억` 검색에서 Reverse Filter 오류 문구가 없다.
- 모든 데이터 화면에 면책 문구가 보인다.
- 핵심 B2C flow에서 P0 runtime/console 오류가 없다.

## 실패 시 조치

- DB/env 문제면 `/app/preview-health` 결과를 먼저 확인한다.
- 특정 해시 URL에서만 실패하면 최신 Preview alias URL인지 확인한다.
- localhost와 Preview UI가 다르면 현재 배포 commit, alias 대상 deployment, branch 상태를 먼저 비교한다.
- seed 데이터 문제면 Supabase Preview DB row count와 `data/seed/seed_mvp_data.sql` 반영 여부를 확인한다.
- UI regression이면 관련 MVP 문서와 현재 Preview screenshot을 함께 남긴다.

## 제외 범위

- 장시간 부하 테스트는 MVP-026 범위가 아니다.
- Production DB 전환 판단은 MVP-030 릴리즈 판단에서 다룬다.
- Admin/B2B 전체 검수는 3 Month MVP Smoke Test 범위가 아니다.
