import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagramModal } from "@/components/playboard/DiagramModal";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { WorkStatusBadge } from "@/components/playboard/StatusBadge";
import { playBoardWorkItems } from "@/lib/playboard/registries";

export default function PlayBoardPlanPage() {
  const phases = Array.from(new Set(playBoardWorkItems.map((item) => item.phase)));

  return (
    <PlayBoardShell title="실행 계획" description="WorkItem DAG와 단계별 작업 표면입니다. 상태와 의존성은 레지스트리에서 파생됩니다.">
      <div className="mb-5">
        <DiagramModal title="WorkItem DAG">
          <pre className="whitespace-pre-wrap">{playBoardWorkItems.map((item) => `${item.id} <- ${item.dependsOn.join(", ") || "start"}`).join("\n")}</pre>
        </DiagramModal>
      </div>
      <div className="space-y-5">
        {phases.map((phase) => (
          <Card key={phase}>
            <CardHeader><CardTitle>{phase}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {playBoardWorkItems.filter((item) => item.phase === phase).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400">{item.id}</p>
                      <h3 className="font-black text-slate-950">{item.title}</h3>
                    </div>
                    <WorkStatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Depends on: {item.dependsOn.join(", ") || "없음"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.screens.map((screenKey) => {
                      const [plane, slug] = screenKey.split("/");
                      return (
                        <Link key={screenKey} href={`/app/playboard/spec/${plane}/${slug}`} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          {screenKey}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </PlayBoardShell>
  );
}

