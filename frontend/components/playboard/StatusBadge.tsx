import { Badge } from "@/components/ui/badge";
import { getStatus } from "@/lib/playboard/derive";
import type { PlayBoardStatusId, PlayBoardWorkStatus } from "@/lib/playboard/types";

const screenTone: Record<PlayBoardStatusId, string> = {
  planned: "bg-slate-100 text-slate-700",
  partial: "bg-amber-100 text-amber-800",
  implemented: "bg-blue-100 text-blue-800",
  verified: "bg-emerald-100 text-emerald-800",
};

const workLabels: Record<PlayBoardWorkStatus, string> = {
  not_started: "미착수",
  in_review: "리뷰대기",
  done: "완료",
};

const workTone: Record<PlayBoardWorkStatus, string> = {
  not_started: "bg-slate-100 text-slate-700",
  in_review: "bg-indigo-100 text-indigo-800",
  done: "bg-emerald-100 text-emerald-800",
};

export function ScreenStatusBadge({ status }: { status: PlayBoardStatusId }) {
  return <Badge className={screenTone[status]}>{getStatus(status)?.label ?? status}</Badge>;
}

export function WorkStatusBadge({ status }: { status: PlayBoardWorkStatus }) {
  return <Badge className={workTone[status]}>{workLabels[status]}</Badge>;
}

