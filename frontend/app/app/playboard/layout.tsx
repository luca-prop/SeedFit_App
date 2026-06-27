import { notFound } from "next/navigation";

import { isPlayBoardEnabled } from "@/lib/playboard/gate";

export default function PlayBoardLayout({ children }: { children: React.ReactNode }) {
  if (!isPlayBoardEnabled()) {
    notFound();
  }

  return children;
}

