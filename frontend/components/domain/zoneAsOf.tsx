"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

type ZoneAsOfValue = {
  date: string;
  fallback: boolean;
};

const ZoneAsOfValueContext = createContext<ZoneAsOfValue | null>(null);
const ZoneAsOfSetterContext = createContext<(value: ZoneAsOfValue | null) => void>(() => {});

export function ZoneAsOfProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<ZoneAsOfValue | null>(null);

  return (
    <ZoneAsOfSetterContext.Provider value={setValue}>
      <ZoneAsOfValueContext.Provider value={value}>{children}</ZoneAsOfValueContext.Provider>
    </ZoneAsOfSetterContext.Provider>
  );
}

export function useZoneAsOf() {
  return useContext(ZoneAsOfValueContext);
}

export function SetZoneAsOf({ date, fallback = false }: { date: string; fallback?: boolean }) {
  const setValue = useContext(ZoneAsOfSetterContext);

  useLayoutEffect(() => {
    setValue({ date, fallback });
    return () => setValue(null);
  }, [setValue, date, fallback]);

  return null;
}

export function FallbackDataBanner({ date }: { date: string }) {
  const [year, month, day] = date.split("-");
  const label = year && month && day ? `${year}년 ${Number(month)}월 ${Number(day)}일` : date;

  return (
    <div
      role="status"
      className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950"
    >
      지금 {label} 예비 파일을 보고 있습니다. 데이터베이스에 연결되지 않아, 이 화면 숫자는 그 파일 기준입니다.
    </div>
  );
}
