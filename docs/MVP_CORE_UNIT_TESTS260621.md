# SeedFit MVP 핵심 계산 단위 테스트 260621

## 1. 목적

이 문서는 `MVP-013: 핵심 계산 단위 테스트 작성`의 테스트 범위와 검증 결과를 정리합니다.

MVP-013은 DB나 Server Action 통합 테스트가 아니라, 핵심 비즈니스 로직의 순수 함수 테스트를 자동 검증 세트로 묶는 작업입니다.

## 2. 사용자 확정 범위

- 추천 1번 기준으로 진행했습니다.
- 자동 테스트는 순수 함수 단위 테스트 중심으로 고정합니다.
- Supabase smoke check는 MVP-012에서 이미 수행했으므로, MVP-013 자동 테스트에는 포함하지 않습니다.
- 문서와 PR/Issue 코멘트는 한국어로 작성합니다.

## 3. 테스트 묶음

새 스크립트:

```bash
npm run test:core-business
```

이 스크립트는 아래 테스트를 순서대로 실행합니다.

- `npm run test:cost-utils`
- `npm run test:ltv-policy`
- `npm run test:reverse-filter-dto`
- `npm run test:reverse-filter-core`

## 4. 보강한 테스트

### 취득세/비용 계산

- 취득세 bps 계산
- 취득세 나눗셈 절사 케이스
- 부대비용 합산
- 예산 초과/잔액 계산
- 예측값이 실제값보다 높거나 낮은 경우의 오차율
- 음수 세율/음수 비용/실제값 0 입력 방어

### LTV 정책 선택

- 예산 구간 경계값
- 최상위 구간 `cashMaxKrw = null`
- inactive/expired 정책 제외
- 겹치는 정책이 있을 때 더 구체적인 구간 선택
- 정책 적용 시작일 이전에는 매칭하지 않음

### Reverse Filter DTO/분류

- 1억~25억 입력 범위
- 5천만 원 slider step
- `within_budget`, `near_budget`, `over_budget` 분류
- 5억 미만 근접 기준 5천만 원
- 5억 이상 근접 기준 10%
- 관심 지역 필터
- 그룹별 최대 30개 제한
- `investmentMin` 정렬

## 5. 검증

실행한 검증 명령입니다.

```bash
npm run test:core-business
npx tsc --noEmit
npx eslint lib/ltvPolicyCore.test.ts lib/acquisitionCostCore.test.ts lib/reverseFilterCore.test.ts lib/reverseFilterDto.test.ts
```

## 6. 후속 범위

- Server Action 통합 테스트
- Supabase 연결이 필요한 DB smoke test 자동화
- MVP-014, MVP-015 UI 흐름 기반 테스트
