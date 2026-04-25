import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";

/**
 * 기축 아파트(비교 대상 아파트)의 데이터를 정의하는 인터페이스
 * @property id - 아파트 고유 식별자
 * @property name - 아파트 단지명
 * @property aptType - 아파트 평형 타입 (예: "59", "84")
 * @property recentPrice - 최근 실거래가 (문자열 포맷)
 * @property recovery - 전고점 대비 회복률 (%)
 * @property peakPrice - 전고점 가격 (21~22년 기준)
 * @property requiredInvestment - LTV 적용 시 필요 실투자금
 * @property status - 투자 위험도 (good: 안전, warning: 주의, danger: 위험)
 */
export interface AptData {
  id: number;
  name: string;
  aptType?: string;
  recentPrice: string;
  recovery: number;
  peakPrice: string;
  requiredInvestment: string;
  status: "good" | "warning" | "danger";
}

/**
 * 1:1 비교 대시보드 우측에서 기축 아파트의 핵심 정보를 보여주는 카드 컴포넌트
 * 
 * @description
 * 부모 컴포넌트(`ComparisonPage`)로부터 `apt` 데이터를 전달받아
 * 렌더링하며, 사용자가 다른 기축 아파트로 비교 대상을 변경할 수 있는 모달(Dialog)을 포함합니다.
 * 
 * @param {AptData} apt - 표시할 아파트 객체 데이터
 */
export function ComparisonAptCard({ apt }: { apt: AptData }) {
  return (
    <Card className="relative group">
      <CardContent className="p-5">
        {/* 상단 헤더 영역: 아파트명, 최근 거래가 및 변경 버튼 포함 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                {apt.name} 
                {apt.aptType && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {apt.aptType}타입
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">최신 실거래가: {apt.recentPrice}</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm">
                변경
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>비교 아파트 변경</DialogTitle>
                <DialogDescription>비교 대상을 다른 아파트로 변경할 수 있습니다.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="아파트 단지명 검색..." />
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {["상도 더샵 1차", "본동 래미안", "노량진 우성"].map((name) => (
                    <div key={name} className="p-3 hover:bg-gray-50 cursor-pointer text-sm">{name}</div>
                  ))}
                </div>
                <Button className="w-full">적용하기</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-4" />

        {/* 3-column metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard 
            label="전고점 대비 회복률" 
            value={`${apt.recovery}%`} 
            highlight={apt.status === "good" ? "green" : apt.status === "warning" ? "yellow" : "red"}
            withBackground={false}
          />
          <MetricCard 
            label="전고점 (21-22년)" 
            value={apt.peakPrice} 
            withBackground={false}
          />
          <MetricCard 
            label="필요 실투자금 (LTV)" 
            value={apt.requiredInvestment} 
            withBackground={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
