# SeedFit MVP Zone Detail Lite 260624

## 1. 목적

이 문서는 `MVP-019: 구역 상세 Lite 화면 구현`의 구현 기준을 정리합니다.

MVP-019의 목적은 사용자가 Reverse Filter 결과에서 특정 구역을 선택했을 때, 비교 화면으로 바로 넘어가기 전에 구역의 기본 정보와 최신 투자금 범위를 빠르게 확인할 수 있게 하는 것입니다.

## 2. 화면 경로

구역 상세 Lite 화면은 다음 경로를 사용합니다.

```text
/app/zones/[id]
```

`id`는 Supabase `zones.id`를 사용합니다.

## 3. 표시 정보

상세 Lite 화면은 다음 정보를 보여줍니다.

- 구역명, 행정구, 동, 사업 유형
- 사업 단계
- 최신 실투자금 범위
- 데이터 기준일과 원천 데이터 기준
- 특징 및 확인 포인트
- 연결된 기축 레퍼런스 단지와 기준가

DB에 일부 값이 없으면 임의 값을 만들지 않고 `업데이트 예정` 또는 운영팀 검수 후 업데이트 문구로 표시합니다.

## 4. 진입 경로

다음 위치에서 `구역 상세 보기` CTA를 제공합니다.

- Reverse Filter 결과 리스트
- 결과 스캐터 차트 hover tooltip
- 결과 스캐터 차트 pinned tooltip

기존 `같은 예산 기축단지 비교` CTA는 유지합니다.

## 5. 구현 파일

- `frontend/app/app/zones/[id]/page.tsx`
- `frontend/app/app/results/page.tsx`
- `frontend/components/b2c/ResultsScatterExplorer.tsx`

## 6. 검증

권장 검증 명령:

```bash
npx eslint "app/app/zones/[id]/page.tsx" app/app/results/page.tsx components/b2c/ResultsScatterExplorer.tsx
npx tsc --noEmit
npm run test:core-business
```

로컬 확인은 `/app/results`에서 `구역 상세 보기` 링크가 노출되는지 확인한 뒤, 실제 링크로 이동해 수행합니다.
