"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { playBoardControlAreas } from "@/lib/playboard/registries";
import { matrixRows, statusRank } from "@/lib/playboard/derive";
import { ScreenStatusBadge } from "./StatusBadge";

type SortKey = "title" | "status" | "plane" | string;

export function SortableMatrixTable() {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const multiplier = direction === "asc" ? 1 : -1;

    return [...matrixRows()].sort((left, right) => {
      if (sortKey === "status") {
        return (statusRank(left.screen.status) - statusRank(right.screen.status)) * multiplier;
      }
      if (sortKey === "plane") {
        return left.screen.plane.localeCompare(right.screen.plane, "ko") * multiplier;
      }
      const area = playBoardControlAreas.find((candidate) => candidate.id === sortKey);
      if (area) {
        const leftValue = left.screen.engineering.controlAreaNotes[area.id] ? 1 : 0;
        const rightValue = right.screen.engineering.controlAreaNotes[area.id] ? 1 : 0;
        return (leftValue - rightValue || left.screen.title.localeCompare(right.screen.title, "ko")) * multiplier;
      }

      return left.screen.title.localeCompare(right.screen.title, "ko") * multiplier;
    });
  }, [direction, sortKey]);

  function updateSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setDirection("asc");
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">
              <button type="button" onClick={() => updateSort("title")}>화면</button>
            </th>
            <th className="px-4 py-3">
              <button type="button" onClick={() => updateSort("plane")}>평면</button>
            </th>
            <th className="px-4 py-3">
              <button type="button" onClick={() => updateSort("status")}>상태</button>
            </th>
            {playBoardControlAreas.map((area) => (
              <th key={area.id} className="px-4 py-3 text-center">
                <button type="button" onClick={() => updateSort(area.id)}>{area.title}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="px-4 py-3 font-bold text-slate-950">
                <Link href={`/app/playboard/spec/${row.screen.plane}/${row.screen.slug}`} className="hover:text-indigo-700">
                  {row.screen.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{row.screen.plane}</td>
              <td className="px-4 py-3"><ScreenStatusBadge status={row.screen.status} /></td>
              {row.controlAreaNotes.map(({ area, note }) => (
                <td key={area.id} className="px-4 py-3 text-center" title={note ?? "기재 없음"}>
                  <span className={note ? "font-black text-indigo-700" : "text-slate-300"}>{note ? "●" : "·"}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50 text-xs font-bold text-slate-500">
          <tr>
            <td className="px-4 py-3" colSpan={3}>영역별 커버리지</td>
            {playBoardControlAreas.map((area) => (
              <td key={area.id} className="px-4 py-3 text-center">
                {rows.filter((row) => row.screen.engineering.controlAreaNotes[area.id]).length}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

