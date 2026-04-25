"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

interface ZoneProps {
  zoneId: string;
  name: string;
  district: string;
  stage: string;
  minInvestment: number;
  maxInvestment: number;
  matchScore: number;
}

export function ZoneResultCard({
  zoneId,
  name,
  district,
  stage,
  minInvestment,
  maxInvestment,
  matchScore,
}: ZoneProps) {
  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  const getStageColor = (stage: string) => {
    if (stage.includes("관리처분")) return "bg-green-100 text-green-700 border-green-200";
    if (stage.includes("사업시행")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <Link href={`/comparison/${zoneId}`}>
      <Card className="group hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {district}
            </Badge>
            <Badge className={getStageColor(stage)}>{stage}</Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">예상 실투자금</p>
              <p className="text-2xl font-bold">
                {formatKRW(minInvestment)} ~ {formatKRW(maxInvestment)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">매칭 적합도</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">{matchScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress value={matchScore} className="h-2" />
          </div>

          <div className="pt-2 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            상세 비교 및 리포트 보기 <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
