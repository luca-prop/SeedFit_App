import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings2, 
  Building2, 
  Users, 
  ShieldCheck 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:block">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">대시보드</span>
          </Link>
          <Link href="/ltv" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-primary">
            <Settings2 className="h-5 w-5" />
            <span className="font-medium text-white">LTV 정책 관리</span>
          </Link>
          <Link href="/listings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Building2 className="h-5 w-5" />
            <span className="font-medium">매물 통합 관리</span>
          </Link>
          <Link href="/leads" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="h-5 w-5" />
            <span className="font-medium">구독 고객 데이터</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">System Management Console</h2>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
