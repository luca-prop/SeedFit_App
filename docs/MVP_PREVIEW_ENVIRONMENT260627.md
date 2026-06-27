# MVP-025 Preview 배포 환경 구성 260627

## 목적

MVP-025는 `localhost:3000`에서 검증한 MVP 3 Month 데이터와 기능이 Vercel Preview에서도 같은 기준으로 동작하도록 만드는 배포 환경 작업이다.

이번 기준 오류는 10~15억 예산 검색 시 Vercel Preview에서 `Reverse Filter 처리 중 오류가 발생했습니다.`가 노출되는 문제다. 이 문구는 서버 액션 내부 예외를 사용자용 일반 메시지로 치환한 결과이므로, Preview DB/env 연결 상태를 먼저 검증해야 한다.

## 사용자 결정

- Preview DB 전략: localhost와 Vercel Preview는 같은 MVP Preview DB/schema를 본다.
- Production 전환: MVP 완료 전까지 Production Supabase와 Preview DB/schema는 분리한다.
- 기준 URL: 기존 임시 Vercel 해시 URL이 아니라 최신 Preview alias URL을 기준으로 검증한다.
- 완료 기준: 핵심 B2C 화면에서 P0 runtime/console 오류 0건, 10~15억 Reverse Filter 오류 0건.

## 구현 방향

MVP-025에서는 비밀값을 노출하지 않는 점검 표면을 추가한다.

- `/api/preview-health`: 환경변수 존재 여부와 DB seed 상태를 JSON으로 반환한다.
- `/app/preview-health`: 사람이 직접 확인할 수 있는 Preview 점검 화면이다.

점검 항목:

- `DATABASE_URL` 존재 여부
- `DIRECT_URL` 존재 여부
- `NEXT_PUBLIC_SUPABASE_URL` 존재 여부
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 존재 여부
- `SUPABASE_SERVICE_ROLE_KEY` 존재 여부
- DB 연결 가능 여부
- `zones` row count
- `zone_investment_snapshots` row count
- `reference_apartments` row count
- `zone_reference_apartments` row count
- active `ltv_policies` row count
- 최신 snapshot 기준일

## 완료 기준

MVP-025 Done 기준:

- 최신 Preview alias URL에서 `/app/preview-health`가 `READY` 상태다.
- 최신 Preview alias URL에서 `/app/results?budgetMin=1000000000&budgetMax=1500000000`가 `Reverse Filter 처리 중 오류가 발생했습니다.`를 노출하지 않는다.
- 핵심 B2C flow에서 P0 runtime/console 오류가 없다.
- Preview 환경변수와 seed 상태가 문서 기준과 일치한다.

## 260627 검증 결과

- 기준 URL: `https://seed-fit-app-git-mvp-prototype-260621-luca-props-projects.vercel.app`
- 최신 해시 Preview URL: `https://seed-fit-p888ei1oz-luca-props-projects.vercel.app`
- 폐기 대상 해시 Preview URL: `https://seed-fit-7qbobcwkb-luca-props-projects.vercel.app`
- Supabase Preview DB schema: Prisma schema와 동기화 완료.
- Supabase Preview DB seed count: `zones` 84개, `zone_investment_snapshots` 84개, `reference_apartments` 86개, `zone_reference_apartments` 97개, active `ltv_policies` 4개.
- 10~15억 결과 페이지: `Reverse Filter 처리 중 오류가 발생했습니다.` 미노출, 후보 11개 표시.
- 핵심 B2C flow: 사용자 검수 기준 문제 없음.
- 브라우저 runtime/console error: 10~15억 결과 페이지 기준 0건.

## 소유자 점검 포인트

- Vercel Preview가 Production DB를 직접 쓰지 않는지 확인한다.
- localhost와 Preview가 같은 MVP Preview DB/schema를 보는지 확인한다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이며 `NEXT_PUBLIC_*`로 노출하지 않는다.
- Vercel Authentication이 켜져 있으면 외부 자동 점검은 로그인 없이 실패할 수 있다. 이 경우 `/app/preview-health`는 로그인된 사용자 기준으로 확인한다.
- Vercel 해시 Preview URL은 생성 시점의 스냅샷이므로 이전 해시 URL을 재검수 기준으로 쓰지 않는다. 검수와 공유는 최신 alias URL로 고정한다.

## 제외 범위

- Production 배포 전환은 MVP-030 판단 이후로 미룬다.
- Admin/B2B full dashboard 환경 구성은 3 Month MVP 범위가 아니다.
- 데이터 자체의 월간 업데이트 자동화는 MVP 완료 후 운영 작업으로 분리한다.
