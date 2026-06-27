import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { ScreenPreview } from "@/components/playboard/ScreenPreview";
import { ScreenStatusBadge } from "@/components/playboard/StatusBadge";
import { getFlow, screensForFlow } from "@/lib/playboard/derive";

type ScenarioPageProps = {
  params: Promise<{ flow: string }>;
};

export default async function PlayBoardScenarioPage({ params }: ScenarioPageProps) {
  const { flow: flowId } = await params;
  const flow = getFlow(flowId);

  if (!flow) notFound();

  const screens = screensForFlow(flow);

  return (
    <PlayBoardShell title={flow.title} description={flow.description}>
      <div className="space-y-4">
        {screens.map((screen, index) => (
          <Card key={`${screen.plane}/${screen.slug}`}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-2 text-xs font-bold text-slate-500">{flow.kind === "sequence" ? `${index + 1}단계` : "케이스"}</p>
                <ScreenPreview screen={screen} size="scenario" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-black text-slate-950">{screen.title}</h2>
                  <ScreenStatusBadge status={screen.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{screen.flowNote}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-400">Client</p>
                    <p className="mt-1 text-sm text-slate-700">{screen.engineering.clientActions.join(", ") || "없음"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-3">
                    <p className="text-xs font-bold text-slate-400">Server</p>
                    <p className="mt-1 text-sm text-slate-700">{screen.engineering.serverActions.join(", ") || "없음"}</p>
                  </div>
                </div>
                <Link href={`/app/playboard/spec/${screen.plane}/${screen.slug}`} className="mt-4 inline-flex text-sm font-bold text-indigo-700">
                  기술 스펙 상세
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlayBoardShell>
  );
}

