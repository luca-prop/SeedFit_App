import CashInputForm from "./_components/cash-input-form";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          내 가용 현금으로 진입 가능한<br />
          <span className="text-primary">재개발 구역</span>은?
        </h1>
        <p className="text-xl text-muted-foreground">
          예산에 딱 맞는 재개발 구역과 기축 아파트를 실시간으로 비교해 드립니다.
        </p>
      </div>
      
      <CashInputForm />
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="p-6 rounded-2xl bg-slate-50 border space-y-2">
          <div className="text-2xl font-bold text-primary">01.</div>
          <h3 className="font-bold">현금 기반 역산</h3>
          <p className="text-sm text-muted-foreground">취득세와 이주비를 고려한 실질 투자금을 산출합니다.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border space-y-2">
          <div className="text-2xl font-bold text-primary">02.</div>
          <h3 className="font-bold">기축 아파트 1:1 대조</h3>
          <p className="text-sm text-muted-foreground">동일 예산으로 살 수 있는 주변 신축/기축 아파트를 매칭합니다.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border space-y-2">
          <div className="text-2xl font-bold text-primary">03.</div>
          <h3 className="font-bold">미래 가치 리포트</h3>
          <p className="text-sm text-muted-foreground">대장 단지 시세 기반의 잠재적 수익률을 분석합니다.</p>
        </div>
      </div>
    </div>
  );
}
