---
name: Security & RLS Rules
description: Supabase Row Level Security 및 암호화 등 보안 규칙
---

# 006. Security & RLS Rules

## Row Level Security (RLS)
- Supabase의 RLS 기능을 활성화하여 테이블 접근을 데이터베이스 단에서 보호한다.
- 매물(Listing) 정보의 소유주 연락처(`owner_contact`), 동호수(`unit_number`) 등 민감 데이터는 RLS 정책을 통해 등록한 중개사(B2B) 본인 및 Admin만 원본 조회가 가능하도록 제한한다.

## 데이터 암호화 및 마스킹
- 브리핑 화면이나 일반 B2C 유저에게 노출될 때는 반드시 마스킹 처리 유틸리티(예: `010-****-1234`)를 사용한다.
- 민감 데이터 저장 시 환경 변수 기반 AES 암호화 또는 Supabase Vault 적용을 검토한다.

## 권한 검증 (Authentication/Authorization)
- Server Actions 실행 시 사용자 세션/토큰을 확인하여 권한(B2B, Admin 등)을 검증한다.
- Zod를 통한 검증뿐만 아니라, `verifyPasscode` 등의 유틸리티를 사용해 Admin/B2B 전용 기능을 보호한다.
