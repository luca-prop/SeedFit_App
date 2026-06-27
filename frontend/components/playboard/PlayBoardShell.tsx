import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/app/playboard", label: "상황판" },
  { href: "/app/playboard/plan", label: "실행계획" },
  { href: "/app/playboard/schedule", label: "일정표" },
  { href: "/app/playboard/implement-summary", label: "구현통계" },
];

export function PlayBoardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <Link href="/app/playboard" className="text-sm font-black text-slate-950">
            SeedFit PlayBoard
          </Link>
          <nav className="flex flex-wrap gap-2 text-xs font-bold">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:text-indigo-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Registry-derived SoT</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

