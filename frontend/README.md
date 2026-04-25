# 씨드핏 (재개발Navigator) - Frontend

**씨드핏(Seed Fit)**은 사용자 예산에 맞춘 최적의 재개발 구역을 찾아주고, 기축 아파트와 1:1로 비교 분석해주는 "예산 맞춤 투자 분석 플랫폼"입니다.

## 🎨 디자인 및 프로토타입 기반
본 프론트엔드 프로젝트는 루트 디렉토리의 **`Prototypes/Antigravity`** 폴더에 기획 및 설계된 초기 UI/UX 프로토타입 디자인을 기반으로 구현 및 고도화되고 있습니다. 
기능 추가 및 UI 변경 시 해당 프로토타입의 디자인 원칙(Tech Blue 및 Neon Mint 엑센트, 깔끔한 카드 레이아웃 등)을 따릅니다.

## 🛠 기술 스택 (Tech Stack)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **UI Components:** Shadcn UI, Lucide Icons
- **Icons:** Lucide React

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬에서 실행하려면 아래 명령어를 순서대로 실행하세요.

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 접속
브라우저를 열고 [http://localhost:3000](http://localhost:3000) 주소로 접속하면 로컬 개발 환경을 확인할 수 있습니다.

## 📂 주요 폴더 구조
- `/app`: Next.js App Router 기반의 페이지 및 전역 라우팅 설정 (`page.tsx`, `layout.tsx` 등)
- `/components`: 재사용 가능한 UI 컴포넌트 
  - `/ui`: Shadcn UI 및 원시 컴포넌트 (`MetricCard`, `KeyValueRow` 등)
  - `/domain`: 비즈니스 로직이 포함된 복합 컴포넌트 (`ComparisonAptCard`, `DeepAnalysisReport` 등)
- `/public`: 정적 에셋 파일 (폰트, 이미지 등)
- `/lib`: 유틸리티 함수 및 설정 파일, 목업 데이터(`mockData.ts`)

## 📄 핵심 설계 문서 (Documentation)
프로젝트 기획, 아키텍처 및 코드 품질에 대한 상세 문서는 상위 루트의 `재개발Navigator_app/docs/` 폴더 내에 정리되어 있습니다.
- [01_SRS-001_v1.2.md](../../재개발Navigator_app/docs/01_SRS-001_v1.2.md): 소프트웨어 요구사항 명세서 (기능/비기능 요구사항, 릴리스 계획)
- [UX_FLOW.md](../../재개발Navigator_app/docs/UX_FLOW.md): B2C 스마트 비기너 및 B2B 파트너를 위한 핵심 UX 시나리오 분석
- [COMPONENT_ARCHITECTURE.md](../../재개발Navigator_app/docs/COMPONENT_ARCHITECTURE.md): 도메인 주도 UI 컴포넌트 계층도 및 상태 관리 개선 방향
- [CODE_QUALITY.md](../../재개발Navigator_app/docs/CODE_QUALITY.md): 가독성, 재사용성 중심의 코드 품질 평가 및 리팩토링 리뷰
