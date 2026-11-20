"use client";

import { AlertCircle, CalendarDays, FileText } from "lucide-react";

import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";
import { useZoneAsOf } from "@/components/domain/zoneAsOf";

type DataDisclosureNoticeProps = {
  className?: string;
  zoneAsOf?: string;
  usingFallbackFile?: boolean;
};

export function DataDisclosureNotice({
  className = "",
  zoneAsOf,
  usingFallbackFile,
}: DataDisclosureNoticeProps) {
  const reported = useZoneAsOf();
  const date = zoneAsOf ?? reported?.date;
  const usingFallback = usingFallbackFile ?? reported?.fallback ?? false;
  const zoneBasis = date
    ? `구역 큐레이션 기준일: ${date}`
    : "구역 큐레이션 기준일: 이 화면에서 조회한 날짜";

  return (
    <section
      aria-label="데이터 기준일 및 면책 문구"
      className={`rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="font-bold text-slate-800">데이터 기준 및 면책</p>
            <p className="mt-1">{MVP_DATA_DISCLOSURE.disclaimer}</p>
            {usingFallback && date ? (
              <p className="mt-1 font-bold text-amber-800">지금 {date} 예비 파일을 보고 있습니다.</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 md:min-w-[24rem]">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {zoneBasis} · {MVP_DATA_DISCLOSURE.referencePriceBasis}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {MVP_DATA_DISCLOSURE.sourceFileBasis}. {MVP_DATA_DISCLOSURE.sourceReviewBasis}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
