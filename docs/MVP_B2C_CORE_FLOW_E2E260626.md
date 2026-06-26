# SeedFit MVP B2C Core Flow E2E 260626

## 1. 목적

이 문서는 `MVP-024: B2C 핵심 플로우 E2E 작성`의 구현 기준과 오너십 점검 포인트를 정리합니다.

MVP-024의 목적은 SeedFit B2C 사용자가 실제로 MVP 핵심 가치를 경험하는 흐름이 깨지지 않는지 자동 검증하는 것입니다.

## 2. 자동 검증 범위

Playwright E2E 테스트는 다음 흐름을 검증합니다.

1. 랜딩에서 `3억 단일` 예산 선택
2. `이 예산 범위로 구역 찾기` 실행
3. 결과 화면 진입 및 스캐터 차트 확인
4. 첫 번째 후보 구역 상세 진입
5. 구역 상세의 `기축 레퍼런스` 영역 확인
6. `같은 예산 기축단지 비교` 화면 진입
7. `비교 요약`과 `진입 가능한 기축 대조군` 확인
8. `일반 40%` LTV 모델 선택 확인

## 3. 구현 방향

E2E는 Playwright 기반으로 구성했습니다.

- 로컬 실행: `npm run test:e2e`
- Preview 실행: `E2E_BASE_URL=<Preview URL> npm run test:e2e`

`E2E_BASE_URL`이 없으면 Playwright가 로컬 Next.js dev 서버를 자동 실행합니다.
`E2E_BASE_URL`이 있으면 Vercel Preview 등 외부 URL을 직접 검증합니다.

## 4. 사용자 점검 포인트

사용자는 Preview에서 다음을 확인합니다.

- 테스트가 SeedFit의 핵심 사용자 흐름을 충분히 대표하는가?
- `3억 단일` 예산이 MVP 데모의 기본 검증값으로 적절한가?
- 결과 화면에서 반드시 검증해야 할 문구가 더 있는가?
- 구역 상세에서 `기축 레퍼런스` 확인만으로 충분한가, 또는 특정 레퍼런스 단지명까지 고정해야 하는가?
- 비교 화면에서 `일반 40%` 선택까지 E2E에 포함하는 것이 적절한가?

## 5. 제외 범위

MVP-024에서는 다음을 제외합니다.

- 전체 브라우저 매트릭스 테스트
- 모바일 viewport 별도 테스트
- 관리자/중개사 B2B 플로우
- GitHub Actions 자동 실행 연결
- Preview Supabase 환경변수 분리 검증

GitHub Actions 및 Preview 환경 연결은 `MVP-025`에서 다룹니다.

## 6. 검증

권장 검증 명령:

```bash
npm run test:e2e
npx tsc --noEmit
npm run build
```

