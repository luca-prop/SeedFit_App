"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function DiagramModal({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        다이어그램 보기
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-12 max-w-4xl rounded-3xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-950">{title}</h2>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
            <div className="overflow-auto rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

