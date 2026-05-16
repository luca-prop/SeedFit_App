import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0F1C",
};

export const metadata: Metadata = {
  title: "씨드핏 (Seed Fit) - 예산 맞춤 투자 분석 플랫폼",
  description: "내 가용 현금만 입력하면 진입 가능한 재개발 구역을 3초 이내에 도출하고 기축 아파트와 1:1 비교 분석해드립니다.",
  icons: {
    icon: "/seedfit_logo2_Favicon_navy_backdel.png",
    apple: "/seedfit_logo2_Favicon_navy_backdel.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "씨드핏",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
