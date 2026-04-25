"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, ShieldCheck, LayoutDashboard, AlertCircle, Pin, Target } from "lucide-react";
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
          <div className="relative flex items-center justify-center w-8 h-8 ml-1">
            {/* Target Icon */}
            <Target className="absolute w-8 h-8 text-blue-600 opacity-90 group-hover:scale-105 transition-transform" strokeWidth={2.5} />
            {/* Pushpin */}
            <Pin className="absolute -top-2.5 -right-2 w-6 h-6 text-blue-800 fill-blue-600 rotate-[40deg] drop-shadow-md group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
          </div>
          <span className="font-bold text-xl text-gray-900 hidden sm:block tracking-tight ml-1">씨드핀</span>
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
