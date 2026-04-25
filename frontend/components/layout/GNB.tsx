"use client";

import React, { useState } from "react";
import Link from "next/link";
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
            <div className="relative flex items-center justify-center w-9 h-9 ml-1">
              <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm group-hover:-translate-y-0.5 transition-transform">
                <defs>
                  <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <ellipse cx="16" cy="22" rx="10" ry="3" stroke="#cbd5e1" strokeWidth="1" />
                <ellipse cx="16" cy="22" rx="6" ry="1.8" stroke="#94a3b8" strokeWidth="1" />
                <ellipse cx="16" cy="22" rx="2.5" ry="0.8" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 4 8 Q 14 5 16 17" stroke="url(#arrowGrad)" strokeWidth="6" strokeLinecap="round" />
                <polygon points="11,15.5 21,14 16.5,24" fill="#1d4ed8" stroke="#1d4ed8" strokeWidth="1" strokeLinejoin="round" />
                <text x="11" y="9.5" fontSize="5.5" fontWeight="900" fill="white" transform="rotate(24 11 9.5)" textAnchor="middle" style={{fontFamily: 'Inter, sans-serif'}}>FIT</text>
              </svg>
            </div>
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
