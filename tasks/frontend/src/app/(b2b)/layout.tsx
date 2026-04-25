import React from "react";
import { Badge } from "@/components/ui/badge";

export default function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">재개발 Navigator <span className="text-primary">B2B</span></h1>
            <Badge variant="secondary" className="font-medium">중개사 전용</Badge>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
