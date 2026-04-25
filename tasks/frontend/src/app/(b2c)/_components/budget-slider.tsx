"use client";

import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  currentCash: number;
  minRequired: number;
  maxBudget: number;
  onBudgetChange: (value: number) => void;
}

export function BudgetSlider({
  currentCash,
  minRequired,
  maxBudget,
  onBudgetChange,
}: Props) {
  const isInsufficient = currentCash < minRequired;

  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border">
      {isInsufficient && (
        <Alert variant="warning" className="bg-amber-100 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="font-medium">
            현재 예산({formatKRW(currentCash)})으로는 비교 대상 기축 아파트 매수가 어렵습니다. 
            최소 {formatKRW(minRequired)} 이상이 필요합니다.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold">예산 조정</label>
          <span className="text-lg font-bold text-primary">{formatKRW(currentCash)}</span>
        </div>
        
        <Slider
          defaultValue={[currentCash]}
          max={maxBudget}
          min={100000000}
          step={10000000}
          onValueChange={(v) => onBudgetChange(v[0])}
          className="py-4"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatKRW(100000000)}</span>
          <span>{formatKRW(maxBudget)}</span>
        </div>
      </div>
    </div>
  );
}
