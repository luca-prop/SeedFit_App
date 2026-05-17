---
name: Prisma & Supabase Rules
description: Prisma ORM 및 Supabase (PostgreSQL) 연동 규칙
---

# 005. Database (Prisma + Supabase) Rules

## Prisma Schema (`prisma/schema.prisma`)
- 단일 진실 공급원으로 `schema.prisma`를 유지 관리한다.
- 모델 네이밍: PascalCase (예: `User`, `Zone`, `Listing`)
- 테이블 매핑: `@@map("table_names")` 를 통해 DB 테이블명은 snake_case로 유지.
- 외래키 명시적 참조: `@relation` 명확히 지정.
- Enum 활용: 단계(Stage), 권한(Role) 등은 Prisma Enum을 활용한다.

## 데이터베이스 연결 및 마이그레이션
- Connection Pooling: Supabase 연동 시 Transaction pooler (PgBouncer) 사용 고려.
- 데이터 조회 최적화: N+1 문제를 피하기 위해 Prisma `include` 및 `select`를 적절히 활용.
- 상태 변경: `create`, `update`, `upsert`를 사용하되, 무결성이 중요한 역산 로직에서는 Read Only 쿼리를 중심으로 설계.
