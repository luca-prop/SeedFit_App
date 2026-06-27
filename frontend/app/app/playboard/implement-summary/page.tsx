import { PlayBoardShell } from "@/components/playboard/PlayBoardShell";
import { SortableMatrixTable } from "@/components/playboard/SortableMatrixTable";

export default function PlayBoardImplementSummaryPage() {
  return (
    <PlayBoardShell
      title="구현 통계 매트릭스"
      description="각 화면이 어떤 제어영역을 다루는지 `controlAreaNotes` 키 존재 여부만으로 파생합니다."
    >
      <SortableMatrixTable />
    </PlayBoardShell>
  );
}

