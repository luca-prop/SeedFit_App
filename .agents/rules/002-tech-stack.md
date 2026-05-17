---
name: Tech Stack & Architecture
description: SeedFit 프로젝트의 코어 기술 스택 정의
---

# 002. Technical Stack (Next.js Full-stack)

## Frontend & Backend Core
- **Framework**: Next.js 16.x (App Router, Turbopack, Server Actions)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)
- **State/Data**: React Server Components (RSC) + React hooks (useState, useMemo)
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: npm

## AI & Document Engine
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **AI Orchestration**: LangChain
- **LLM Provider**: Google Gemini

## Infrastructure
- **Hosting/Deployment**: Vercel (Edge Functions, Serverless)
- **Batch Jobs**: Vercel Cron
- **Monitoring**: Amplitude, Vercel Analytics, Datadog
- **Version Control**: Git + GitHub (Issue/Project 연동)
