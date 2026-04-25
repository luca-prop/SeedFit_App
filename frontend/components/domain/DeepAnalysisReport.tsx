import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * 1:1 비교 대시보드 하단에 렌더링되는 심층 분석 리포트의 데이터 원본
 * @description
 * 항목이 추가/변경될 경우 이 배열의 데이터만 수정하면 테이블 UI에 즉각 반영됩니다.
 */
const REPORT_DATA = [
  {
    step: 1,
    title: "투자 구조 비교",
    rows: [
      { label: "매매가", redev: "4.5억", apt: "9.2억" },
      { label: "실투자금 (현금)", redev: "2.8억", apt: "3.5억", highlight: true },
      { label: "전세금/대출 가능액 (LTV)", redev: "1.5억", apt: "5.4억" },
      { label: "취득세 및 부대비용", redev: "0.2억", apt: "0.3억" },
    ]
  },
  {
    step: 2,
    title: "미래 가치 분석",
    rows: [
      { label: "준공 후 예상 시세", redev: "15억", apt: "12억 (10년 후)" },
      { label: "잠재 수익금", redev: "10.5억", apt: "2.8억", highlight: true },
      { label: "연평균 수익률", redev: "18.5%", apt: "3.2%" },
    ]
  }
];

/**
 * 심층 분석 리포트 (Deep Analysis Report) — Unified 3-Column Table
 * 
 * @description
 * 재개발 구역과 기축 아파트의 투자 구조 및 미래 가치를 상세하게 테이블 형태로 비교합니다.
 * 하드코딩된 HTML 반복을 줄이고, `REPORT_DATA` 배열을 순회하며 동적으로 렌더링(Data-Driven)합니다.
 * 부모 페이지에서 "리포트 보기" 버튼을 클릭했을 때 조건부로 렌더링되며 fade-in 애니메이션을 동반합니다.
 * 
 * @responsive
 * - 모바일/데스크톱 모두 3열 테이블(구분, 재개발, 기축) 구조 유지 (가독성 향상 목적).
 * - 모바일 뷰포트에서 내용이 잘리지 않도록 overflow-x-auto 및 폰트 사이즈(text-xs) 최적화.
 */
export function DeepAnalysisReport() {
  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">심층 분석 리포트</h2>
        <p className="text-sm md:text-base text-gray-500">투자 구조, 미래 가치를 상세히 비교합니다.</p>
      </div>
      
      <div className="space-y-8 md:space-y-10">
        {REPORT_DATA.map((section) => (
          <section key={section.step}>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2 text-gray-900">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded text-sm font-bold">
                {section.step}
              </span>
              {section.title}
            </h3>

            {/* 통합 3열 테이블 뷰 (모바일/데스크톱 공통 적용) */}
            <div className="border-t-2 border-gray-900 overflow-x-auto pb-2">
              <Table className="min-w-[320px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    <TableHead className="w-[34%] font-semibold text-gray-600 align-middle text-xs md:text-sm px-2 md:px-4 break-keep">구분</TableHead>
                    <TableHead className="w-[33%] font-semibold text-gray-900 text-center align-middle text-xs md:text-sm px-2 md:px-4 break-keep">재개발 구역</TableHead>
                    <TableHead className="w-[33%] font-semibold text-gray-900 text-center align-middle text-xs md:text-sm px-2 md:px-4 break-keep">기축 아파트 (평균)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.rows.map((row, idx) => (
                    <TableRow key={idx} className={`border-b border-gray-100 ${row.highlight ? "bg-blue-50/40" : ""}`}>
                      <TableCell className="py-3 md:py-4 font-medium text-gray-600 text-xs md:text-sm px-2 md:px-4 break-keep">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-center py-3 md:py-4 font-bold text-gray-900 text-xs md:text-sm px-2 md:px-4 break-keep">
                        {row.redev}
                      </TableCell>
                      <TableCell className="text-center py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm px-2 md:px-4 break-keep">
                        {row.apt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
