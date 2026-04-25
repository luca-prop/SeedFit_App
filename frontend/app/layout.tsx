import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GNB from "@/components/layout/GNB";
import { AlertCircle } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "재개발Navigator - 내 가용 현금으로 진입 가능한 재개발 구역 탐색",
  description: "예산을 입력하고 진입 가능한 재개발 구역을 찾아보세요. 재개발 투자 분석 플랫폼.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <GNB />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-white py-4 px-4">
          <div className="container mx-auto max-w-7xl flex items-start gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>⚠️ 본 데이터는 국토부 실거래가 및 동일 행정구 기준 비교이며, 현장 호가와 다를 수 있습니다. 투자 판단의 책임은 이용자에게 있습니다.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
