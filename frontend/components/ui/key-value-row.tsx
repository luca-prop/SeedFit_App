import React from "react";
import { cn } from "@/lib/utils";

/**
 * KeyValueRow 컴포넌트 Props 정의
 * 
 * @property {string} label - 좌측에 회색으로 표시될 라벨 텍스트 (예: "조합원분양가")
 * @property {React.ReactNode} value - 우측에 굵게 표시될 값 (예: "4.5억")
 * @property {"default"|"blue"|"green"|"red"} [valueColor] - 우측 값의 텍스트 색상 테마 (기본값: default)
 * @property {boolean} [isLast] - 리스트의 마지막 항목인지 여부. true일 경우 하단 구분선(border-b)이 제거됨.
 */
export interface KeyValueRowProps {
  label: string;
  value: React.ReactNode;
  valueColor?: "default" | "blue" | "green" | "red";
  isLast?: boolean;
}

/**
 * Key-Value Row (속성-값 나열 행) 컴포넌트
 * 
 * @description
 * 좌측에는 항목의 이름(라벨)을, 우측에는 그에 해당하는 값을 배치하는 전형적인 리스트 행 컴포넌트입니다.
 * 요약 정보 박스 등에서 세로로 항목들을 나열할 때 하단 구분선(border-b)과 함께 재사용됩니다.
 */
export function KeyValueRow({ label, value, valueColor = "default", isLast = false }: KeyValueRowProps) {
  const getColorClass = () => {
    switch (valueColor) {
      case "blue": return "text-blue-600";
      case "green": return "text-emerald-600";
      case "red": return "text-red-600";
      default: return "text-gray-900";
    }
  };

  return (
    <div className={cn("flex justify-between items-center pb-4", !isLast && "border-b")}>
      <span className="text-gray-500">{label}</span>
      <span className={cn("text-xl font-bold", getColorClass())}>{value}</span>
    </div>
  );
}
