import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateReferenceAssumedLoanKrw,
  calculateReferenceCashGapKrw,
  calculateReferenceRequiredCashKrw,
} from "@/lib/referenceApartmentCash";

type ReferenceApartmentComparisonCardProps = {
  apartmentName: string;
  currentPriceKrw: number | null;
  isPresale: boolean;
  reason: string | null;
  zoneInvestmentMinKrw: number | null;
  zoneInvestmentMaxKrw: number | null;
};

function formatKrw(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "업데이트 예정";
  }

  const eok = value / 100_000_000;

  return Number.isInteger(eok) ? `${eok}억` : `${eok.toFixed(1)}억`;
}

function formatKrwRange(minKrw: number | null | undefined, maxKrw: number | null | undefined) {
  if (minKrw === null || minKrw === undefined) {
    return "업데이트 예정";
  }
  if (maxKrw === null || maxKrw === undefined || minKrw === maxKrw) {
    return formatKrw(minKrw);
  }

  return `${formatKrw(minKrw)} ~ ${formatKrw(maxKrw)}`;
}

function formatCashGap(referenceRequiredCashKrw: number | null, zoneInvestmentMinKrw: number | null) {
  const difference = calculateReferenceCashGapKrw(referenceRequiredCashKrw, zoneInvestmentMinKrw);

  if (difference === null) {
    return "비교 대기";
  }

  const absolute = formatKrw(Math.abs(difference));

  if (difference === 0) {
    return "동일";
  }

  return difference > 0 ? `기축 필요 현금이 ${absolute} 높음` : `기축 필요 현금이 ${absolute} 낮음`;
}

export function ReferenceApartmentComparisonCard({
  apartmentName,
  currentPriceKrw,
  isPresale,
  reason,
  zoneInvestmentMinKrw,
  zoneInvestmentMaxKrw,
}: ReferenceApartmentComparisonCardProps) {
  const loanKrw = calculateReferenceAssumedLoanKrw(currentPriceKrw);
  const referenceRequiredCashKrw = calculateReferenceRequiredCashKrw(currentPriceKrw);

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

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">현재 기준가</p>
            <p className="mt-1 font-black text-slate-950">{formatKrw(currentPriceKrw)}</p>
            <p className="mt-1 text-[11px] text-slate-500">대출 Max {formatKrw(loanKrw)}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3">
            <p className="text-xs text-indigo-700">기축 필요 현금</p>
            <p className="mt-1 font-black text-indigo-900">{formatKrw(referenceRequiredCashKrw)}</p>
            <p className="mt-1 text-[11px] text-indigo-700/80">기준가 - 대출 Max {formatKrw(loanKrw)}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-xs text-blue-700">구역 실투자금</p>
            <p className="mt-1 font-black text-blue-900">{formatKrwRange(zoneInvestmentMinKrw, zoneInvestmentMaxKrw)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-amber-700">기축 필요 현금 차이</p>
            <p className="mt-1 font-black text-amber-900">
              {formatCashGap(referenceRequiredCashKrw, zoneInvestmentMinKrw)}
            </p>
            <p className="mt-1 text-[11px] text-amber-700/80">기축 필요 현금 - 구역 최소 실투자금</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
