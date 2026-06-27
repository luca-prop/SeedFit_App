# MVP-027 기본 에러 처리 및 로딩 상태 구현 260627

## 목적

MVP-027은 B2C 핵심 화면에서 데이터 조회나 Server Action이 실패했을 때 사용자가 실패 상황을 이해하고 다음 행동을 선택할 수 있게 만드는 작업이다.

이번 범위는 복잡한 장애 복구 시스템이 아니라, MVP Preview 검수 중 막히는 지점을 줄이는 기본 UX 안전장치다.

## 범위

- Server Action 실패 메시지 개선
- DB 조회 실패 안내
- `/app` 하위 공통 loading skeleton
- `/app` 하위 공통 runtime error boundary
- Results/Comparison 실패 카드의 확인 경로 개선

## 구현 내용

### Loading

- `/app/loading.tsx`를 추가했다.
- 결과 화면 구조와 비슷한 skeleton을 표시해, 검색 결과·구역 상세·비교 화면 이동 중 빈 화면처럼 보이지 않게 했다.
- 차트, 필터 칩, 요약 카드, 리스트 카드 자리를 skeleton으로 표시한다.

### Error Boundary

- `/app/error.tsx`를 추가했다.
- Zone Detail 등 서버 컴포넌트 DB 조회 중 예외가 발생하면 사용자가 다음 행동을 선택할 수 있다.
- 제공 액션:
  - 다시 시도
  - Preview Health 확인
  - 홈으로 이동
- 오류가 반복되면 최신 Preview alias URL과 `/app/preview-health`를 확인하도록 안내한다.

### Results

- Reverse Filter 실패 시 기존 일반 문구 대신 다음 정보를 표시한다.
  - 검색 결과를 불러오지 못했다는 사용자용 제목
  - 입력 예산 확인 안내
  - Preview DB/env 및 seed 상태 확인 안내
  - `errorCode`
  - 예산 다시 입력하기 CTA
  - Preview Health 확인 CTA

### Comparison

- 비교 데이터 실패 시 다음 정보를 표시한다.
  - 비교 데이터를 불러오지 못했다는 사용자용 제목
  - 결과 목록에서 다시 진입하라는 안내
  - 기축 대조군 seed 상태 확인 안내
  - 최신 Preview alias URL 확인 안내
  - `errorCode`
  - 검색 결과로 돌아가기 CTA
  - Preview Health 확인 CTA

### Server Action Message

- `reverseFilterAction`의 내부 오류 문구를 사용자에게 덜 막연한 표현으로 변경했다.
- `comparisonDataAction`의 내부 오류 문구를 기축 대조군 비교 데이터 문제로 이해할 수 있게 변경했다.
- 민감한 DB 오류 상세는 화면에 노출하지 않고 서버 로그에만 남긴다.

## 완료 기준

- 사용자가 실패 화면에서 무엇이 문제일 수 있는지 이해할 수 있다.
- 사용자가 다시 시도, 검색 결과 복귀, Preview Health 확인 중 하나를 선택할 수 있다.
- `/app` 하위 주요 화면 전환 중 기본 loading 상태가 보인다.
- 빌드가 통과한다.

## 검증 결과

- `npm run build`: 통과.
- 빌드 중 Recharts width/height 경고가 1회 출력되지만, 이번 error/loading 변경으로 인한 실패는 아니다.

## 제외 범위

- 장애 알림 자동화는 MVP-027 범위가 아니다.
- Sentry/Datadog 등 외부 에러 추적 도구 연동은 후속 NFR 작업에서 다룬다.
- 모든 예외 케이스별 맞춤 복구 플로우는 MVP 이후 운영 단계에서 확장한다.
