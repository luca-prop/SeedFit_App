import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiagramModal } from "@/components/playboard/DiagramModal";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { WorkStatusBadge } from "@/components/playboard/StatusBadge";
import { deriveWaves } from "@/lib/playboard/derive";

export default function PlayBoardSchedulePage() {
  const waves = deriveWaves();

  return (
    <PlayBoardShell title="일정표" description="완료되지 않은 WorkItem DAG에서 병렬 착수 가능한 Wave를 파생합니다.">
      <div className="mb-5">
        <DiagramModal title="Wave Derivation">
          <pre className="whitespace-pre-wrap">{waves.map((wave) => `${wave.title}: ${wave.workItems.map((item) => item.id).join(", ")}`).join("\n") || "모든 작업이 완료됐습니다."}</pre>
        </DiagramModal>
      </div>
      {waves.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {waves.map((wave) => (
            <Card key={wave.title}>
              <CardHeader>
                <CardTitle>{wave.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500">Level {wave.level}. 차단 선행: {wave.blockedBy.join(", ") || "없음"}</p>
                {wave.workItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400">{item.id}</p>
                        <p className="font-black text-slate-950">{item.title}</p>
                      </div>
                      <WorkStatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-6 text-sm text-slate-500">현재 미완료 작업이 없습니다.</CardContent></Card>
      )}
    </PlayBoardShell>
  );
}

