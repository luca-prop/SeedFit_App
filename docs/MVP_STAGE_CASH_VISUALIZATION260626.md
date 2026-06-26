# SeedFit MVP Stage Cash Visualization 260626

## 1. 목적

이 문서는 `MVP-023: 사업 단계/실투자금 시각화 구현`의 구현 기준과 오너십 점검 포인트를 정리합니다.

MVP-023의 목적은 사용자가 검색 결과 구역들의 상대 위치를 빠르게 이해하게 하는 것입니다.

핵심 질문은 다음입니다.

- 같은 예산 안에서 어떤 사업 단계의 구역을 볼 수 있는가?
- 내 예산선과 각 구역의 실투자금 범위가 얼마나 가까운가?
- 후보 구역들이 초기/중기/후기 중 어디에 몰려 있는가?

## 2. 구현 방향

기존 `ResultsScatterExplorer`를 확장합니다.

- X축: 사업 단계
- Y축: 구역별 최소~최대 실투자금
- 마커: 최소~최대 실투자금 범위의 평균값을 대표 위치로 표시
- 예산 표시: 입력 예산 범위를 파란 밴드와 최소/최대 예산선으로 표시

이 작업은 Phase 2 수준의 복잡한 투자 차트가 아닙니다. MVP에서는 결과 리스트 위에서 “상대 위치를 이해시키는 보조 시각화”로 제한합니다.

## 3. 사용자 점검 포인트

사용자는 Preview에서 다음을 확인합니다.

- 파란 예산 범위가 입력한 `budgetMinKrw` / `budgetMaxKrw`와 일치하는가?
- 각 점이 구역 실투자금 범위의 대표 위치로 이해되는가?
- 최소~최대 실투자금 상세가 툴팁과 구역 상세에서 자연스럽게 확인되는가?
- X축 사업 단계가 왼쪽 초기 → 오른쪽 후기 흐름으로 보이는가?
- 차트를 보고 리스트를 보기 전에 후보 분포를 대략 이해할 수 있는가?

## 4. 구현 파일

- `frontend/components/b2c/ResultsScatterExplorer.tsx`
- `frontend/app/app/results/page.tsx`

## 5. 제외 범위

MVP-023에서는 다음을 제외합니다.

- 별도 `/app/scatter` Phase 2 화면 리디자인
- 전고점 회복률/기축 비교군 동시 표시
- 고급 줌/핀/멀티 셀렉션 분석 UI

## 6. 검증

권장 검증 명령:

```bash
npx eslint components/b2c/ResultsScatterExplorer.tsx
npx tsc --noEmit
npm run build
```

