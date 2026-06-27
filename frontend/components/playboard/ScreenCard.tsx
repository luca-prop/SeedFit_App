import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { screenKey } from "@/lib/playboard/derive";
import type { PlayBoardScreen } from "@/lib/playboard/types";
import { ScreenStatusBadge } from "./StatusBadge";

export function ScreenCard({ screen, compact = false }: { screen: PlayBoardScreen; compact?: boolean }) {
  const key = screenKey(screen);

  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400">{key}</p>
            <h3 className="mt-1 font-black text-slate-950">{screen.title}</h3>
          </div>
          <ScreenStatusBadge status={screen.status} />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{screen.flowNote}</p>
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{screen.route}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <Link href={`/app/playboard/spec/${screen.plane}/${screen.slug}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-white">
            기술 스펙
          </Link>
          <Link href={`/app/playboard/screens/${screen.plane}/${screen.slug}`} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700">
            화면 데모
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

