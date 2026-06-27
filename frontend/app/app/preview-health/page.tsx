import Link from "next/link";

import { getPreviewHealth } from "@/lib/previewHealth";

export const dynamic = "force-dynamic";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {label}
    </span>
  );
}

export default async function PreviewHealthPage() {
  const health = await getPreviewHealth();
  const counts = health.db.counts;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">MVP-025 Preview Health</p>
            <h1 className="mt-2 text-3xl font-black">Preview 배포 환경 점검</h1>
            <p className="mt-2 text-sm text-slate-600">
              비밀값을 노출하지 않고 Vercel Preview의 환경변수, DB 연결, MVP seed 데이터 상태를 확인합니다.
            </p>
          </div>
          <StatusPill ok={health.ok} label={health.ok ? "READY" : "ACTION REQUIRED"} />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">환경변수 존재 여부</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(health.env).map(([key, present]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="font-mono text-sm text-slate-700">{key}</span>
                <StatusPill ok={present} label={present ? "set" : "missing"} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">DB 및 seed 데이터</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-500">DB 연결</p>
              <p className="mt-1 text-lg font-black">{health.db.ok ? "정상" : "오류"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-500">최신 snapshot 기준일</p>
              <p className="mt-1 text-lg font-black">{health.db.latestSnapshotSourceDate ?? "-"}</p>
            </div>
            {counts ? (
              <>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500">zones</p>
                  <p className="mt-1 text-lg font-black">{counts.zones.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500">zone snapshots</p>
                  <p className="mt-1 text-lg font-black">{counts.zoneInvestmentSnapshots.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500">reference apartments</p>
                  <p className="mt-1 text-lg font-black">{counts.referenceApartments.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold text-slate-500">active LTV policies</p>
                  <p className="mt-1 text-lg font-black">{counts.activeLtvPolicies.toLocaleString()}</p>
                </div>
              </>
            ) : null}
          </div>
          {health.db.error ? (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{health.db.error}</p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">MVP-025 완료 기준</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>Preview URL에서 이 페이지가 READY 상태여야 합니다.</li>
            <li>10~15억 검색 결과에서 Reverse Filter 처리 오류 문구가 없어야 합니다.</li>
            <li>핵심 B2C flow에서 P0 runtime/console 오류가 없어야 합니다.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white" href="/app/results?budgetMin=1000000000&budgetMax=1500000000">
              10~15억 결과 확인
            </Link>
            <Link className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700" href="/api/preview-health">
              JSON health 보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
