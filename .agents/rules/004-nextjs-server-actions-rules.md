---
name: Next.js Server Actions Rules
description: Next.js Server Actions 및 API Routes 설계 규칙
---

# 004. Next.js Server Actions Rules

## Server Actions (`app/actions/*.ts`)
- 백엔드 핵심 비즈니스 로직(역산 엔진, LTV 계산기, 대조 리포트)은 Server Action으로 캡슐화한다.
- 파일 최상단에 `"use server"` 지시어를 반드시 명시한다.
- 입력값 검증은 **Zod** 라이브러리를 사용하여 강력하게 타이핑하고 서버사이드에서 수행한다.
- 서버 액션의 응답은 항상 일관된 객체 포맷(`{ success, data?, error? }`)을 유지한다.
- 복잡한 연산 시 Vercel Edge Runtime을 고려하여 설계한다 (필요 시 `export const runtime = "edge"`).

## Route Handlers (`app/api/**/*.ts`)
- Webhook 수신, Vercel Cron 스케줄러 트리거, 외부 시스템 통신용으로만 제한적으로 사용한다.
- 클라이언트 컴포넌트와의 내부 통신은 가급적 Server Actions를 우선시한다.
