export default function B2CLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {children}
      </main>
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-xs text-gray-500 leading-relaxed text-center">
            <p className="font-semibold mb-1">[면책 조항]</p>
            <p>본 서비스에서 제공하는 모든 정보 및 계산 결과는 참고용이며, 실제 투자 결과에 대한 법적 책임을 지지 않습니다.</p>
            <p>대출 가능 여부 및 정확한 취득세 등은 금융기관 및 세무 전문가와 상담하시기 바랍니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
