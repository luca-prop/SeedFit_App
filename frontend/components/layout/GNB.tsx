"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, ShieldCheck, LayoutDashboard, AlertCircle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/b2b", label: "중개사 등록", icon: Building2 },
  { href: "/admin", label: "관리자", icon: LayoutDashboard, badge: "Admin" },
];

export default function GNB() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
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
          <span className="font-bold text-xl text-gray-900 hidden sm:block tracking-tight ml-1">씨드핏</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:block">{label}</span>
                {badge && (
                  <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5 hidden sm:block">
                    {badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
