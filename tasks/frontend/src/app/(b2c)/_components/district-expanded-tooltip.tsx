import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface Props {
  districtExpanded: boolean;
  originalDistrict: string;
  matchedDistrict: string;
}

export function DistrictExpandedTooltip({ 
  districtExpanded, 
  originalDistrict,
  matchedDistrict 
}: Props) {
  if (!districtExpanded) return null;

  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="font-medium">
        ℹ️ {originalDistrict} 내 비교 데이터가 부족하여, 인접 행정구({matchedDistrict}) 기준으로 산정되었습니다.
      </AlertDescription>
    </Alert>
  );
}
