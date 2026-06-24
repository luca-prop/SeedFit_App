# SeedFit MVP Data Disclosure Notice 260624

## 1. 목적

이 문서는 `MVP-018: 데이터 기준일 및 면책 문구 고정 노출`의 구현 기준을 정리합니다.

MVP-018의 목적은 사용자가 데이터 기반 화면을 볼 때 기준일, 원천 파일 기준, 투자 판단 면책을 항상 확인할 수 있게 하는 것입니다.

## 2. 노출 범위

다음 화면은 모두 공통 데이터 고지 영역을 통해 기준일과 면책을 표시합니다.

- 랜딩 및 B2C 화면: `(b2c)` 레이아웃 footer
- 검색 결과, 스캐터, 비교, 매물 상세: `/app` 레이아웃 footer

결과 페이지의 동적 데이터 동기화 alert는 유지합니다. 다만 공통 면책 문구는 `frontend/lib/dataDisclosure.ts`를 단일 원천으로 사용합니다.

## 3. 사용자 표시 문구 원칙

외부 사용자 화면에는 `Golden Sample`, `Naver LAND` 같은 내부 작업명 대신 다음 표현을 사용합니다.

- 구역 큐레이션 기준일: `2026-05-19`
- 기축 기준가 기준일: `2026-05-03`
- 원천 파일: `구역 CSV 1개, 기축 기준가 XLSX 2개 파일 세트`
- 운영 기준: `운영팀이 공개 자료와 단지 기준가를 검수`

## 4. 구현 파일

- `frontend/lib/dataDisclosure.ts`
- `frontend/components/domain/DataDisclosureNotice.tsx`
- `frontend/app/app/layout.tsx`
- `frontend/app/(b2c)/layout.tsx`
- `frontend/lib/reverseFilterCore.ts`
- `frontend/lib/reverseFilterDto.test.ts`

## 5. 검증

권장 검증 명령:

```bash
npx eslint app/app/layout.tsx "app/(b2c)/layout.tsx" components/domain/DataDisclosureNotice.tsx lib/dataDisclosure.ts lib/reverseFilterCore.ts lib/reverseFilterDto.test.ts
npx tsc --noEmit
npm run test:core-business
```

로컬 확인 URL:

```text
http://localhost:3000/
http://localhost:3000/app/results?budgetMin=100000000&budgetMax=300000000&sort=budgetFitAsc
```
