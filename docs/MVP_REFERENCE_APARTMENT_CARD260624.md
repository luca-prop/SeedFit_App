# SeedFit MVP Reference Apartment Card 260624

## 1. 목적

이 문서는 `MVP-020: 기축 레퍼런스 카드 구현`의 구현 기준을 정리합니다.

MVP-020의 목적은 재개발 구역 상세 Lite 화면에서 연결된 기축 레퍼런스 단지를 같은 화면 안에서 비교할 수 있게 하는 것입니다.

## 2. 표시 정보

기축 레퍼런스 카드는 다음 정보를 표시합니다.

- 비교 기축 아파트명
- 현재 기준가
- 금액대별 `대출 Max` 가정액
- 기축 필요 현금
- 선택 구역의 실투자금 범위
- 기축 필요 현금과 구역 최소 실투자금의 차이
- 분양권 여부
- 운영팀 매칭 사유가 있는 경우 사유

## 3. 기축 필요 현금 계산 기준

기축 필요 현금은 MVP 가정치입니다. 실제 대출 승인액이 아니라 대출 규제를 단순 반영한 비교용 금액이며, 카드에는 적용된 `대출 Max` 금액을 함께 표시합니다.

```text
기준가 15억 이하: 대출 6억 차감
기준가 15억 초과 25억 이하: 대출 4억 차감
기준가 25억 초과: 대출 2억 차감
기축 필요 현금 = max(기축 기준가 - 대출 Max, 0)
```

## 4. 차이 계산 기준

`기축 필요 현금 차이`는 다음 기준으로 표시합니다.

```text
기축 필요 현금 - 구역 최소 실투자금
```

두 값 중 하나가 없으면 임의 계산을 하지 않고 `비교 대기`로 표시합니다.

이 값은 사용자가 같은 예산대에서 기축 레퍼런스와 재개발 구역의 필요 현금 위치를 빠르게 비교하는 보조 지표입니다.

## 5. 구현 파일

- `frontend/components/domain/ReferenceApartmentComparisonCard.tsx`
- `frontend/app/app/zones/[id]/page.tsx`
- `.cursor/rules/008-mvp-reference-apartment-rules.mdc`

## 6. 검증

권장 검증 명령:

```bash
npx eslint components/domain/ReferenceApartmentComparisonCard.tsx "app/app/zones/[id]/page.tsx"
npx tsc --noEmit
npm run test:core-business
```

로컬 확인은 `/app/results`에서 `구역 상세 보기`로 진입한 뒤, `기축 레퍼런스` 영역에 현재 기준가, 기축 필요 현금, 구역 실투자금, 기축 필요 현금 차이, 분양권 여부가 보이는지 확인합니다.
