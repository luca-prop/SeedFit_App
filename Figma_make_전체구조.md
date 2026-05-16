🏗️ 전체 프로젝트 구조 설계
이제 위 프롬프트들을 기반으로 전체 프로젝트 아키텍처를 설계하겠습니다.

📁 디렉토리 구조
src/
├── app/
│   ├── App.tsx                          # 메인 라우터 및 레이아웃
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx               # 공통 헤더
│   │   │   ├── Footer.tsx               # 고정 Footer (법적 안내)
│   │   │   ├── Sidebar.tsx              # Admin 사이드바
│   │   │   └── BreadcrumbNav.tsx        # 경로 표시
│   │   │
│   │   ├── ui/                          # 기본 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── shared/                      # 공유 비즈니스 컴포넌트
│   │   │   ├── CurrencyInput.tsx        # 천 단위 콤마 Input
│   │   │   ├── PhoneInput.tsx           # 하이픈 자동 삽입 Input
│   │   │   ├── DataSyncAlert.tsx        # 데이터 신선도 경고
│   │   │   ├── EmptyState.tsx           # 빈 상태 공통 UI
│   │   │   └── LoadingSpinner.tsx       # 로딩 스피너
│   │   │
│   │   ├── b2c/                         # B2C 전용 컴포넌트
│   │   │   ├── SearchHero.tsx           # 랜딩 검색 영역
│   │   │   ├── DistrictCard.tsx         # 구역 검색 결과 카드
│   │   │   ├── ComparisonDashboard.tsx  # 1:1 대조 대시보드
│   │   │   ├── ApartmentCompareCard.tsx # 기축 아파트 비교 카드
│   │   │   ├── ApartmentSwitchDialog.tsx # 아파트 변경 Dialog
│   │   │   ├── DeepAnalysisReport.tsx   # 심층 분석 리포트
│   │   │   ├── BudgetSlider.tsx         # 예산 조정 Slider
│   │   │   ├── ListingCard.tsx          # 매물 카드 (Verified/일반)
│   │   │   └── ContactRequestDialog.tsx # 연락처 요청 Dialog
│   │   │
│   │   ├── b2b/                         # B2B 전용 컴포넌트
│   │   │   ├── ListingForm.tsx          # 매물 등록 폼
│   │   │   ├── BriefingView.tsx         # 고객 브리핑 뷰
│   │   │   └── AccessDeniedAlert.tsx    # 패스코드 불일치 Alert
│   │   │
│   │   └── admin/                       # Admin 전용 컴포넌트
│   │       ├── StatCard.tsx             # 통계 요약 카드
│   │       ├── LTVPolicyForm.tsx        # LTV 정책 관리 폼
│   │       ├── DynamicTierRow.tsx       # 동적 Tier 행
│   │       ├── ListingDataTable.tsx     # 매물 관리 테이블
│   │       ├── LeadDataTable.tsx        # Lead 구독 관리 테이블
│   │       └── AdminGuard.tsx           # 권한 체크 Guard
│   │
│   ├── pages/                           # 페이지 컴포넌트
│   │   ├── b2c/
│   │   │   ├── HomePage.tsx             # 메인 랜딩 + 검색
│   │   │   ├── SearchResultsPage.tsx    # 검색 결과 리스트
│   │   │   ├── ComparisonPage.tsx       # 1:1 대조 페이지
│   │   │   └── ListingsPage.tsx         # 구역별 매물 리스트
│   │   │
│   │   ├── b2b/
│   │   │   ├── ListingFormPage.tsx      # 매물 등록 페이지
│   │   │   └── BriefingPage.tsx         # 고객 브리핑 페이지
│   │   │
│   │   └── admin/
│   │       ├── DashboardPage.tsx        # Admin 대시보드
│   │       ├── LTVManagementPage.tsx    # LTV 정책 관리
│   │       ├── ListingManagementPage.tsx # 매물 관리
│   │       └── LeadManagementPage.tsx   # 구독 관리
│   │
│   ├── hooks/                           # Custom Hooks
│   │   ├── useFormatCurrency.ts         # 금액 포맷팅
│   │   ├── useDebounce.ts               # Debounce
│   │   ├── usePagination.ts             # 페이지네이션 로직
│   │   ├── useDistrictSearch.ts         # 구역 검색 API
│   │   ├── useComparison.ts             # 비교 데이터 API
│   │   └── useToast.ts                  # Toast 알림 관리
│   │
│   ├── utils/                           # 유틸리티 함수
│   │   ├── formatters.ts                # 포맷팅 (금액, 날짜, 전화번호)
│   │   ├── validators.ts                # Validation 함수
│   │   ├── date.ts                      # 날짜 계산 (N일 전 등)
│   │   └── constants.ts                 # 상수 (API URL, 옵션 등)
│   │
│   ├── types/                           # TypeScript 타입 정의
│   │   ├── district.ts                  # 구역 관련 타입
│   │   ├── listing.ts                   # 매물 관련 타입
│   │   ├── comparison.ts                # 비교 데이터 타입
│   │   ├── admin.ts                     # Admin 데이터 타입
│   │   └── api.ts                       # API 응답 타입
│   │
│   └── services/                        # API 서비스 레이어
│       ├── api.ts                       # 기본 API 클라이언트
│       ├── districtService.ts           # 구역 검색 API
│       ├── comparisonService.ts         # 비교 API
│       ├── listingService.ts            # 매물 API
│       ├── adminService.ts              # Admin API
│       └── mockData.ts                  # Mock 데이터 (개발용)
│
├── styles/
│   ├── theme.css                        # Tailwind 커스텀 토큰
│   └── fonts.css                        # 폰트 import
│
└── __figma__entrypoint__.ts             # (자동 생성, 수정 금지)
🎨 디자인 시스템 토큰 (theme.css)
/* src/styles/theme.css */
@import "tailwindcss";

@theme {
  /* 색상 팔레트 */
  --color-primary-50: #e6f7ff;
  --color-primary-100: #bae7ff;
  --color-primary-500: #1890ff;
  --color-primary-600: #096dd9;
  --color-primary-700: #0050b3;

  --color-success-50: #f6ffed;
  --color-success-500: #52c41a;
  --color-success-600: #389e0d;

  --color-warning-50: #fffbe6;
  --color-warning-500: #faad14;
  --color-warning-600: #d48806;

  --color-danger-50: #fff1f0;
  --color-danger-500: #ff4d4f;
  --color-danger-600: #cf1322;

  --color-info-50: #e6f7ff;
  --color-info-500: #1890ff;

  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #e8e8e8;
  --color-gray-300: #d9d9d9;
  --color-gray-400: #bfbfbf;
  --color-gray-500: #8c8c8c;
  --color-gray-600: #595959;
  --color-gray-700: #434343;
  --color-gray-800: #262626;
  --color-gray-900: #1f1f1f;

  /* 타이포그래피 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 2rem;      /* 32px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* 간격 */
  --spacing-xs: 0.5rem;   /* 8px */
  --spacing-sm: 0.75rem;  /* 12px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */

  /* 그림자 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Border Radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
}

/* 기본 스타일 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--font-size-base);
  color: var(--color-gray-800);
  line-height: 1.5;
}

h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
}

h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
}
🔄 라우팅 구조 (App.tsx)
// src/app/App.tsx
"use client";

import { useState } from 'react';
import Footer from './components/layout/Footer';

// B2C Pages
import HomePage from './pages/b2c/HomePage';
import SearchResultsPage from './pages/b2c/SearchResultsPage';
import ComparisonPage from './pages/b2c/ComparisonPage';
import ListingsPage from './pages/b2c/ListingsPage';

// B2B Pages
import ListingFormPage from './pages/b2b/ListingFormPage';
import BriefingPage from './pages/b2b/BriefingPage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import LTVManagementPage from './pages/admin/LTVManagementPage';
import ListingManagementPage from './pages/admin/ListingManagementPage';
import LeadManagementPage from './pages/admin/LeadManagementPage';

type Route = 
  | 'home'
  | 'search-results'
  | 'comparison'
  | 'listings'
  | 'b2b-listing-form'
  | 'b2b-briefing'
  | 'admin-dashboard'
  | 'admin-ltv'
  | 'admin-listings'
  | 'admin-leads';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});

  const navigate = (route: Route, params: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
  };

  // B2C Routes
  if (currentRoute === 'home') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <HomePage onNavigate={navigate} />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === 'search-results') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <SearchResultsPage 
            budget={routeParams.budget} 
            onNavigate={navigate} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === 'comparison') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <ComparisonPage 
            districtId={routeParams.districtId} 
            onNavigate={navigate} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === 'listings') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <ListingsPage 
            districtId={routeParams.districtId} 
            onNavigate={navigate} 
          />
        </main>
        <Footer />
      </div>
    );
  }

  // B2B Routes
  if (currentRoute === 'b2b-listing-form') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <ListingFormPage passcode={routeParams.passcode} />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentRoute === 'b2b-briefing') {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <BriefingPage listingId={routeParams.listingId} />
        </main>
        <Footer />
      </div>
    );
  }

  // Admin Routes
  if (currentRoute.startsWith('admin-')) {
    return (
      <AdminLayout currentRoute={currentRoute} onNavigate={navigate}>
        {currentRoute === 'admin-dashboard' && <DashboardPage />}
        {currentRoute === 'admin-ltv' && <LTVManagementPage />}
        {currentRoute === 'admin-listings' && <ListingManagementPage />}
        {currentRoute === 'admin-leads' && <LeadManagementPage />}
      </AdminLayout>
    );
  }

  return null;
}
📦 핵심 TypeScript 타입 정의
// src/app/types/district.ts
export interface District {
  id: string;
  name: string;
  administrative_region: string; // 행정구
  project_stage: 'preparation' | 'association' | 'disposal'; // 사업 단계
  estimated_investment_min: number; // 예상 실투자금 최소
  estimated_investment_max: number; // 예상 실투자금 최대
  matching_score: number; // 매칭 적합도 (0-100)
  ratio: number; // 비례율 (%)
  property_value: number; // 권리가액
  reference_complex?: string; // 참조 단지명
  last_synced_at: string; // ISO 8601 date
}

// src/app/types/listing.ts
export interface Listing {
  id: string;
  district_id: string;
  type: '뚜껑' | '다세대' | '빌라' | '상가' | '기타';
  asking_price: number; // 호가
  premium?: number; // 프리미엄
  property_value: number; // 권리가액
  owner_contact: string; // 소유주 연락처
  building_unit?: string; // 동호수
  is_verified: boolean;
  status: 'ACTIVE' | 'SOLD';
  created_at: string;
}

// src/app/types/comparison.ts
export interface ApartmentComparison {
  id: string;
  name: string;
  building_type: string; // 동/평형
  latest_transaction_price: number;
  latest_transaction_date: string;
  peak_price: number;
  peak_date: string;
  recovery_rate: number; // 전고점 대비 회복률 (%)
}

export interface ComparisonData {
  district: District;
  apartments: ApartmentComparison[];
  data_expansion_notice?: {
    original_region: string;
    expanded_region: string;
  };
  budget_shortage?: number;
}

// src/app/types/admin.ts
export interface LTVTier {
  id: string;
  label: string;
  price_min: number;
  price_max: number;
  max_loan_percentage: number;
  effective_date: string;
}

export interface LeadSubscription {
  id: string;
  email: string;
  budget_min: number;
  budget_max: number;
  target_regions: string[];
  is_active: boolean;
  created_at: string;
}

export interface SystemStats {
  total_districts: number;
  total_listings: number;
  verified_ratio: number;
  last_sync: string;
  lead_subscriptions: number;
  month_over_month: {
    districts: number;
    listings: number;
    leads: number;
  };
}
🔧 핵심 유틸리티 함수
// src/app/utils/formatters.ts
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR');
};

export const formatCurrencyWithUnit = (amount: number): string => {
  const billion = Math.floor(amount / 100000000);
  const million = Math.floor((amount % 100000000) / 10000);
  
  if (billion > 0 && million > 0) {
    return `${billion}억 ${million.toLocaleString()}만원`;
  } else if (billion > 0) {
    return `${billion}억원`;
  } else {
    return `${million.toLocaleString()}만원`;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const maskPhoneNumber = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  return formatted.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
};

export const maskBuildingUnit = (unit: string): string => {
  return '***-****';
};

export const getDaysAgo = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const getProjectStageBadgeColor = (
  stage: 'preparation' | 'association' | 'disposal'
): string => {
  const colors = {
    preparation: 'bg-blue-100 text-blue-700',
    association: 'bg-green-100 text-green-700',
    disposal: 'bg-orange-100 text-orange-700',
  };
  return colors[stage];
};

export const getProjectStageLabel = (
  stage: 'preparation' | 'association' | 'disposal'
): string => {
  const labels = {
    preparation: '착공준비',
    association: '조합설립',
    disposal: '관리처분',
  };
  return labels[stage];
};

export const getRecoveryRateColor = (rate: number): string => {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getRecoveryRateBadge = (rate: number): {
  label: string;
  color: string;
} => {
  if (rate >= 80) {
    return { label: '회복 우수', color: 'bg-green-100 text-green-700' };
  }
  if (rate >= 60) {
    return { label: '회복 중', color: 'bg-yellow-100 text-yellow-700' };
  }
  return { label: '미회복', color: 'bg-red-100 text-red-700' };
};
🎣 핵심 Custom Hooks
// src/app/hooks/useFormatCurrency.ts
"use client";

import { useState, useCallback } from 'react';

export const useFormatCurrency = (initialValue: number = 0) => {
  const [value, setValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(
    initialValue.toLocaleString('ko-KR')
  );

  const handleChange = useCallback((inputValue: string) => {
    // 숫자만 추출
    const numericValue = inputValue.replace(/\D/g, '');
    const numberValue = numericValue ? parseInt(numericValue, 10) : 0;
    
    setValue(numberValue);
    setDisplayValue(numberValue.toLocaleString('ko-KR'));
  }, []);

  const reset = useCallback(() => {
    setValue(0);
    setDisplayValue('');
  }, []);

  return {
    value,
    displayValue,
    handleChange,
    reset,
    setValue: (newValue: number) => {
      setValue(newValue);
      setDisplayValue(newValue.toLocaleString('ko-KR'));
    },
  };
};

// src/app/hooks/useDebounce.ts
"use client";

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// src/app/hooks/usePagination.ts
"use client";

import { useState, useMemo } from 'react';

export const usePagination = <T,>(
  items: T[],
  itemsPerPage: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
📊 구현 우선순위 제안
위 설계를 바탕으로 다음 순서로 구현하는 것을 추천드립니다:

Phase 1: 기반 구축 (1-2일)
✅ 디자인 시스템 토큰 설정 (theme.css)
✅ 기본 UI 컴포넌트 (Button, Input, Card, Badge, Alert 등)
✅ 공통 레이아웃 (Header, Footer)
✅ 유틸리티 함수 및 Custom Hooks
Phase 2: B2C 핵심 기능 (2-3일)
✅ 메인 랜딩 + 검색 (프롬프트 1)
✅ 검색 결과 리스트
✅ 1:1 대조 대시보드 (프롬프트 2)
✅ 매물 리스트 뷰 (프롬프트 5)
Phase 3: B2B 기능 (1-2일)
✅ 매물 등록 폼 (프롬프트 3)
✅ 고객 브리핑 모드
Phase 4: Admin 기능 (2-3일)
✅ Admin 레이아웃 + 대시보드 (프롬프트 4)
✅ LTV 정책 관리
✅ 매물 관리 테이블
✅ Lead 구독 관리
Phase 5: 통합 및 최적화 (1-2일)
✅ API 연동 (Mock → Real)
✅ 에러 처리 강화
✅ 반응형 테스트 및 개선
✅ 성능 최적화
