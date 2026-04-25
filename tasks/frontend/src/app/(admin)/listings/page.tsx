"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, ShieldCheck, ShieldX, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminListingsPage() {
  // Mock data
  const mockListings = [
    { id: "1", zone: "장위 4구역", type: "다세대", price: 450000000, premium: 50000000, isVerified: true, status: "ACTIVE", contact: "010-1234-5678", date: "2026-04-24" },
    { id: "2", zone: "노량진 1구역", type: "뚜껑", price: 380000000, premium: 30000000, isVerified: true, status: "ACTIVE", contact: "010-5678-1234", date: "2026-04-23" },
    { id: "3", zone: "이문 3구역", type: "빌라", price: 520000000, premium: 70000000, isVerified: false, status: "ACTIVE", contact: "010-9999-8888", date: "2026-04-22" },
    { id: "4", zone: "장위 4구역", type: "기타", price: 400000000, premium: 40000000, isVerified: false, status: "SOLD", contact: "010-1111-2222", date: "2026-04-21" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">매물 통합 관리</h1>
          <p className="text-muted-foreground">전체 중개사 등록 매물의 검증 및 노출 상태를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">필터링</Button>
          <Button variant="outline">CSV 내보내기</Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>구역</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>호가</TableHead>
              <TableHead>프리미엄</TableHead>
              <TableHead>검증상태</TableHead>
              <TableHead>판매상태</TableHead>
              <TableHead>소유주 연락처</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockListings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.zone}</TableCell>
                <TableCell>{listing.type}</TableCell>
                <TableCell>{(listing.price / 100000000).toFixed(1)}억</TableCell>
                <TableCell>{(listing.premium / 10000000).toFixed(0)}천</TableCell>
                <TableCell>
                  {listing.isVerified ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{listing.contact}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{listing.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>매물 관리</DropdownMenuLabel>
                      <DropdownMenuItem className="gap-2">
                        <ExternalLink className="h-4 w-4" /> 상세 보기
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-green-600">
                        <ShieldCheck className="h-4 w-4" /> Verified 토글
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> 매물 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
