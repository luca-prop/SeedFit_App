"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Building2, LayoutDashboard, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/b2b", label: "중개사 등록", icon: Building2 },
  { href: "/admin", label: "관리자", icon: LayoutDashboard, badge: "Admin" },
];

/**
 * Global Navigation Bar — Mobile-First Design
 * 
 * @description
 * 모바일: 상단 로고 + 햄버거 메뉴 (펼치면 풀스크린 오버레이)
 * 태블릿(md) 이상: 기존 수평 내비게이션 유지
 * 모든 터치 타겟은 최소 44px 확보 (WCAG 2.5.5)
 */
export default function GNB() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/seedfit-logo.svg"
              alt="씨드핏 로고"
              width={36}
              height={36}
              className="drop-shadow-sm group-hover:-translate-y-0.5 transition-transform object-contain"
              priority
            />
            <span className="font-bold text-xl text-gray-900 tracking-tight ml-1">씨드핏</span>
          </Link>

          {/* Desktop Nav — md 이상 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {badge && (
                    <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
                      {badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger — md 미만 */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-white/98 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors min-h-[52px]",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                  {badge && (
                    <Badge variant="secondary" className="ml-auto text-xs py-0.5 px-2">
                      {badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
