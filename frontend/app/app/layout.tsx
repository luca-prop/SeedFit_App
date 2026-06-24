import GNB from "@/components/layout/GNB";
import { DataDisclosureNotice } from "@/components/domain/DataDisclosureNotice";

/**
 * App Layout — 기존 서비스 페이지용 레이아웃
 *
 * @description
 * GNB와 Footer를 포함하는 기존 서비스 앱 레이아웃.
 * 랜딩페이지(/)와 분리되어 /app 하위 경로에서만 적용됩니다.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GNB />
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="border-t bg-slate-50 px-4 py-4 md:py-5">
        <div className="container mx-auto max-w-7xl">
          <DataDisclosureNotice />
        </div>
      </footer>
    </>
  );
}
