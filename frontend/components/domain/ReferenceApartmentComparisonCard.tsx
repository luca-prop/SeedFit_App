import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type ReferenceApartmentComparisonCardProps = {
  apartmentName: string;
  currentPriceKrw: bigint | null;
  isPresale: boolean;
  reason: string | null;
  zoneInvestmentMinKrw: bigint | null;
  zoneInvestmentMaxKrw: bigint | null;
};

function formatKrw(value: bigint | null | undefined) {
  if (value === null || value === undefined) {
    return "업데이트 예정";
  }

  const eok = Number(value) / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatKrwRange(minKrw: bigint | null | undefined, maxKrw: bigint | null | undefined) {
  if (minKrw === null || minKrw === undefined) {
    return "업데이트 예정";
  }
  if (maxKrw === null || maxKrw === undefined || minKrw === maxKrw) {
    return formatKrw(minKrw);
  }

  return `${formatKrw(minKrw)} ~ ${formatKrw(maxKrw)}`;
}

function formatDifference(currentPriceKrw: bigint | null, zoneInvestmentMinKrw: bigint | null) {
  if (currentPriceKrw === null || zoneInvestmentMinKrw === null) {
    return "비교 대기";
  }

  const difference = currentPriceKrw - zoneInvestmentMinKrw;
  const absolute = formatKrw(difference < BigInt(0) ? -difference : difference);

  if (difference === BigInt(0)) {
    return "동일";
  }

  return difference > BigInt(0) ? `기축이 ${absolute} 높음` : `기축이 ${absolute} 낮음`;
}

export function ReferenceApartmentComparisonCard({
  apartmentName,
  currentPriceKrw,
  isPresale,
  reason,
  zoneInvestmentMinKrw,
  zoneInvestmentMaxKrw,
}: ReferenceApartmentComparisonCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-slate-950">{apartmentName}</p>
              <Badge className={isPresale ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}>
                {isPresale ? "분양권" : "일반 매매"}
              </Badge>
            </div>
            {reason ? <p className="mt-1 text-xs text-slate-400">{reason}</p> : null}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">현재 기준가</p>
            <p className="mt-1 font-black text-slate-950">{formatKrw(currentPriceKrw)}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs text-blue-700">구역 실투자금</p>
            <p className="mt-1 font-black text-blue-900">{formatKrwRange(zoneInvestmentMinKrw, zoneInvestmentMaxKrw)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-amber-700">실투자금 대비 차이</p>
            <p className="mt-1 font-black text-amber-900">
              {formatDifference(currentPriceKrw, zoneInvestmentMinKrw)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
