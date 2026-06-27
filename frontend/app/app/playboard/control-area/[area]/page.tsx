import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { getControlArea, screensForControlArea } from "@/lib/playboard/derive";

type ControlAreaPageProps = {
  params: Promise<{ area: string }>;
};

export default async function PlayBoardControlAreaPage({ params }: ControlAreaPageProps) {
  const { area: areaId } = await params;
  const area = getControlArea(areaId);

  if (!area) notFound();

  const screens = screensForControlArea(area.id);

  return (
    <PlayBoardShell title={area.title} description={area.summary}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>확정 정책</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {area.policies.map((policy) => (
              <div key={policy.statement}>
                <p className="font-black text-slate-950">{policy.statement}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{policy.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>운영 결정값</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {area.decisions.map((decision) => (
              <div key={decision.name} className="flex justify-between gap-4">
                <span className="text-slate-500">{decision.name}</span>
                <strong className="text-right text-slate-950">{decision.value}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>기준 문서</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {area.standards.map((standard) => (
              <p key={standard.path} className="text-sm text-slate-600">{standard.title}: <code>{standard.path}</code></p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>대응 화면</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {screens.map((screen) => (
              <Link key={`${screen.plane}/${screen.slug}`} href={`/app/playboard/spec/${screen.plane}/${screen.slug}`} className="block text-sm font-bold text-indigo-700">
                {screen.title}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>미해소 갭</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {area.gaps.length > 0 ? area.gaps.map((gap) => <p key={gap} className="text-sm leading-6 text-slate-600">{gap}</p>) : <p className="text-sm text-slate-500">갭 없음</p>}
          </CardContent>
        </Card>
      </div>
    </PlayBoardShell>
  );
}

