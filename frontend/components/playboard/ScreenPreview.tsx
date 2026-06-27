import Link from "next/link";

import { screenKey } from "@/lib/playboard/derive";
import type { PlayBoardScreen } from "@/lib/playboard/types";
import { ScreenStatusBadge } from "./StatusBadge";

type ScreenPreviewSize = "desktop" | "mobile" | "scenario";

type ScreenPreviewProps = {
  screen: PlayBoardScreen;
  size?: ScreenPreviewSize;
  showOpenLink?: boolean;
};

function previewHrefFor(screen: PlayBoardScreen) {
  if (screen.demoStrategy !== "real-route" || !screen.route.startsWith("/") || screen.route.includes("[")) {
    return null;
  }

  if (screen.route === "/app/results") {
    return "/app/results?budgetMin=200000000&budgetMax=500000000";
  }

  return screen.route;
}

function frameClassName(size: ScreenPreviewSize) {
  if (size === "mobile") {
    return "h-[34rem] rounded-[1.35rem]";
  }
  if (size === "scenario") {
    return "h-[24rem] rounded-2xl";
  }
  return "h-[34rem] rounded-3xl";
}

function iframeClassName(size: ScreenPreviewSize) {
  if (size === "mobile") {
    return "h-[50rem] w-[390px] origin-top-left scale-[0.72]";
  }
  return "h-full w-full";
}

export function ScreenPreview({ screen, size = "desktop", showOpenLink = true }: ScreenPreviewProps) {
  const previewHref = previewHrefFor(screen);
  const key = screenKey(screen);
  const isMobile = size === "mobile";

  if (previewHref) {
    return (
      <div className={isMobile ? "space-y-3" : "space-y-3"}>
        <div className={`${frameClassName(size)} overflow-hidden border border-slate-200 bg-white shadow-sm`}>
          <iframe
            title={`${screen.title} 미리보기`}
            src={previewHref}
            className={`${iframeClassName(size)} border-0`}
            loading="lazy"
          />
        </div>
        {showOpenLink ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-500">Live route: {previewHref}</span>
            <Link href={previewHref} className="font-bold text-indigo-700">
              실제 화면 열기
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${frameClassName(size)} overflow-hidden border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-5 shadow-sm`}>
      <div className="flex h-full flex-col justify-between rounded-2xl border border-white/80 bg-white/80 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">{screen.designSpecType}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{screen.title}</h3>
            </div>
            <ScreenStatusBadge status={screen.status} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{screen.flowNote}</p>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold text-slate-400">Screen ID</p>
            <p className="mt-1 font-black">{key}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-slate-400">Route</p>
              <p className="mt-1 truncate">{screen.route}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-slate-400">Demo</p>
              <p className="mt-1">{screen.demoStrategy}</p>
            </div>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            동적 라우트나 문서형 시스템 상태는 실제 URL이 없어서 깨진 iframe 대신 캡처형 mock preview로 표시합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
