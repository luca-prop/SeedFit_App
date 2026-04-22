# TASK 상세 명세서 — Batch 07 (LIB-003 ~ LIB-005, FE-F-001 ~ FE-F-002)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 7 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 35/89

---

## Issue #31: LIB-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Lib] LIB-003: components/passcode-guard.tsx — 시크릿 패스코드 검증 게이트 컴포넌트"
labels: 'shared-lib, frontend, security, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [LIB-003] PasscodeGuard 컴포넌트 구현
- **목적**: C-TEC-009에 따라 B2B/Admin Route Group 진입 시 **환경 변수 기반 시크릿 패스코드 검증**을 수행하는 게이트 컴포넌트를 구현한다. 패스코드 일치 시 children을 렌더링하고, 불일치 시 입력 폼을 Disabled 처리하며 안내 메시지를 표시한다. Supabase Auth + Middleware RBAC를 대체하는 MVP 핵심 보안 모듈이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 도메인 모듈: [`07_SRS_v1.0.md#6.9 PasscodeGuard`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- C-TEC-009: 환경 변수 기반 시크릿 패스코드
- REQ-FUNC-019: 패스코드 불일치 시 폼 Disabled + 안내
- B2B 시퀀스: [`07_SRS_v1.0.md#3.6.3, #6.3.3`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (Passcode Guard 흐름)
- 시스템 상태 전이: [`07_SRS_v1.0.md#6.5`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (패스코드_입력 → B2B/Admin/접근_거부)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/components/passcode-guard.tsx` 파일 생성 (Client Component — `"use client"`)
- [ ] 패스코드 검증 Server Action 생성: `src/app/actions/verify-passcode.ts`
  ```typescript
  'use server';
  export async function verifyPasscode(input: string, type: 'B2B' | 'ADMIN'): Promise<boolean> {
    const envKey = type === 'B2B' ? process.env.SECRET_B2B : process.env.SECRET_ADMIN;
    return input === envKey;
  }
  ```
- [ ] PasscodeGuard 컴포넌트 구현:
  ```typescript
  'use client';
  import { useState } from 'react';
  import { verifyPasscode } from '@/app/actions/verify-passcode';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';
  import { Alert, AlertDescription } from '@/components/ui/alert';

  interface PasscodeGuardProps {
    type: 'B2B' | 'ADMIN';
    children: React.ReactNode;
  }

  export function PasscodeGuard({ type, children }: PasscodeGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
      setIsLoading(true);
      const passcode = formData.get('passcode') as string;
      const result = await verifyPasscode(passcode, type);
      if (result) {
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('유효하지 않은 접근 코드입니다. 관리자에게 문의하세요');
      }
      setIsLoading(false);
    }

    if (isAuthenticated) return <>{children}</>;

    return (
      <div className="flex items-center justify-center min-h-screen">
        <form action={handleSubmit} className="w-full max-w-sm space-y-4 p-6">
          <h2>{type === 'B2B' ? 'B2B 파트너 인증' : '관리자 인증'}</h2>
          <Input name="passcode" type="password" placeholder="접근 코드 입력"
                 disabled={!!error} />
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Button type="submit" disabled={isLoading || !!error}>
            {isLoading ? '확인 중...' : '인증'}
          </Button>
        </form>
      </div>
    );
  }
  ```
- [ ] `/(b2b)/layout.tsx`에 PasscodeGuard 적용: `<PasscodeGuard type="B2B">{children}</PasscodeGuard>`
- [ ] `/(admin)/layout.tsx`에 PasscodeGuard 적용: `<PasscodeGuard type="ADMIN">{children}</PasscodeGuard>`
- [ ] **보안 주의**: `process.env.SECRET_*`는 Server Action 내에서만 접근. 클라이언트로 노출 금지 (`NEXT_PUBLIC_` 접두사 사용 절대 금지)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 올바른 패스코드 → children 렌더링**
- **Given**: PasscodeGuard가 B2B 타입으로 렌더링된 상태
- **When**: 올바른 SECRET_B2B 패스코드를 입력하고 인증 버튼을 클릭함
- **Then**: 패스코드 폼이 사라지고 children(매물 등록 폼 등)이 렌더링된다.

**Scenario 2: 잘못된 패스코드 → Disabled + 안내**
- **Given**: PasscodeGuard가 렌더링된 상태
- **When**: 잘못된 패스코드를 입력하고 인증 버튼을 클릭함
- **Then**: "유효하지 않은 접근 코드입니다. 관리자에게 문의하세요" 에러가 표시되고, Input이 Disabled된다.

**Scenario 3: 빈 패스코드 입력**
- **Given**: PasscodeGuard가 렌더링된 상태
- **When**: 빈 문자열로 인증을 시도함
- **Then**: 에러 메시지가 표시된다.

**Scenario 4: 환경 변수 클라이언트 비노출**
- **Given**: PasscodeGuard가 동작하는 상태
- **When**: 브라우저 개발자 도구에서 JavaScript 번들을 검색함
- **Then**: `SECRET_B2B`, `SECRET_ADMIN` 값이 번들에 포함되어 있지 않다.

### :gear: Technical & Non-Functional Constraints
- **보안**: 패스코드 검증은 반드시 Server Action에서 수행. 클라이언트에서 환경 변수와 직접 비교하는 코드 작성 금지
- **RISK-06 인지**: 패스코드 방식은 MVP 임시 솔루션. Phase 2에서 Supabase Auth로 교체 예정
- **UX**: 에러 발생 시 Input Disabled → 새로고침으로만 재시도 가능 (무차별 대입 방지)
- **shadcn/ui**: Input, Button, Alert 컴포넌트 활용

### :checkered_flag: Definition of Done (DoD)
- [ ] `components/passcode-guard.tsx`가 존재하고 B2B/ADMIN 타입을 지원하는가?
- [ ] Server Action(`verify-passcode.ts`)에서만 환경 변수와 비교하는가?
- [ ] 올바른 패스코드 입력 시 children이 정상 렌더링되는가?
- [ ] 잘못된 패스코드 입력 시 Disabled + 에러 메시지가 표시되는가?
- [ ] `/(b2b)/layout.tsx`와 `/(admin)/layout.tsx`에 적용되어 있는가?
- [ ] TEST-004 (PasscodeGuard 단위 테스트)가 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (shadcn/ui), INIT-002 (Route Group 레이아웃), INIT-003 (환경 변수 정의)
- **Blocks**: FE-H-001 (B2B 매물 등록 폼), FE-H-003 (패스코드 불일치 UI), FE-H-005 (브리핑 모드), FE-I-001 (Admin 대시보드), TEST-004 (단위 테스트), TEST-INT-001 (B2B E2E)

---

## Issue #32: LIB-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Lib] LIB-004: lib/masking.ts — 민감 정보 UI 마스킹 유틸"
labels: 'shared-lib, frontend, security, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [LIB-004] MaskingUtil — 민감 정보 UI 마스킹 렌더링 유틸 구현
- **목적**: C-TEC-010에 따라 AES-256 백엔드 암호화를 대체하는 **프론트엔드 UI 마스킹 렌더링** 유틸을 구현한다. B2B 브리핑 모드(FE-H-005)에서 소유주 연락처를 `010-****-1234` 형태로, 동호수를 `***-****` 형태로 가려서 표시한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 도메인 모듈: [`07_SRS_v1.0.md#6.9 MaskingUtil`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- C-TEC-010: UI 마스킹 렌더링 + Supabase RLS
- REQ-FUNC-017: 브리핑 모드 민감 정보 UI 마스킹

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/masking.ts` 파일 생성
- [ ] 함수 구현:
  ```typescript
  /**
   * 전화번호를 마스킹한다.
   * '01012345678' → '010-****-5678'
   * '010-1234-5678' → '010-****-5678'
   */
  export function maskPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '';
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 7) return '***-****-****';
    const prefix = cleaned.slice(0, 3);
    const suffix = cleaned.slice(-4);
    return `${prefix}-****-${suffix}`;
  }

  /**
   * 동호수를 마스킹한다.
   * '101-1201' → '***-****'
   * '1동 1201호' → '**-****'
   */
  export function maskUnitNumber(unit: string | null | undefined): string {
    if (!unit) return '';
    return unit.replace(/[0-9]/g, '*');
  }

  /**
   * 이름을 마스킹한다 (향후 확장용).
   * '김철수' → '김**'
   */
  export function maskName(name: string | null | undefined): string {
    if (!name || name.length < 2) return '***';
    return name[0] + '*'.repeat(name.length - 1);
  }
  ```

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 전화번호 마스킹 (하이픈 없는 형태)**
- **Given**: `'01012345678'`이 주어짐
- **When**: `maskPhoneNumber('01012345678')`를 호출함
- **Then**: `'010-****-5678'`이 반환된다.

**Scenario 2: 전화번호 마스킹 (하이픈 있는 형태)**
- **Given**: `'010-1234-5678'`이 주어짐
- **When**: `maskPhoneNumber('010-1234-5678')`를 호출함
- **Then**: `'010-****-5678'`이 반환된다.

**Scenario 3: 동호수 마스킹**
- **Given**: `'101-1201'`이 주어짐
- **When**: `maskUnitNumber('101-1201')`를 호출함
- **Then**: `'***-****'`이 반환된다.

**Scenario 4: null/undefined 입력 방어**
- **Given**: `null`이 주어짐
- **When**: `maskPhoneNumber(null)`를 호출함
- **Then**: 빈 문자열 `''`이 반환된다.

**Scenario 5: 짧은 전화번호 방어**
- **Given**: `'1234'` (7자 미만)이 주어짐
- **When**: `maskPhoneNumber('1234')`를 호출함
- **Then**: `'***-****-****'`이 반환된다.

### :gear: Technical & Non-Functional Constraints
- **순수 함수**: DB 접근 없는 순수 문자열 변환 함수. 서버/클라이언트 양쪽에서 사용 가능
- **C-TEC-010**: 이 유틸은 프론트엔드 렌더링 시점에서만 사용. 원본 데이터는 DB에 평문 저장(DB-010 RLS로 보호)
- **null-safe**: 모든 함수는 null/undefined 입력에 대해 안전하게 빈 문자열 반환

### :checkered_flag: Definition of Done (DoD)
- [ ] `maskPhoneNumber`, `maskUnitNumber`, `maskName` 함수가 구현되어 있는가?
- [ ] null/undefined 입력에 대해 빈 문자열을 반환하는가?
- [ ] 하이픈 유무에 관계없이 전화번호 마스킹이 일관적인가?
- [ ] TEST-003 (마스킹 단위 테스트)가 통과하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001
- **Blocks**: FE-H-005 (브리핑 모드 UI 마스킹), TEST-003 (단위 테스트)

---

## Issue #33: LIB-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Lib] LIB-005: lib/slack-webhook.ts — Slack #dev-alert 채널 경고 발송 유틸"
labels: 'shared-lib, backend, monitoring, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [LIB-005] Slack Webhook 경고 발송 유틸 구현
- **목적**: Vercel Logs 기반 모니터링 및 배치 수집 실패 시 Slack #dev-alert 채널로 경고 메시지를 전송하는 유틸 함수를 구현한다. PagerDuty를 대체하는 MVP 경량 알림 시스템이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 외부 시스템: [`07_SRS_v1.0.md#3.1 EXT-05`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (Slack Webhook)
- REQ-NF-014: p90 Latency 경고 → Slack
- REQ-NF-018: 배치 수집 실패 → Slack 경고
- 배치 시퀀스: [`07_SRS_v1.0.md#6.3.4`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/lib/slack-webhook.ts` 파일 생성
- [ ] 함수 구현:
  ```typescript
  type AlertLevel = 'info' | 'warning' | 'critical';

  const COLOR_MAP: Record<AlertLevel, string> = {
    info: '#36a64f',     // green
    warning: '#ff9900',  // orange
    critical: '#ff0000', // red
  };

  interface SlackAlertOptions {
    title: string;
    message: string;
    level: AlertLevel;
    fields?: { title: string; value: string }[];
  }

  export async function sendSlackAlert(options: SlackAlertOptions): Promise<boolean> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[Slack] SLACK_WEBHOOK_URL not configured. Skipping alert.');
      return false;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${options.level === 'critical' ? '🚨' : '⚠️'} ${options.title}`,
          attachments: [{
            color: COLOR_MAP[options.level],
            text: options.message,
            fields: options.fields?.map(f => ({ ...f, short: true })),
            ts: Math.floor(Date.now() / 1000),
          }],
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('[Slack] Failed to send alert:', error);
      return false;
    }
  }
  ```
- [ ] 비차단 방식: Slack 전송 실패 시에도 호출자의 로직에 영향 없음 (`try/catch` + `return false`)
- [ ] 환경 변수 미설정 시 graceful skip (console.warn만 출력)

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 정상 알림 발송**
- **Given**: `SLACK_WEBHOOK_URL`이 설정된 상태
- **When**: `sendSlackAlert({ title: 'Test', message: 'Hello', level: 'info' })`를 호출함
- **Then**: Slack API에 POST 요청이 전송되고 `true`가 반환된다.

**Scenario 2: Webhook URL 미설정 시 graceful skip**
- **Given**: `SLACK_WEBHOOK_URL`이 없는 상태
- **When**: `sendSlackAlert(...)`를 호출함
- **Then**: console.warn이 출력되고 `false`가 반환되며, 에러가 throw되지 않는다.

**Scenario 3: 네트워크 장애 시 비차단**
- **Given**: Slack API가 응답하지 않는 상태
- **When**: `sendSlackAlert(...)`를 호출함
- **Then**: `false`가 반환되고, 호출자의 로직은 정상 계속된다.

### :gear: Technical & Non-Functional Constraints
- **비차단 방식**: Slack 전송은 서비스 동작에 영향을 주지 않는 부가 기능 (EXT-05 우회 전략)
- **서버 측 전용**: `process.env.SLACK_WEBHOOK_URL`은 서버에서만 접근. Server Action/Route Handler 내에서만 호출

### :checkered_flag: Definition of Done (DoD)
- [ ] `sendSlackAlert` 함수가 구현되어 있는가?
- [ ] Webhook URL 미설정 시 에러 없이 `false`를 반환하는가?
- [ ] critical/warning/info 레벨별 색상이 적용되는가?
- [ ] fetch 실패 시 try/catch로 안전하게 처리되는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-003 (SLACK_WEBHOOK_URL 환경 변수)
- **Blocks**: BE-J-001 (배치 Cron 실패 시 Slack 경고), NFR-009 (모니터링 알림 통합)

---

## Issue #34: FE-F-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-F-001: B2C 랜딩 페이지 — 단일 가용 현금 입력창 중앙 배치 (RSC SSR)"
labels: 'frontend, ui, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-F-001] B2C 랜딩 페이지 RSC — 단일 가용 현금 입력창
- **목적**: 앱 초기 랜딩 화면을 구현한다. "복잡한 지도가 아닌 **단일 '가용 현금 입력창'을 화면 중앙에 배치**"(REQ-FUNC-001)하여, 사용자가 가용 현금만 입력하면 역산 알고리즘이 즉시 실행되는 핵심 UX를 제공한다. **RSC SSR로 1초 이내 렌더링**(REQ-NF-003)을 달성해야 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-001: 단일 가용 현금 입력창 화면 중앙 1초 이내 렌더링
- REQ-NF-003: RSC SSR 랜딩 렌더링 1초 이내
- SCOPE-IN-04: 단일 검색창 랜딩 UX
- 역산 시퀀스: [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) (앱 접속 → SSR 렌더링 → 입력창 HTML 반환)
- REQ-NF-022: 북극성 KPI — `View_Landing_Page` 이벤트 시작점

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/page.tsx` 구현 (RSC Server Component):
  ```typescript
  // Server Component — SSR로 즉시 HTML 반환
  export default function LandingPage() {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <section className="text-center space-y-6 max-w-lg px-4">
          <h1 className="text-3xl font-bold">내 가용 현금으로<br/>진입 가능한 재개발 구역은?</h1>
          <p className="text-muted-foreground">가용 현금만 입력하세요. 취득세와 대출을 고려한 역산으로 바로 찾아드립니다.</p>
          <CashInputForm /> {/* Client Component */}
        </section>
      </main>
    );
  }
  ```
- [ ] `src/app/(b2c)/_components/cash-input-form.tsx` (Client Component — `"use client"`):
  ```typescript
  'use client';
  // shadcn/ui Input + Button
  // 한국 원화 포맷팅 (1,000 단위 쉼표)
  // 입력값 상태 관리
  // 검색 버튼 클릭 → router.push(`/search?cash=${cash}`)
  ```
- [ ] 원화 포맷팅 로직: 입력 시 실시간 쉼표 포맷팅 (`3억` → `300,000,000`)
- [ ] shadcn/ui 컴포넌트 추가: `npx shadcn@latest add input button`
- [ ] 반응형 디자인: 모바일/데스크톱 양쪽에서 입력창이 중앙 정렬
- [ ] SEO 메타데이터: `<title>재개발 Navigator — 내 예산에 맞는 재개발 구역 찾기</title>`

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 랜딩 페이지 렌더링**
- **Given**: 앱에 처음 접속한 상태
- **When**: `localhost:3000/` 또는 Production URL에 접속함
- **Then**: 화면 중앙에 "가용 현금 입력창"이 **1초 이내**로 렌더링된다.

**Scenario 2: 원화 포맷팅**
- **Given**: 입력창에 포커스된 상태
- **When**: `300000000`을 입력함
- **Then**: 입력창에 `300,000,000`으로 표시되고, 내부 값은 `300000000`(숫자)이다.

**Scenario 3: 검색 실행**
- **Given**: 가용 현금 `300,000,000`이 입력된 상태
- **When**: 검색 버튼을 클릭함
- **Then**: `/search?cash=300000000` 경로로 이동한다.

**Scenario 4: 빈 입력 방지**
- **Given**: 입력창이 비어있는 상태
- **When**: 검색 버튼을 클릭함
- **Then**: 버튼이 비활성화되어 있거나, "금액을 입력해 주세요" 안내가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **RSC SSR**: `page.tsx`는 Server Component. 입력 폼만 Client Component로 분리하여 JS 번들 최소화
- **REQ-NF-003**: LCP(Largest Contentful Paint) ≤ 1초. 불필요한 클라이언트 JS 번들 제거
- **C-TEC-004**: shadcn/ui Input, Button 사용. 커스텀 CSS 최소화
- **비로그인**: 인증 없이 즉시 접근 가능 (C-TEC-009: B2C 비로그인 전면 개방)

### :checkered_flag: Definition of Done (DoD)
- [ ] `/(b2c)/page.tsx`가 RSC(Server Component)로 구현되어 있는가?
- [ ] 단일 가용 현금 입력창이 화면 중앙에 배치되어 있는가?
- [ ] 원화 포맷팅(쉼표)이 실시간으로 적용되는가?
- [ ] 검색 클릭 시 `/search?cash=...`로 라우팅되는가?
- [ ] Lighthouse LCP ≤ 1초인가(로컬 기준)?
- [ ] 모바일/데스크톱 반응형이 동작하는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-002 (Route Group 구조), INIT-001 (shadcn/ui)
- **Blocks**: FE-F-002 (결과 리스트), NFR-003 (LCP 성능 측정), NFR-007 (Amplitude `View_Landing_Page` 이벤트)

---

## Issue #35: FE-F-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-F-002: B2C 역산 결과 리스트 렌더링 — 구역 카드 목록 + Pagination"
labels: 'frontend, ui, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-F-002] 역산 결과 리스트 렌더링 컴포넌트
- **목적**: 역산 알고리즘(BE-F-001)이 반환한 매칭 구역 리스트를 카드 형태로 렌더링한다. 각 카드에는 구역명, 행정구, 사업 단계, 예상 실투자금 범위, 매칭 적합도가 표시되며, **Pagination**(REQ-NF-002)을 적용하여 1,000개 이상 구역 로딩 시에도 성능을 유지한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-002: 역산 결과 리스트 p95 ≤ 1.5초 반환
- REQ-NF-002: 1,000개 이상 구역 Pagination/Lazy Loading
- API-SPEC-001 Output: `ReverseFilterOutput` — `zones[]`, `total_count`, `data_synced_at`
- 역산 시퀀스: [`07_SRS_v1.0.md#6.3.1`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)
- REQ-NF-022: `View_Filtered_Result_List` 이벤트

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/search/page.tsx` 구현 (Server Component):
  - URL Query Param `cash` 파싱
  - Server Action(`reverseFilter`) 호출
  - 결과를 Client Component에 전달
- [ ] `src/app/(b2c)/_components/zone-result-list.tsx` (Client Component):
  - `ReverseFilterZone[]` 배열을 카드 목록으로 렌더링
  - 각 카드 구성요소:
    - 구역명 (`zone_name`)
    - 행정구 (`district`) 뱃지
    - 사업 단계 (`stage`) 컬러 라벨
    - 예상 실투자금 범위 (`estimated_investment_range.min ~ max`) 원화 표시
    - 매칭 적합도 (`match_score`) 프로그레스 바
  - 구역 카드 클릭 → `/(b2c)/comparison/[zoneId]` 라우팅
- [ ] `src/app/(b2c)/_components/pagination.tsx`: 페이지네이션 UI (shadcn/ui 기반)
- [ ] shadcn/ui 컴포넌트 추가: `npx shadcn@latest add card badge progress`
- [ ] 빈 결과 상태: 매칭 0건 시 → FE-F-003 (Empty State)으로 위임
- [ ] 로딩 상태: `loading.tsx` 스켈레톤 또는 Suspense boundary

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 역산 결과 리스트 렌더링**
- **Given**: `cash=300000000`으로 검색을 실행한 상태
- **When**: Server Action이 5건의 매칭 구역을 반환함
- **Then**: 5개의 구역 카드가 렌더링되고, 각 카드에 zone_name, district, stage, 실투자금 범위가 표시된다.

**Scenario 2: 카드 클릭 → 대시보드 이동**
- **Given**: 결과 리스트에 구역 카드가 표시된 상태
- **When**: '장위뉴타운' 카드를 클릭함
- **Then**: `/(b2c)/comparison/[zoneId]` 경로로 이동한다.

**Scenario 3: Pagination 동작**
- **Given**: 총 50건의 매칭 결과가 존재하고, 페이지당 20건
- **When**: 2페이지 버튼을 클릭함
- **Then**: 21~40번째 구역 카드가 표시된다.

**Scenario 4: 매칭 0건**
- **Given**: `cash=50000000` (5천만 원)으로 검색
- **When**: Server Action이 빈 배열을 반환함
- **Then**: 결과 리스트 대신 Empty State 컴포넌트(FE-F-003)가 렌더링된다.

**Scenario 5: 사업 단계 컬러 라벨**
- **Given**: stage가 `MANAGEMENT_DISPOSAL`인 구역 카드
- **When**: 카드를 확인함
- **Then**: '관리처분인가' 한글 라벨이 적절한 색상 뱃지로 표시된다.

### :gear: Technical & Non-Functional Constraints
- **REQ-NF-002**: Pagination 적용 필수. 초기 로딩 시 최대 20건만 렌더링
- **Server Component + Client Component**: page.tsx(Server)에서 데이터 fetch → 결과를 Client Component로 props 전달
- **ZoneStage 한글 변환**: ENUM 값(`MANAGEMENT_DISPOSAL`)을 한글 라벨('관리처분인가')로 변환하는 매핑 객체 필요
- **shadcn/ui**: Card, Badge, Progress 컴포넌트 활용

### :checkered_flag: Definition of Done (DoD)
- [ ] `/(b2c)/search/page.tsx`가 Server Component로 데이터를 fetch하는가?
- [ ] 구역 카드에 5개 정보(이름, 구, 단계, 실투자금, 적합도)가 표시되는가?
- [ ] Pagination이 동작하는가?
- [ ] 카드 클릭 시 대시보드로 라우팅되는가?
- [ ] 매칭 0건 시 결과 리스트가 아닌 Empty State가 렌더링되는가?
- [ ] ZoneStage ENUM이 한글 라벨로 변환되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-001 (랜딩 페이지 — 검색 라우팅), API-SPEC-001 (Output 타입), INIT-002 (Route Group)
- **Blocks**: FE-G-001 (대시보드 — 카드 클릭 후 진입), NFR-002 (Pagination 성능), NFR-007 (Amplitude `View_Filtered_Result_List` 이벤트)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~06** | INIT-001~004, DB-001~010, API-SPEC-001~008, MOCK-001~006, LIB-001~002 | ✅ 완료 (30개) |
| **Batch 07** | LIB-003~005, FE-F-001~002 | ✅ **완료** |
| Batch 08 | FE-F-003~005, BE-F-001~002 | ⬜ 대기 |
| Batch 09 | FE-G-001~005 | ⬜ 대기 |
| Batch 10 | BE-G-001~002, FE-H-001~003 | ⬜ 대기 |
| Batch 11 | FE-H-004~005, BE-H-001~003 | ⬜ 대기 |
| Batch 12 | BE-H-004, FE-I-001~004 | ⬜ 대기 |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
