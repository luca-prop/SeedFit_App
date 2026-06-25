import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchedComparisonAsset } from "@/lib/comparisonAssets";

type ComparisonAssetCardProps = {
  asset: MatchedComparisonAsset;
};

function formatKrw(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "업데이트 예정";
  }

  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatCashDelta(value: number) {
  if (value === 0) {
    return "실투자금과 동일";
  }

  return value > 0 ? `${formatKrw(value)} 여유` : `${formatKrw(Math.abs(value))} 부족`;
}

export function ComparisonAssetCard({ asset }: ComparisonAssetCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-slate-950">{asset.apartmentName}</p>
              <Badge className="bg-indigo-100 text-indigo-800">{asset.targetPriceBand}</Badge>
              <Badge variant="secondary">{asset.areaLabel}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">{asset.location}</p>
          </div>
          <Badge className={asset.isWithinBudget ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
            {formatCashDelta(asset.cashDeltaKrw)}
          </Badge>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">실제 최저가</p>
            <p className="mt-1 font-black text-slate-950">{formatKrw(asset.actualPriceKrw)}</p>
            <p className="mt-1 text-[11px] text-slate-500">전고점 {formatKrw(asset.peakPriceKrw)}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3">
            <p className="text-xs text-indigo-700">필요 실투자금</p>
            <p className="mt-1 font-black text-indigo-900">{formatKrw(asset.requiredCashKrw)}</p>
            <p className="mt-1 text-[11px] text-indigo-700/80">매매가 - 적용 대출</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs text-blue-700">적용 대출</p>
            <p className="mt-1 font-black text-blue-900">{formatKrw(asset.appliedLoanKrw)}</p>
            <p className="mt-1 text-[11px] text-blue-700/80">대출 Max {formatKrw(asset.maxLoanKrw)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs text-emerald-700">구역 실투자금 대비</p>
            <p className="mt-1 font-black text-emerald-900">{formatCashDelta(asset.cashDeltaKrw)}</p>
            <p className="mt-1 text-[11px] text-emerald-700/80">구역 최소 실투자금 - 필요 실투자금</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

