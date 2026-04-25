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
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Search, Filter } from "lucide-react";

export default function AdminLeadsPage() {
  // Mock data
  const mockLeads = [
    { id: "1", budget: 300000000, regions: ["성북구", "동대문구"], status: "ACTIVE", date: "2026-04-24 14:20" },
    { id: "2", budget: 500000000, regions: ["동작구"], status: "ACTIVE", date: "2026-04-24 11:05" },
    { id: "3", budget: 150000000, regions: ["강북구", "도봉구"], status: "ACTIVE", date: "2026-04-23 22:15" },
    { id: "4", budget: 1200000000, regions: ["용산구", "성동구"], status: "PAUSED", date: "2026-04-23 18:30" },
  ];

  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">구독 고객 데이터</h1>
          <p className="text-muted-foreground">매칭 매물 출현 시 알림을 신청한 잠재 고객 리스트입니다.</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          CSV 내보내기
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="지역 또는 예산 검색..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">오늘 신규: 12건</Badge>
              <Badge variant="secondary">누적 구독: 856건</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>알림 기준 예산</TableHead>
                <TableHead>관심 지역</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>신청 일시</TableHead>
                <TableHead className="text-right">동작</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-bold text-primary">{formatKRW(lead.budget)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {lead.regions.map((r, i) => (
                        <Badge key={i} variant="outline" className="font-normal">{r}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.status === "ACTIVE" ? "default" : "secondary"}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">상태 변경</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
