import { getAnalyticsSummary, type AnalyticsSummary } from "@/lib/analytics/summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EVENT_LABELS: Record<string, string> = {
  budget_submitted: "예산 제출",
  results_viewed: "결과 조회",
  zone_detail_opened: "구역 상세",
  include_sub_toggled: "SUB 토글",
  report_viewed: "비교 리포트",
  feedback_submitted: "피드백 제출",
};

function label(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType;
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </div>
  );
}

export default async function AnalyticsPage() {
  let summary: AnalyticsSummary | null = null;
  let error: string | null = null;
  try {
    summary = await getAnalyticsSummary();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="text-lg font-black">행동 로그 집계를 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm">DB 연결 또는 `behavior_events` 테이블을 확인해 주세요.</p>
        {error ? <pre className="mt-3 overflow-x-auto rounded-xl bg-white/70 p-3 text-xs">{error}</pre> : null}
      </div>
    );
  }

  const maxTypeCount = Math.max(1, ...summary.byType.map((row) => row.count));
  const maxDaily = Math.max(1, ...summary.daily.map((row) => row.count));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900">행동 로그 집계</h1>
          <p className="mt-1 text-sm text-slate-500">
            익명 방문자 기준. 로그인 도입 전까지 `visitor_id`(쿠키)로 사람을 묶습니다.
          </p>
        </div>
        <p className="text-xs text-slate-400">기준 {formatDateTime(new Date(summary.generatedAt))}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="총 이벤트" value={summary.totalEvents.toLocaleString()} />
        <StatCard title="순 방문자" value={summary.uniqueVisitors.toLocaleString()} />
        <StatCard title="최근 7일 이벤트" value={summary.events7d.toLocaleString()} />
        <StatCard title="최근 7일 방문자" value={summary.visitors7d.toLocaleString()} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">이벤트 종류별</h2>
        <div className="mt-4 space-y-3">
          {summary.byType.map((row) => (
            <div key={row.eventType} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-semibold text-slate-700">{label(row.eventType)}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  style={{ width: `${(row.count / maxTypeCount) * 100}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-bold text-slate-900">
                {row.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">최근 14일 일별 이벤트</h2>
        {summary.daily.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">데이터가 아직 없습니다.</p>
        ) : (
          <div className="mt-4 flex items-end gap-1.5" style={{ height: 120 }}>
            {summary.daily.map((row) => (
              <div key={row.day} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-indigo-500/80"
                  style={{ height: `${Math.max(4, (row.count / maxDaily) * 100)}%` }}
                  title={`${row.day}: ${row.count}`}
                />
                <span className="text-[10px] text-slate-400">{row.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">가장 많이 열린 구역</h2>
        {summary.topZones.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">구역 이벤트가 아직 없습니다.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="py-2">구역</th>
                <th className="py-2">행정구</th>
                <th className="py-2 text-right">조회 수</th>
              </tr>
            </thead>
            <tbody>
              {summary.topZones.map((zone) => (
                <tr key={zone.zoneId} className="border-b border-slate-100">
                  <td className="py-2 font-semibold text-slate-800">{zone.zoneName ?? zone.zoneId.slice(0, 8)}</td>
                  <td className="py-2 text-slate-500">{zone.district ?? "-"}</td>
                  <td className="py-2 text-right font-bold text-slate-900">{zone.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">최근 이벤트</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="py-2">시각</th>
                <th className="py-2">이벤트</th>
                <th className="py-2">방문자</th>
                <th className="py-2">경로</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent.map((event, index) => (
                <tr key={`${event.visitorShort}-${index}`} className="border-b border-slate-100">
                  <td className="whitespace-nowrap py-2 text-slate-500">{formatDateTime(event.createdAt)}</td>
                  <td className="py-2 font-semibold text-slate-800">{label(event.eventType)}</td>
                  <td className="py-2 font-mono text-xs text-slate-400">{event.visitorShort}</td>
                  <td className="max-w-[260px] truncate py-2 font-mono text-xs text-slate-500">{event.path ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
