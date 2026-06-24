import { AlertCircle, CalendarDays, FileText } from "lucide-react";

import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";

type DataDisclosureNoticeProps = {
  className?: string;
};

export function DataDisclosureNotice({ className = "" }: DataDisclosureNoticeProps) {
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
          </div>
        </div>
        <div className="grid gap-2 md:min-w-[24rem]">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {MVP_DATA_DISCLOSURE.zoneDataBasis} · {MVP_DATA_DISCLOSURE.referencePriceBasis}
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
