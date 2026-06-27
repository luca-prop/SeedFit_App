import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { ScreenPreview } from "@/components/playboard/ScreenPreview";
import { getFlow, screensForFlow } from "@/lib/playboard/derive";

type UxFlowPageProps = {
  params: Promise<{ flow: string }>;
};

export default async function PlayBoardUxFlowPage({ params }: UxFlowPageProps) {
  const { flow: flowId } = await params;
  const flow = getFlow(flowId);

  if (!flow) notFound();

  const screens = screensForFlow(flow);

  return (
    <PlayBoardShell title={`데스크톱 UX 오버뷰 — ${flow.title}`} description={flow.description}>
      <div className="space-y-5">
        {screens.map((screen, index) => (
          <Card key={`${screen.plane}/${screen.slug}`}>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-indigo-600">{flow.kind === "sequence" ? `${index + 1}단계` : "예외 케이스"}</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{screen.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{screen.flowNote} · 실 라우트 {screen.route}</p>
              <div className="mt-4">
                <ScreenPreview screen={screen} size="desktop" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlayBoardShell>
  );
}

