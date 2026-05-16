export default function AdminLtvPolicyPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">LTV / DSR 정책 관리</h2>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors">
          변경사항 저장
        </button>
      </div>
      
      <p className="text-neutral-600 mb-8">
        전역 대출 정책을 관리합니다. 이 설정은 시스템 전반의 역산 엔진 결과에 즉각적인 영향을 미칩니다. (ADR-03 적용)
      </p>
      
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-100 flex items-center justify-center min-h-[300px] text-neutral-400">
        정책 파라미터 입력 테이블 (Placeholder)
      </div>
    </div>
  )
}
