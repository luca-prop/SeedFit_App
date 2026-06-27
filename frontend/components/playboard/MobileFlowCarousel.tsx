"use client";

import Link from "next/link";

import type { PlayBoardFlow, PlayBoardScreen } from "@/lib/playboard/types";
import { ScreenPreview } from "./ScreenPreview";

export function MobileFlowCarousel({ flow, screens }: { flow: PlayBoardFlow; screens: PlayBoardScreen[] }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-4 pb-4">
        {screens.map((screen, index) => (
          <div key={`${screen.plane}/${screen.slug}`} className="w-72 shrink-0">
            <div className="rounded-[2rem] border-8 border-slate-900 bg-slate-900 p-2 shadow-xl">
              <ScreenPreview screen={screen} size="mobile" showOpenLink={false} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-2 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400">{flow.kind === "sequence" ? `${index + 1}단계` : "케이스"}</p>
                <p className="font-black text-slate-950">{screen.title}</p>
              </div>
              <Link href={`/app/playboard/spec/${screen.plane}/${screen.slug}`} className="text-xs font-bold text-indigo-700">
                기술 스펙
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

