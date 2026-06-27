import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { ScreenCard } from "@/components/playboard/ScreenCard";
import { playBoardFlows, playBoardPlanes, playBoardScreens } from "@/lib/playboard/registries";
import { countScreensByStatus, countWorkItemsByStatus, coverageByControlArea, screensForFlow } from "@/lib/playboard/derive";

export default function PlayBoardIndexPage() {
  const screenStatusCounts = countScreensByStatus();
  const workStatusCounts = countWorkItemsByStatus();
  const coverage = coverageByControlArea();

  return (
    <PlayBoardShell
      title="SeedFit PlayBoard"
      description="기획, 구현 상태, 일정, 기술 정책, 디자인 실체를 레지스트리에서 파생해 보여주는 SeedFit 단일 상황판입니다."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>화면 상태</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {screenStatusCounts.map(({ status, count }) => (
              <div key={status.id} className="flex justify-between"><span>{status.label}</span><strong>{count}</strong></div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>작업 상태</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {workStatusCounts.map(({ status, count }) => (
              <div key={status} className="flex justify-between"><span>{status}</span><strong>{count}</strong></div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>제어영역 커버리지</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {coverage.map(({ area, covered }) => (
              <div key={area.id} className="flex justify-between"><span>{area.title}</span><strong>{covered}</strong></div>
            ))}
          </CardContent>
        </Card>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {playBoardPlanes.map((plane) => (
          <Card key={plane.id}>
            <CardHeader><CardTitle>{plane.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{plane.description}</p>
              <p className="mt-3 text-2xl font-black text-slate-950">{playBoardScreens.filter((screen) => screen.plane === plane.id).length}개</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">흐름 진입</h2>
            <p className="mt-1 text-sm text-slate-500">같은 screen id가 scenario, UX flow, mobile flow, spec에서 반복됩니다.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {playBoardFlows.map((flow) => (
            <Card key={flow.id}>
              <CardContent className="p-5">
                <p className="text-xs font-bold text-indigo-600">{flow.kind === "sequence" ? "순차 흐름" : "독립 케이스"}</p>
                <h3 className="mt-1 font-black text-slate-950">{flow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{flow.description}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">화면 {screensForFlow(flow).length}개</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <Link className="rounded-lg bg-indigo-600 px-3 py-2 text-white" href={`/app/playboard/scenario/${flow.id}`}>Scenario</Link>
                  <Link className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700" href={`/app/playboard/ux-flow/${flow.id}`}>Desktop</Link>
                  <Link className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700" href={`/app/playboard/mobile-flow/${flow.id}`}>Mobile</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-black text-slate-950">화면 보드</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {playBoardScreens.map((screen) => (
            <ScreenCard key={`${screen.plane}/${screen.slug}`} screen={screen} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/app/playboard/plan" className="rounded-3xl border border-slate-200 bg-white p-5 font-black text-slate-950">실행 계획 보기</Link>
        <Link href="/app/playboard/implement-summary" className="rounded-3xl border border-slate-200 bg-white p-5 font-black text-slate-950">구현 통계 보기</Link>
      </section>
    </PlayBoardShell>
  );
}

