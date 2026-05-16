# SeedFit Frontend

이 디렉토리는 SeedFit (예산 맞춤 재개발 투자 플랫폼)의 Next.js 프론트엔드 및 백엔드(Server Actions) 통합 모노레포입니다.

## 🛠 기술 스택
- **Framework**: Next.js 16.x (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **ORM**: Prisma
- **Database**: SQLite (로컬 개발) / PostgreSQL (Supabase 배포)

## 🚀 로컬 실행 가이드

### 1. 환경 변수 설정
루트 디렉토리에 `.env` 파일을 복사하여 생성합니다.
```bash
cp .env.example .env
```
`.env` 파일에 데이터베이스 연결 문자열 등 필요한 변수를 입력합니다. 로컬 SQLite 사용 시 다음과 같이 설정합니다:
```env
DATABASE_URL="file:./dev.db"
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 데이터베이스 초기화
Prisma 스키마를 기반으로 SQLite 데이터베이스를 생성하고 클라이언트를 생성합니다.
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. 로컬 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 실행을 확인합니다.
