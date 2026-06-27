import { notFound } from "next/navigation";

import { MobileFlowCarousel } from "@/components/playboard/MobileFlowCarousel";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { getFlow, screensForFlow } from "@/lib/playboard/derive";

type MobileFlowPageProps = {
  params: Promise<{ flow: string }>;
};

export default async function PlayBoardMobileFlowPage({ params }: MobileFlowPageProps) {
  const { flow: flowId } = await params;
  const flow = getFlow(flowId);

  if (!flow) notFound();

  return (
    <PlayBoardShell title={`모바일 UX 오버뷰 — ${flow.title}`} description={flow.description}>
      <MobileFlowCarousel flow={flow} screens={screensForFlow(flow)} />
    </PlayBoardShell>
  );
}

