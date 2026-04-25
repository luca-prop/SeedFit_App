# 씨드핏 (Seed Fit) - 예산 맞춤 투자 분석 플랫폼

![Seed Fit Concept](https://img.shields.io/badge/Platform-Seed_Fit-blue?style=for-the-badge&logo=next.js)

**씨드핏(Seed Fit)**은 방대한 재개발 정보를 뒤지는 대신, 사용자의 '가용 현금'만으로 진입 가능한 타겟 구역을 3초 이내에 도출하고 기축 아파트와 1:1로 비교 분석해주는 혁신적인 프롭테크 플랫폼입니다.

👉 **[씨드핏 와이어프레임(Wireframe) 이미지로 보기](./SeedFit_wireframe.png)**

---

## 🚀 1. 주요 핵심 시나리오 (UX Flow)

씨드핏은 B2C(스마트 비기너)와 B2B(파트너 공인중개사) 사용자를 위한 최적화된 시나리오를 제공합니다.

- **B2C (스마트 비기너)**
  - **역방향 필터링**: 복잡한 지도 탐색 없이, 내 가용 현금을 입력하면 취득세와 LTV 규제를 자동 역산하여 진입 가능한 구역만 도출합니다.
  - **1:1 대조 분석**: 내 예산으로 살 수 있는 최선의 기축 아파트와 타겟 재개발 구역의 주거 비용, 현금 흐름, 미래 가치를 나란히 대조하여 투자 결정을 돕습니다.
  - **Verified 매물 시스템**: 오프라인 헛걸음을 방지하기 위해 시스템과 교차 검증된 신뢰할 수 있는 매물 및 중개소만 연결합니다.

- **B2B (파트너 공인중개사)**
  - **매물 검증 시스템**: 주변 실거래가 대비 오차율을 자동 계산하여 정상 범위 내 매물만 등록받아 'Verified' 뱃지를 부여합니다.
  - **브리핑 모드**: 오프라인 현장에서 2030 세대 고객 눈높이에 맞춘 정량적 시뮬레이션 차트 기반 브리핑을 제공합니다.

> 자세한 시나리오 흐름은 [docs/UX_FLOW.md](./docs/UX_FLOW.md)를 참고하세요.

---

## 🏗️ 2. 프론트엔드 아키텍처 (Component Architecture)

프론트엔드 프로젝트(`frontend/`)는 **Next.js App Router** 아키텍처를 기반으로 설계되었습니다.

- **Atomic Design & UI Primitives**: `Shadcn UI` 기반으로 구축되었으며, `MetricCard` 등 범용 컴포넌트는 `components/ui/`에 위치합니다.
- **도메인 격리**: 비즈니스 로직이 강하게 결합된 `ComparisonAptCard`, `DeepAnalysisReport` 등은 `components/domain/`으로 분리하여 의존성을 철저히 분리했습니다.
- **CVA(Class Variance Authority) 적용**: 임의의 문자열 조합 대신 `cva`를 도입하여 버튼, 카드 등의 색상 위계와 디자인 시스템을 중앙 집중화했습니다.
- **Data-Driven 렌더링**: 리포트와 표 등은 데이터(Array)를 순회 렌더링하도록 구축되어 유지보수성이 극대화되었습니다.

> 계층 다이어그램 및 개선 과제는 [docs/COMPONENT_ARCHITECTURE.md](./docs/COMPONENT_ARCHITECTURE.md)를 참고하세요.

---

## 💎 3. 코드 품질 및 AI 친화적 문서화 (Code Quality & Docstrings)

본 프로젝트는 **가독성, 재사용성, 유지보수성, 일관성** 측면에서 높은 수준의 코드 품질을 유지하고 있습니다.

- **다목적 JSDoc 도입**: 주요 컴포넌트 및 로직에는 인간 개발자뿐만 아니라 **AI 에이전트가 코드를 맥락적으로 완벽히 이해하고 확장할 수 있도록** 다목적 Docstring 구조가 전면 도입되었습니다.
- **상태 및 로직 분리**: 컴포넌트 내 렌더링 뷰와 데이터 흐름이 깔끔하게 분리되어 얽힘(Spaghetti Code) 현상을 미연에 방지했습니다.

> 코드 품질에 대한 상세 평가 리포트는 [docs/CODE_QUALITY.md](./docs/CODE_QUALITY.md)를 참고하세요.

---

## 🛠️ 4. 시작하기 (Getting Started)

본 프로젝트의 프론트엔드는 Node.js 환경에서 아래 명령어를 통해 즉시 실행해볼 수 있습니다.

```bash
# 1. 프론트엔드 디렉토리로 이동
cd frontend

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행 (기본 포트: 3000)
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 씨드핏의 프로토타이핑 화면을 확인하실 수 있습니다.
