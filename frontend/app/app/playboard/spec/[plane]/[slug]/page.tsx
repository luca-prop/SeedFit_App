import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyValueSpec } from "@/components/playboard/KeyValueSpec";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { ScreenStatusBadge } from "@/components/playboard/StatusBadge";
import { getScreen, workItemsForScreen } from "@/lib/playboard/derive";
import { playBoardControlAreas } from "@/lib/playboard/registries";

type SpecPageProps = {
  params: Promise<{ plane: string; slug: string }>;
};

export default async function PlayBoardSpecPage({ params }: SpecPageProps) {
  const { plane, slug } = await params;
  const screen = getScreen(plane, slug);

  if (!screen) notFound();

  const workItems = workItemsForScreen(screen);

  return (
    <PlayBoardShell title={screen.title} description={screen.flowNote}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ScreenStatusBadge status={screen.status} />
        <Link href={`/app/playboard/screens/${screen.plane}/${screen.slug}`} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">
          화면 데모
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>화면 계약</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <KeyValueSpec label="Route" value={screen.route} />
              <KeyValueSpec label="Design type" value={screen.designSpecType} />
              <KeyValueSpec label="Requirement refs" value={screen.requirementRefs} />
              <KeyValueSpec label="Implementation" value={screen.implLocation} />
              <KeyValueSpec label="Status note" value={screen.statusNote} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>연결 작업</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {workItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-400">{item.id}</p>
                <p className="font-black text-slate-950">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.doc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader><CardTitle>엔지니어링 제어</CardTitle></CardHeader>
        <CardContent>
          <dl>
            <KeyValueSpec label="Auth gate" value={screen.engineering.authGate} />
            <KeyValueSpec label="Client actions" value={screen.engineering.clientActions} />
            <KeyValueSpec label="Server actions" value={screen.engineering.serverActions} />
            <KeyValueSpec label="Data reads" value={screen.engineering.dataReads} />
            <KeyValueSpec label="Data writes" value={screen.engineering.dataWrites} />
            <KeyValueSpec label="Telemetry" value={screen.engineering.telemetryEvents} />
            <KeyValueSpec label="Exception states" value={screen.engineering.exceptionStates} />
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader><CardTitle>제어영역 요점</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {playBoardControlAreas.map((area) => {
            const note = screen.engineering.controlAreaNotes[area.id];
            return (
              <div key={area.id} className="rounded-2xl border border-slate-100 p-4">
                <Link href={`/app/playboard/control-area/${area.id}`} className="font-black text-slate-950 hover:text-indigo-700">{area.title}</Link>
                <p className="mt-2 text-sm leading-6 text-slate-600">{note ?? "이 화면에는 아직 해당 제어영역 요점이 없습니다."}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PlayBoardShell>
  );
}

