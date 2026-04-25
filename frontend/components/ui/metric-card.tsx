import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const metricCardVariants = cva(
  "p-4 rounded-xl border flex flex-col justify-center transition-colors",
  {
    variants: {
      highlight: {
        default: "bg-gray-50/80 border-gray-100",
        blue: "bg-blue-50/80 border-blue-100",
        green: "bg-emerald-50/80 border-emerald-100",
        yellow: "bg-yellow-50/80 border-yellow-100",
        red: "bg-red-50/80 border-red-100",
      },
      withBackground: {
        true: "",
        false: "bg-transparent border-transparent px-0 py-2",
      }
    },
    defaultVariants: {
      highlight: "default",
      withBackground: true,
    }
  }
);

const labelVariants = cva(
  "text-[11px] mb-1.5 font-semibold tracking-wider uppercase",
  {
    variants: {
      highlight: {
        default: "text-gray-500",
        blue: "text-blue-600/90",
        green: "text-emerald-600/90",
        yellow: "text-yellow-600/90",
        red: "text-red-600/90",
      }
    },
    defaultVariants: {
      highlight: "default",
    }
  }
);

const valueVariants = cva(
  "text-lg md:text-xl font-bold tracking-tight",
  {
    variants: {
      highlight: {
        default: "text-gray-900",
        blue: "text-blue-700",
        green: "text-emerald-700",
        yellow: "text-yellow-700",
        red: "text-red-700",
      }
    },
    defaultVariants: {
      highlight: "default",
    }
  }
);

/**
 * MetricCard에서 사용할 수 있는 Props 정의
 * 
 * @property {string} label - 수치 상단에 작게 표시될 제목 (예: "호가", "전고점")
 * @property {React.ReactNode} value - 중앙에 크게 표시될 핵심 수치 데이터
 * @property {"default"|"blue"|"green"|"yellow"|"red"} [highlight] - 카드 및 텍스트의 색상 테마 (기본값: default)
 * @property {boolean} [withBackground] - 카드 배경색 및 테두리 표시 여부. false일 경우 투명한 배경으로 렌더링됨 (기본값: true)
 * @property {string} [className] - 추가적인 커스텀 Tailwind 클래스
 */
export interface MetricCardProps extends VariantProps<typeof metricCardVariants> {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * Metric Card (통계/지표 카드) 컴포넌트
 * 
 * @description
 * 라벨(Label)과 수치(Value)를 시각적으로 일관되게 보여주는 다목적 UI 박스입니다.
 * 가격, 프리미엄, 수익률 등 프로젝트 전반의 지표 표시에 재사용되며,
 * cva(class-variance-authority)를 통해 5가지 색상 테마(highlight)를 제공합니다.
 */
export function MetricCard({ 
  label, 
  value, 
  highlight = "default", 
  withBackground = true,
  className 
}: MetricCardProps) {
  return (
    <div className={cn(metricCardVariants({ highlight, withBackground }), className)}>
      <p className={labelVariants({ highlight })}>
        {label}
      </p>
      <p className={valueVariants({ highlight })}>
        {value}
      </p>
    </div>
  );
}
