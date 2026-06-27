import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { ScreenPreview } from "@/components/playboard/ScreenPreview";
import { ScreenStatusBadge } from "@/components/playboard/StatusBadge";
import { getScreen } from "@/lib/playboard/derive";

type ScreenDemoPageProps = {
  params: Promise<{ plane: string; slug: string }>;
};

export default async function PlayBoardScreenDemoPage({ params }: ScreenDemoPageProps) {
  const { plane, slug } = await params;
  const screen = getScreen(plane, slug);

  if (!screen) notFound();

  return (
    <PlayBoardShell title={`화면 데모 — ${screen.title}`} description={screen.flowNote}>
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScreenStatusBadge status={screen.status} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{screen.demoStrategy}</span>
            </div>
            <Link href={`/app/playboard/spec/${screen.plane}/${screen.slug}`} className="text-sm font-bold text-indigo-700">
              기술 스펙
            </Link>
          </div>
          <ScreenPreview screen={screen} size="desktop" />
        </CardContent>
      </Card>
    </PlayBoardShell>
  );
}

