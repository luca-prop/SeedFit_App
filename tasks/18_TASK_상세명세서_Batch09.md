# TASK 상세 명세서 — Batch 09 (FE-G-001 ~ FE-G-005)

**Source**: `09_TASK_목록_명세서.md`  
**Batch**: 9 / 18 (총 89 Tasks)  
**Date**: 2026-04-18  
**누적 작성 현황**: 45/89

---

## Issue #41: FE-G-001

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-G-001: 1:1 대조 대시보드 레이아웃 — 재개발 vs 기축 비교 카드"
labels: 'frontend, ui, b2c, priority:critical'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-G-001] 1:1 대조 대시보드 레이아웃
- **목적**: 역산 결과에서 특정 구역을 선택한 사용자에게 **좌측: 재개발 구역 정보 / 우측: 기축 아파트 3개 비교 카드**(REQ-FUNC-008)를 렌더링한다. 각 기축 카드에는 전고점 대비 회복률%(REQ-FUNC-010)을 표시하여, 재개발 투자 vs 기축 매수의 실질적 비교를 가능하게 하는 핵심 UX이다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md) ⚠️ **이 시퀀스를 정독할 것**
- REQ-FUNC-008: LTV 기반 기축 아파트 3개 이상 자동 추천
- REQ-FUNC-009: 동일 행정구 신축 대장 단지 미래 가치 산정
- REQ-FUNC-010: 전고점 대비 회복률(%) 표시
- API-SPEC-003: `DashboardOutput` — `redevelopment`, `existing_apartments[]`, `district_expanded`
- REQ-NF-023: 대시보드 체류 시간 Amplitude 이벤트

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/comparison/[zoneId]/page.tsx` Server Component 생성:
  - URL Param `zoneId` + Query Param `cash` 파싱
  - `generateDashboard({ zone_id: zoneId, cash })` Server Action 호출
  - 결과를 Client Component에 props 전달
- [ ] `src/app/(b2c)/_components/dashboard-layout.tsx` Client Component:
  - **좌측 패널: 재개발 구역 정보 카드**
    - 구역명, 행정구, 사업 단계 뱃지
    - 비례율, 평균 권리가액
    - 잠재 미래 가치 (Bluechip 기준), 참조 신축 단지명
  - **우측 패널: 기축 아파트 카드 × 3+**
    - 아파트명, 행정구
    - 최신 실거래가 (원화 포맷팅)
    - 전고점(`peak_price_2122`) vs 현재가 비교
    - **회복률 배지**: `recovery_rate`% 컬러 코딩 (80%↑ 녹색, 60~80% 노랑, 60%↓ 빨강)
    - LTV 적용 실투자금
  - 반응형: 데스크톱(2컬럼) → 모바일(1컬럼 스택)
- [ ] shadcn/ui 컴포넌트 추가: `npx shadcn@latest add card badge tabs separator`
- [ ] 하단에 "심층 분석 리포트 보기" CTA 버튼 → FE-G-005 연결

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 대시보드 정상 렌더링**
- **Given**: 역산 결과에서 '장위뉴타운' 구역 카드를 클릭한 상태
- **When**: `/(b2c)/comparison/[zoneId]?cash=300000000` 페이지가 로드됨
- **Then**: 좌측에 재개발 구역 정보, 우측에 기축 아파트 3개 이상 카드가 표시된다.

**Scenario 2: 회복률 컬러 코딩**
- **Given**: 기축 아파트 카드의 `recovery_rate`가 75%인 상태
- **When**: 카드를 확인함
- **Then**: 회복률 배지가 노랑색(60~80% 범위)으로 표시된다.

**Scenario 3: 회복률 null 처리**
- **Given**: 기축 아파트의 `peak_price_2122`가 null인 상태
- **When**: 카드를 확인함
- **Then**: 회복률 배지 대신 "전고점 데이터 없음" 텍스트가 표시된다.

**Scenario 4: 반응형 레이아웃**
- **Given**: 모바일(375px)에서 대시보드에 접속함
- **When**: 레이아웃을 확인함
- **Then**: 좌측/우측 패널이 상하 스택으로 표시된다.

**Scenario 5: 재개발 미래 가치 표시**
- **Given**: Bluechip Reference 데이터가 존재하는 상태
- **When**: 좌측 재개발 카드를 확인함
- **Then**: "잠재 미래 가치: ○○억 (참조: ○○아파트 34평 기준)" 형태로 표시된다.

### :gear: Technical & Non-Functional Constraints
- **RSC SSR**: page.tsx에서 Server Action 직접 호출하여 데이터 fetch (API Route 경유 아님)
- **C-TEC-004**: shadcn/ui Card, Badge, Separator 조합
- **회복률 배지 기준**: 80%+ 녹색, 60~80% 노랑, 60%- 빨강 (SRS 미명시 → 팀 합의 기준)
- **금액 포맷**: 억 단위 변환 (`900000000` → `9억`)

### :checkered_flag: Definition of Done (DoD)
- [ ] 좌측 재개발 정보 + 우측 기축 3개+ 카드가 렌더링되는가?
- [ ] 각 기축 카드에 회복률(%) 배지가 컬러 코딩되어 있는가?
- [ ] 재개발 카드에 Bluechip 기반 미래 가치가 표시되는가?
- [ ] 데스크톱/모바일 반응형이 동작하는가?
- [ ] "심층 분석 리포트 보기" CTA 버튼이 존재하는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-F-002 (결과 리스트 — 카드 클릭 라우팅), API-SPEC-003 (DashboardOutput DTO), BE-G-001 (Dashboard Server Action)
- **Blocks**: FE-G-002 (인접 행정구 툴팁), FE-G-003 (LTV 미달 슬라이더), FE-G-004 (비교군 커스텀 편집), FE-G-005 (심층 리포트), NFR-008 (Amplitude 대시보드 이벤트)

---

## Issue #42: FE-G-002

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-G-002: 인접 행정구 확장 매칭 툴팁 컴포넌트"
labels: 'frontend, ui, b2c, priority:low'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-G-002] 인접 행정구 확장 매칭 안내 툴팁
- **목적**: `DashboardOutput.district_expanded === true`일 때, 대시보드 상단에 "동일 행정구 내 데이터 부재, 인접 행정구 기준 산정"이라는 안내 툴팁을 노출하여 데이터 산정 기준의 투명성을 보장한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-012: 인접 행정구 확장 매칭 안내
- API-SPEC-003: `DashboardOutput.district_expanded` 플래그

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/_components/district-expanded-tooltip.tsx` 컴포넌트 생성:
  ```typescript
  interface Props {
    districtExpanded: boolean;
    originalDistrict: string;
  }

  export function DistrictExpandedTooltip({ districtExpanded, originalDistrict }: Props) {
    if (!districtExpanded) return null;

    return (
      <Alert variant="info" className="mb-4">
        <AlertDescription>
          ℹ️ {originalDistrict} 내 비교 데이터가 부족하여, 인접 행정구 기준으로 산정되었습니다.
        </AlertDescription>
      </Alert>
    );
  }
  ```
- [ ] `dashboard-layout.tsx`의 기축 카드 영역 상단에 삽입

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 동일 행정구 데이터 존재 — 미노출**
- **Given**: `district_expanded === false`인 상태
- **When**: 대시보드를 확인함
- **Then**: 인접 확장 툴팁이 표시되지 않는다.

**Scenario 2: 인접 행정구 확장 — 노출**
- **Given**: `district_expanded === true`이고, `originalDistrict`가 '도봉구'인 상태
- **When**: 대시보드를 확인함
- **Then**: "도봉구 내 비교 데이터가 부족하여, 인접 행정구 기준으로 산정되었습니다" 안내가 표시된다.

### :gear: Technical & Non-Functional Constraints
- **조건부 렌더링**: `districtExpanded` 플래그가 false이면 컴포넌트가 DOM에 렌더링되지 않음 (`return null`)

### :checkered_flag: Definition of Done (DoD)
- [ ] `district_expanded === true`일 때만 안내가 표시되는가?
- [ ] false일 때 DOM에 아무것도 렌더링되지 않는가?
- [ ] 안내 텍스트에 원래 행정구명이 포함되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-G-001 (대시보드 레이아웃), BE-G-001 (`district_expanded` 플래그 반환)
- **Blocks**: 없음

---

## Issue #43: FE-G-003

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-G-003: LTV 미달 안내 + 예산 슬라이더 UI"
labels: 'frontend, ui, b2c, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-G-003] LTV 미달 시 안내 메시지 + 예산 슬라이더
- **목적**: 대시보드에서 현재 가용 현금으로 기축 아파트 매수가 불가능할 경우(LTV 미달), 안내 메시지를 표시하고 **shadcn/ui Slider로 예산을 조정**할 수 있는 인터랙티브 UI를 제공한다. 슬라이더 값 변경 시 실시간으로 비교 데이터가 갱신된다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-013: LTV 미달 시 안내 + 예산 슬라이더
- shadcn/ui Slider: `npx shadcn@latest add slider`

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/_components/budget-slider.tsx` Client Component 생성:
  ```typescript
  'use client';
  import { Slider } from '@/components/ui/slider';

  interface Props {
    currentCash: number;
    minBudget: number;  // 가장 저렴한 기축 아파트의 실투자금
    maxBudget: number;  // 슬라이더 상한
    onBudgetChange: (newCash: number) => void;
  }

  export function BudgetSlider({ currentCash, minBudget, maxBudget, onBudgetChange }: Props) {
    const isInsufficient = currentCash < minBudget;

    return (
      <div className="space-y-3">
        {isInsufficient && (
          <Alert variant="warning">
            <AlertDescription>
              현재 예산({formatKRW(currentCash)})으로는 비교 대상 기축 아파트 매수가 어렵습니다.
              최소 {formatKRW(minBudget)} 이상이 필요합니다.
            </AlertDescription>
          </Alert>
        )}
        <label className="text-sm font-medium">예산 조정</label>
        <Slider
          defaultValue={[currentCash]}
          min={minBudget * 0.5}
          max={maxBudget * 1.5}
          step={10000000} // 1천만 원 단위
          onValueChange={(v) => onBudgetChange(v[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatKRW(minBudget * 0.5)}</span>
          <span>{formatKRW(maxBudget * 1.5)}</span>
        </div>
      </div>
    );
  }
  ```
- [ ] shadcn/ui Slider 추가: `npx shadcn@latest add slider alert`
- [ ] 슬라이더 값 변경 시 debounce(500ms) 적용 후 대시보드 데이터 갱신 트리거
- [ ] 금액 포맷 유틸: `formatKRW(amount)` → 억 단위 변환

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: LTV 미달 안내 메시지**
- **Given**: 가용 현금 2억, 최소 기축 실투자금 3억인 상태
- **When**: 대시보드를 확인함
- **Then**: "현재 예산(2억)으로는 비교 대상 기축 아파트 매수가 어렵습니다" 안내가 표시된다.

**Scenario 2: 슬라이더로 예산 조정**
- **Given**: 슬라이더가 표시된 상태
- **When**: 슬라이더를 3억으로 이동함
- **Then**: 500ms debounce 후 대시보드 데이터가 3억 기준으로 갱신된다.

**Scenario 3: LTV 충족 시 안내 미노출**
- **Given**: 가용 현금 5억, 최소 기축 실투자금 3억인 상태
- **When**: 대시보드를 확인함
- **Then**: LTV 미달 안내 메시지가 표시되지 않는다 (슬라이더는 여전히 표시 가능).

### :gear: Technical & Non-Functional Constraints
- **debounce**: 슬라이더 드래그 중 과도한 Server Action 호출 방지 (500ms)
- **step**: 1천만 원 단위 조정 (한국 부동산 시장 관행)

### :checkered_flag: Definition of Done (DoD)
- [ ] LTV 미달 시 경고 메시지가 표시되는가?
- [ ] 슬라이더 값 변경 시 debounce 후 데이터가 갱신되는가?
- [ ] 금액이 억 단위로 포맷팅되어 표시되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-G-001 (대시보드 레이아웃)
- **Blocks**: 없음

---

## Issue #44: FE-G-004

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-G-004: 비교군 커스텀 편집 — 아파트 검색 + 비교 대상 변경 Dialog"
labels: 'frontend, ui, b2c, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-G-004] 비교군 커스텀 편집 Dialog
- **목적**: 대시보드의 기축 아파트 3개가 자동 추천된 후, 사용자가 특정 아파트를 직접 검색하여 비교 대상을 변경할 수 있는 Dialog UI를 제공한다. 개인화된 투자 비교 경험을 가능하게 한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-014: 비교군 커스텀 편집
- API-SPEC-003: `DashboardInput.custom_apt_ids?`

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/_components/custom-comparison-dialog.tsx` Client Component:
  ```typescript
  'use client';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  // Dialog 내부:
  // 1. 아파트명 검색 Input (debounce 300ms)
  // 2. 검색 결과 리스트 (Curated DB에서 조회)
  // 3. 선택/해제 토글
  // 4. "적용" 버튼 → custom_apt_ids 업데이트 → 대시보드 재조회
  ```
- [ ] shadcn/ui 추가: `npx shadcn@latest add dialog`
- [ ] 검색 API: Curated_Actual_Price_DB에서 `apartment_name LIKE '%keyword%'` 검색
- [ ] 기축 카드에 "변경" 버튼 추가 → Dialog 트리거

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: Dialog 열기**
- **Given**: 대시보드에 기축 아파트 3개가 표시된 상태
- **When**: 기축 카드의 "변경" 버튼을 클릭함
- **Then**: 아파트 검색 Dialog가 열린다.

**Scenario 2: 아파트 검색**
- **Given**: Dialog가 열린 상태
- **When**: 검색창에 "래미안"을 입력함
- **Then**: debounce(300ms) 후 "래미안"이 포함된 아파트 목록이 표시된다.

**Scenario 3: 비교 대상 변경 적용**
- **Given**: 검색 결과에서 새 아파트를 선택한 상태
- **When**: "적용" 버튼을 클릭함
- **Then**: Dialog가 닫히고, 대시보드가 변경된 비교군으로 재렌더링된다.

### :gear: Technical & Non-Functional Constraints
- **검색 범위**: Curated_Actual_Price_DB만 대상 (Bluechip은 제외)
- **최대 선택 수**: 기축 비교군 최대 5개까지 선택 가능 (UX 과부하 방지)

### :checkered_flag: Definition of Done (DoD)
- [ ] Dialog에서 아파트 검색이 동작하는가?
- [ ] 검색 결과에서 아파트를 선택/해제할 수 있는가?
- [ ] "적용" 시 대시보드가 변경된 비교군으로 갱신되는가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-G-001 (대시보드 레이아웃), DB-004 (Curated DB — 검색 대상)
- **Blocks**: 없음

---

## Issue #45: FE-G-005

```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[UI] FE-G-005: 심층 분석 리포트 비교표 렌더링 (RSC Streaming)"
labels: 'frontend, ui, b2c, priority:high'
assignees: ''
```

### :dart: Summary
- **기능명**: [FE-G-005] 심층 분석 리포트 4개 섹션 비교표 렌더링
- **목적**: 대시보드 하단 "심층 분석 리포트 보기" 클릭 시, **투자 구조·주거 비용·현금 흐름·미래 가치** 4개 섹션의 상세 비교표를 렌더링한다. RSC Streaming을 활용하여 데이터 로딩과 동시에 섹션별 순차 렌더링함으로써 **0.5초 이내 체감 렌더링**(REQ-FUNC-011)을 달성한다.

### :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- REQ-FUNC-011: 리포트 0.5초 이내 렌더링
- REQ-NF-004: RSC Streaming 기반 점진적 렌더링
- API-SPEC-003: `ReportOutput` — `report{ investment_structure, housing_cost, cash_flow, future_value }`
- 1:1 대조 시퀀스: [`07_SRS_v1.0.md#6.3.2`](file:///c:/Users/82104/.gemini/antigravity/playground/SRS-from-PRD-HealthProdinfo/재개발_navigator/07_SRS_v1.0.md)

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/(b2c)/comparison/[zoneId]/report/page.tsx` Server Component:
  - `generateReport({ zone_id, apt_ids, cash })` Server Action 호출
  - React `<Suspense>` 경계로 4개 섹션을 분리하여 Streaming
- [ ] 4개 섹션 컴포넌트 (Server Components):
  - `report-investment-structure.tsx`: 투자 구조 비교표
    - 재개발: 권리가액 + 추가분담금 + 취득세 = 총 투자금
    - 기축: 매매가 + 취득세 + 중개수수료 = 총 투자금
  - `report-housing-cost.tsx`: 주거 비용 비교
    - 재개발: 이주비, 조합 분담금, 공사 기간 중 임대료
    - 기축: 전세 레버리지, 관리비, 수선 유지비
  - `report-cash-flow.tsx`: 현금 흐름 시뮬레이션
    - 3년/5년/10년 시점의 예상 순자산 가치
  - `report-future-value.tsx`: 미래 가치 비교
    - 재개발: 준공 후 예상 시세 (Bluechip 기준)
    - 기축: 자연 감가상각 + 시세 변동 예측
- [ ] 각 섹션에 shadcn/ui Table 컴포넌트 활용
- [ ] 로딩 중 Skeleton 표시 (Suspense fallback)
- [ ] shadcn/ui 추가: `npx shadcn@latest add table skeleton`

### :test_tube: Acceptance Criteria (BDD/GWT)

**Scenario 1: 4개 섹션 렌더링**
- **Given**: 대시보드에서 "심층 분석 리포트 보기"를 클릭한 상태
- **When**: 리포트 페이지가 로드됨
- **Then**: 투자 구조, 주거 비용, 현금 흐름, 미래 가치 4개 섹션이 모두 표시된다.

**Scenario 2: Streaming 체감 속도**
- **Given**: 리포트 페이지에 접속함
- **When**: 페이지 로딩 중
- **Then**: 첫 번째 섹션(투자 구조)이 0.5초 이내에 표시되고, 나머지 섹션은 점진적으로 나타난다.

**Scenario 3: 투자 구조 데이터 정확성**
- **Given**: 재개발 구역 권리가액 2억, 기축 아파트 매매가 9억인 상태
- **When**: 투자 구조 비교표를 확인함
- **Then**: 각각의 총 투자금이 취득세, 수수료를 포함하여 정확히 산출되어 있다.

**Scenario 4: 로딩 Skeleton**
- **Given**: 네트워크 지연이 있는 상태
- **When**: 리포트 페이지에 접속함
- **Then**: 데이터 로드 전에 Skeleton UI가 각 섹션 위치에 표시된다.

### :gear: Technical & Non-Functional Constraints
- **REQ-NF-004**: React `<Suspense>` + RSC Streaming 필수. 4개 섹션을 독립 Suspense boundary로 분리
- **REQ-FUNC-011**: "0.5초 이내 렌더링"은 첫 섹션의 LCP 기준. 전체 4개 섹션 완료가 아닌 첫 의미있는 렌더링 기준
- **Table 컴포넌트**: shadcn/ui Table로 일관된 비교표 형식
- **연산 집중**: 리포트 생성은 BE-G-002에서 수행. UI는 받은 데이터를 테이블로 렌더링만 담당

### :checkered_flag: Definition of Done (DoD)
- [ ] 4개 섹션이 Suspense boundary로 분리되어 Streaming 렌더링되는가?
- [ ] 첫 번째 섹션이 0.5초 이내에 표시되는가 (로컬 기준)?
- [ ] 각 섹션에 적절한 비교 데이터가 테이블 형식으로 표시되는가?
- [ ] Skeleton 로딩 UI가 존재하는가?
- [ ] 재개발 vs 기축의 비교가 동일 테이블에서 한눈에 가능한가?

### :construction: Dependencies & Blockers
- **Depends on**: FE-G-001 (대시보드 — CTA 버튼), BE-G-002 (Report Server Action), API-SPEC-003 (ReportOutput DTO)
- **Blocks**: TEST-007 (Report 단위 테스트), TEST-INT-002 (E2E 플로우)

---

## 작성 현황 추적표 (업데이트)

| Batch | Task IDs | 상태 |
|---|---|---|
| **Batch 01~08** | INIT~BE-F | ✅ 완료 (40개) |
| **Batch 09** | FE-G-001~005 | ✅ **완료** |
| Batch 10 | BE-G-001~002, FE-H-001~003 | ⬜ 대기 |
| Batch 11 | FE-H-004~005, BE-H-001~003 | ⬜ 대기 |
| Batch 12 | BE-H-004, FE-I-001~004 | ⬜ 대기 |
| Batch 13 | BE-I-001~003, BE-J-001~002 | ⬜ 대기 |
| Batch 14 | TEST-001~005 | ⬜ 대기 |
| Batch 15 | TEST-006~007, TEST-INT-001~003 | ⬜ 대기 |
| Batch 16 | TEST-INT-004~005, NFR-001~003 | ⬜ 대기 |
| Batch 17 | NFR-004~008 | ⬜ 대기 |
| Batch 18 | NFR-009~012 | ⬜ 대기 |
