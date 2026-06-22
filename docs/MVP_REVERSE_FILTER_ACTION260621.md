# SeedFit MVP Reverse Filter Action 260621

## 1. 목적

이 문서는 `MVP-012: Reverse Filter Server Action 구현`의 구현 기준과 검증 결과를 정리합니다.

Server Action은 Supabase/Prisma에서 구역별 최신 투자금 snapshot을 읽고, 사용자의 가용 현금 기준으로 후보 구역을 `예산 내`, `근접`, `초과` 그룹으로 나누어 반환합니다.

## 2. 사용자 확정 결정

구현 전에 사용자가 확정한 기준입니다.

- MVP-012는 MVP-011 보정 PR을 먼저 머지한 뒤 시작합니다.
- `within_budget`은 최소 필요 현금이 사용자가 선택한 예산 범위 안에 들어오는지로 판정합니다.
  - `budgetMinKrw <= requiredCashMinKrw <= budgetMaxKrw`
- `near_budget`은 MVP-011에서 확정한 규칙을 사용합니다.
  - 예산 상한 `500,000,000 KRW` 미만: 예산 초과액이 `50,000,000 KRW` 이내
  - 예산 상한 `500,000,000 KRW` 이상: 예산 초과액이 예산 상한의 `10%` 이내
- `matchScore`는 MVP 단계에서 상태 기반 단순 점수로 둡니다.
  - `within_budget`: `100`
  - `near_budget`: `70`
  - `over_budget`: `0`
- LTV 정책은 active 정책 존재 여부만 확인하고, `ltvRatio`는 아직 계산에 적용하지 않습니다.
- 취득세/부대비용 계산 구조는 연결하되 기본값은 `0`으로 둡니다.
- 각 결과 그룹은 최대 `30`개 구역만 반환합니다.

## 3. 변경 파일

- `frontend/app/actions/reverseFilter.ts`: Server Action 진입점입니다.
- `frontend/lib/reverseFilterCore.ts`: 예산 내/근접/초과 분류와 정렬을 담당하는 순수 로직입니다.
- `frontend/lib/reverseFilterCore.test.ts`: 분류 규칙을 고정하는 단위 테스트입니다.

## 4. 실행 흐름

1. `reverseFilterInputSchema`로 입력값을 검증합니다.
2. active LTV 정책이 최소 1개 이상 있는지 확인합니다.
3. 모든 구역과 각 구역의 최신 `zone_investment_snapshots` 1건을 조회합니다.
4. DB row를 Reverse Filter 후보 데이터로 변환합니다.
5. `matchedZones`, `nearZones`, `excludedZones`를 생성합니다.
6. `ReverseFilterSuccess` DTO로 반환합니다.

## 5. 중요 제약

- Server Action 응답 금액은 직렬화 가능한 `number KRW`로 반환합니다.
- 내부 계산에서는 `bigint`를 사용할 수 있습니다.
- 최신 snapshot이 없는 구역은 결과에서 제외합니다.
- 최신 snapshot에 `investmentMinKrw`가 없는 구역은 현재 매물이 큐레이션될 때까지 결과에서 제외합니다.
- 예산 범위보다 낮은 구역은 `excludedZones`에 포함하고 `예산 범위 미만` 사유를 표시합니다.
- 이 Action은 DB를 읽기만 하며 쓰기 작업을 하지 않습니다.

## 6. 검증

실행한 검증 명령입니다.

```bash
npm run test:reverse-filter-core
npx tsc --noEmit
npx eslint app/actions/reverseFilter.ts lib/reverseFilterCore.ts lib/reverseFilterCore.test.ts
```

`300,000,000 KRW` 입력 기준 Supabase smoke check 결과입니다.

```json
{"candidates":84,"matched":13,"near":6,"excluded":30}
```

active LTV 정책 존재 여부 smoke check 결과입니다.

```json
{"activeLtvPolicies":4}
```

## 7. 후속 이슈로 넘긴 범위

- 0이 아닌 취득세/부대비용 정책값 적용
- `ltvRatio`를 활용한 대출 가능액 계산
- MVP-014, MVP-015에서 Server Action과 UI 연결
