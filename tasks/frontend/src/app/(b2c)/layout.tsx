import React from "react";

export default function B2CLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 px-6 bg-slate-50 text-xs text-muted-foreground text-center">
        <div className="max-w-4xl mx-auto space-y-2">
          <p>
            ⚠️ 본 데이터는 국토부 실거래가 및 동일 행정구 기준 비교이며, 현장 호가와 다를 수 있습니다. 
            투자 판단의 책임은 이용자에게 있습니다.
          </p>
          <p>© 2026 재개발 Navigator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
