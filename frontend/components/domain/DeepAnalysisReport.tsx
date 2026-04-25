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
 * 심층 분석 리포트 (Deep Analysis Report) — Mobile-First
 * 
 * @description
 * 재개발 구역과 기축 아파트의 투자 구조 및 미래 가치를 상세하게 테이블 형태로 비교합니다.
 * 하드코딩된 HTML 반복을 줄이고, `REPORT_DATA` 배열을 순회하며 동적으로 렌더링(Data-Driven)합니다.
 * 부모 페이지에서 "리포트 보기" 버튼을 클릭했을 때 조건부로 렌더링되며 fade-in 애니메이션을 동반합니다.
 * 
 * @mobile_first
 * - 모바일: 테이블을 가로 스크롤 가능한 래퍼로 감싸 잘림 방지
 * - 모바일 카드형 대체 뷰: 각 행을 독립된 카드로 표시하여 가독성 확보
 * - md+: 기존 3열 테이블 레이아웃 유지
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

            {/* 모바일 카드형 뷰 — md 미만 */}
            <div className="md:hidden space-y-3">
              {section.rows.map((row, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-xl border p-4 ${row.highlight ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-100"}`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${row.highlight ? "text-blue-600" : "text-gray-500"}`}>
                    {row.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">재개발 구역</p>
                      <p className={`text-lg font-bold ${row.highlight ? "text-blue-700" : "text-gray-900"}`}>{row.redev}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5">기축 아파트</p>
                      <p className="text-lg font-bold text-gray-900">{row.apt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크톱 테이블 뷰 — md 이상 */}
            <div className="hidden md:block border-t-2 border-gray-900">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-200">
                    <TableHead className="w-1/3 font-semibold text-gray-600 align-middle">구분</TableHead>
                    <TableHead className="w-1/3 font-semibold text-gray-900 text-center align-middle">재개발 구역</TableHead>
                    <TableHead className="w-1/3 font-semibold text-gray-900 text-center align-middle">기축 아파트 (평균)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.rows.map((row, idx) => (
                    <TableRow key={idx} className={`border-b border-gray-100 ${row.highlight ? "bg-gray-50/50" : ""}`}>
                      <TableCell className={`py-4 ${row.highlight ? "font-medium text-gray-900" : "font-medium text-gray-600"}`}>
                        {row.label}
                      </TableCell>
                      <TableCell className={`text-center py-4 ${row.highlight ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
                        {row.redev}
                      </TableCell>
                      <TableCell className={`text-center py-4 ${row.highlight ? "font-semibold text-gray-900" : "font-semibold text-gray-900"}`}>
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
