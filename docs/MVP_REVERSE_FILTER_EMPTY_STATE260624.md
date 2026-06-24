# SeedFit MVP Reverse Filter Empty State 260624

## 1. 목적

이 문서는 `MVP-017: 매칭 0건 Empty State 구현`의 사용자 경험 기준을 정리합니다.

MVP-017의 핵심은 검색 결과가 0건일 때 사용자가 막다른 길에 도달하지 않도록 다음 행동을 제시하는 것입니다.

## 2. 표시 조건

결과 페이지에서 예산 내 후보와 예산 근접 후보를 필터링한 뒤 표시할 구역이 0개이면 Empty State를 보여줍니다.

대표 상황은 다음과 같습니다.

- 입력 예산 자체가 낮아 예산 내/근접 후보가 없는 경우
- 행정구 또는 사업 단계 필터 때문에 표시 후보가 모두 사라진 경우
- `전체`, `전체 단계`를 해제해 의도적으로 결과가 비어 있는 경우

## 3. 사용자 행동

Empty State는 다음 행동을 제공합니다.

- `예산 상한 5천만 원 올려보기`: 현재 예산 상한을 MVP 슬라이더 단위만큼 올린 결과 페이지로 이동합니다.
- `필터 초기화`: 필터 때문에 결과가 비어 있는 경우 전체 조건으로 돌아갑니다.
- `조건 알림 신청`: MVP에서는 목업 CTA로 표시합니다.

## 4. 가까운 후보 표시

기본 결과 화면에서는 예산 초과 구역을 숨기지만, Empty State에서는 판단 보조용으로 가장 가까운 예산 초과 후보를 최대 3개 보여줍니다.

이 후보는 "현재는 예산 초과라 기본 결과에서는 숨겼지만, 예산 조정 판단용으로만 보여준다"는 문구와 함께 노출합니다.

## 5. 구현 파일

- `frontend/app/app/results/page.tsx`

## 6. 검증

권장 검증 명령:

```bash
npx eslint app/app/results/page.tsx
npx tsc --noEmit
npm run test:core-business
```

로컬 확인 URL:

```text
http://localhost:3000/app/results?budgetMin=100000000&budgetMax=300000000&districts=__none&stageGroups=__none&sort=budgetFitAsc
```
