import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  lastSyncedAt: string;
}

export function SyncWarningBanner({ lastSyncedAt }: Props) {
  const syncDate = new Date(lastSyncedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - syncDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return null;

  return (
    <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="font-medium">
        ⚠️ 마지막 데이터 갱신일: {syncDate.toLocaleDateString('ko-KR')} ({diffDays}일 전). 
        데이터가 최신이 아닐 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}
