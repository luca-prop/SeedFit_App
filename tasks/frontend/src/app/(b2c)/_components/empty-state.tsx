"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchX, BellPlus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <SearchX className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">현재 예산 범위 내 진입 가능한 구역이 없습니다.</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        가용 현금을 높이거나, 예산 내 매물이 새롭게 등록되면 알려드릴까요?
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button className="flex-1 py-6 gap-2 text-lg">
          <BellPlus className="h-5 w-5" />
          예산 내 매물 알림 받기
        </Button>
        <Button variant="outline" asChild className="flex-1 py-6">
          <Link href="/">예산 수정하기</Link>
        </Button>
      </div>
    </div>
  );
}
