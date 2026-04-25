# Frontend Component Architecture

**프로젝트**: 씨드핀 (Seedpin)
**작성일**: 2026-04-25

본 문서는 씨드핀 프론트엔드 프로젝트의 컴포넌트 계층 구조, 현재 설계 현황, 그리고 향후 개선점을 분석합니다.

---

## 1. 컴포넌트 계층 차트 (Component Hierarchy)

현재 프론트엔드(`navigator-frontend`)는 Next.js App Router 아키텍처를 기반으로 하며, 범용 UI 컴포넌트와 비즈니스 로직이 결합된 도메인 컴포넌트로 분리되어 있습니다.

```mermaid
graph TD
    A[App Root] --> B(Layout)
    B --> C[Page: Home /]
    B --> D[Page: Comparison /comparison/:id]
    B --> E[Page: Listings /listings/:id]

    %% Home Page
    C --> C1(Dashboard Component)
    C1 --> C2[Card UI]

    %% Comparison Page
    D --> D1(Header Component)
    D --> D2(ComparisonAptCard)
    D --> D3(Redevelopment Zone Info)
    D --> D4(DeepAnalysisReport)
    
    D2 --> U1(MetricCard)
    D2 --> U2(Dialog UI)
    
    D4 --> U3(Table UI)

    %% Listings Page
    E --> E1(Property Listing View)
    E1 --> U1(MetricCard)
    E1 --> U2(Dialog UI)
    E1 --> U4(Pagination UI)
    E1 --> U5(Badge UI)

    %% Shared UI Primitives
    subgraph Shared UI (components/ui/)
        U1(MetricCard)
        U2(Dialog / Button / Input)
        U3(Table)
        U4(Pagination)
        U5(Badge / Card)
        U6(KeyValueRow)
    end

    subgraph Domain UI (components/domain/)
        D2
        D4
    end
```

---

## 2. 컴포넌트 구조 현황

1. **Atomic Design & UI Primitives 활용**
   - **Shadcn UI 기반 구축**: `Button`, `Card`, `Dialog`, `Table` 등 애플리케이션의 뼈대가 되는 기본 UI 요소들을 `components/ui/` 폴더 내에 배치했습니다.
   - **CVA(Class Variance Authority) 적용**: `MetricCard` 컴포넌트 등에 cva를 적용하여, `highlight={ "blue" | "mint" | "default" }`와 같은 직관적인 Prop만으로 색상, 테마, 타이포그래피 등의 시각적 위계를 완벽하게 제어합니다.
   
2. **비즈니스 도메인 컴포넌트 분리**
   - 1:1 대조 대시보드의 핵심인 기축 아파트 카드(`ComparisonAptCard.tsx`)와 심층 분석 리포트(`DeepAnalysisReport.tsx`)를 `components/domain/` 폴더로 분리하여 페이지 계층의 복잡도를 낮췄습니다.
   - **데이터 주도형(Data-Driven) 렌더링**: 리포트 내 하드코딩된 표(Table) 태그들을 제거하고, 배열(Array) 형태의 `REPORT_DATA` 객체를 순회(`map`)하는 방식으로 변경하여 유지보수성을 극대화했습니다.

3. **일관된 시각적 위계(Visual Hierarchy)**
   - 통계 지표를 표시하는 `MetricCard` 컴포넌트 도입으로, 앱 전체의 수치 표시 디자인(자간 `tracking-tight`, 라벨 대문자 처리 등)이 통일되었습니다.

---

## 3. 개선점 및 향후 과제 (Improvement Points)

1. **상태 관리 (State Management) 고도화**
   - 현재 대시보드의 새로고침 등 일부 기능에 React의 로컬 상태(`useState`)를 사용 중입니다. 
   - 향후 "가용 현금 역산 필터 결과"나 "LTV 글로벌 정책 변수"와 같은 전역 상태가 늘어날 경우, Zustand나 Jotai 같은 경량 전역 상태 관리 라이브러리의 도입이 필요합니다.

2. **서버 컴포넌트(RSC) 점진적 전환**
   - 대부분의 도메인 컴포넌트 최상단에 `"use client"`가 선언되어 있습니다. 
   - 초기 렌더링 성능 최적화와 SEO 강화를 위해, 상호작용(Interaction)이 없는 정적 데이터 표시 부분(예: `DeepAnalysisReport`의 초기 데이터 바인딩)은 서버 컴포넌트로 분리하는 리팩토링이 권장됩니다.

3. **데이터 패칭 계층 분리**
   - 현재 데이터는 `lib/mockData.ts`를 직접 import하여 사용하고 있습니다.
   - 실제 백엔드 API 연동을 대비하여, 데이터 패칭 로직을 Custom Hook(예: `useComparisonData`)으로 캡슐화하고 UI 컴포넌트와 비즈니스 로직을 완벽히 분리(Separation of Concerns)해야 합니다.

4. **접근성(a11y) 강화**
   - `MetricCard` 및 `KeyValueRow` 등에서 스크린 리더 사용자를 고려한 `aria-label` 속성이 누락되어 있습니다. 금융 데이터를 다루는 만큼 웹 접근성 표준 준수를 위한 마크업 개선이 필요합니다.
