"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MetricCard } from "@/components/ui/metric-card";
import { ZONE_NAMES, MOCK_PROPERTIES } from "@/lib/mockData";

/**
 * 매물 리스트 조회 페이지 (Listings Page)
 * 
 * @description
 * 특정 재개발 구역에 속한 매물들을 리스트 형태로 보여주는 페이지입니다.
 * B2B 중개사가 등록하고 교차검증을 통과한 "Verified" 뱃지 매물이 최상단에 고정 노출됩니다.
 * 
 * @logic
 * - URL Params (`id`): 대상 재개발 구역 ID
 * - 데이터 렌더링 시 `is_verified` 속성을 기준으로 정렬(Sort)하여 렌더링합니다.
 * - 민감한 개인정보(동호수, 소유주 연락처)는 비노출되며, "중개소 연결" 모달을 통해 O2O 연결을 유도합니다.
 */
export default function ListingsPage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id as string;
  const zoneName = ZONE_NAMES[zoneId] ?? "구역";

  const sorted = React.useMemo(() => 
    [...MOCK_PROPERTIES].sort((a, b) => (a.verified === b.verified ? 0 : a.verified ? -1 : 1)), 
  []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/comparison/${zoneId}`)} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          비교 대시보드로 돌아가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{zoneName} 등록 매물</h1>
            <p className="text-sm text-gray-500 mt-1">총 {sorted.length}건 · Verified 매물 우선 노출</p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm py-1">
            <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
            Verified {sorted.filter((p) => p.verified).length}건
          </Badge>
        </div>
      </div>

      {/* Property Cards */}
      <div className="space-y-4">
        {sorted.map((prop) => (
          <Card
            key={prop.id}
            className={`overflow-hidden transition-all hover:shadow-md ${
              prop.verified ? "border-emerald-400 border-2" : "border-gray-200"
            }`}
          >
            <CardContent className="p-0">
              <div className={`p-5 ${prop.verified ? "bg-emerald-50/40" : "bg-white"}`}>
                {/* Top row */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${prop.verified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg">{prop.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {prop.verified && (
                      <>
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1">
                          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                          Verified
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                              중개소 연결
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>매물 담당 중개소 안내</DialogTitle>
                              <DialogDescription>
                                안전하게 검증된 매물을 담당하는 중개소 정보입니다.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-1">씨드핀 전속 파트너 공인중개사</h4>
                                <p className="text-sm text-gray-600 mb-2">대표: 김중개</p>
                                <p className="text-xl font-bold text-blue-600 tracking-tight">010-1234-5678</p>
                              </div>
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base">전화 연결하기</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>
                </div>

                {/* Price Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <MetricCard label="호가" value={`${prop.price}원`} />
                  <MetricCard label="예상 프리미엄" value={`${prop.premium}원`} highlight="blue" />
                  <MetricCard label="권리가액" value={`${prop.rightsPrice}원`} />
                </div>
                {/* Security note: No owner contact, address, or unit info shown (PII protection) */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
