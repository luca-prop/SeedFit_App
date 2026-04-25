"use client";

import React, { useState } from "react";
import { Users, Home, ShieldCheck, Clock, CreditCard, Plus, Trash2, Download, MoreHorizontal, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { id: "overview", label: "대시보드", icon: LayoutDashboard },
  { id: "ltv", label: "LTV 관리", icon: CreditCard },
  { id: "listings", label: "매물 관리", icon: Home },
  { id: "leads", label: "구독 관리", icon: Users },
];

const STATS = [
  { label: "총 구역 수", value: "128개", icon: Home, color: "text-blue-500" },
  { label: "총 매물 수", value: "1,452건", icon: Home, color: "text-indigo-500" },
  { label: "Verified 비율", value: "42.5%", icon: ShieldCheck, color: "text-green-500" },
  { label: "최근 동기화", value: "2시간 전", icon: Clock, color: "text-orange-500" },
  { label: "Lead 구독 수", value: "8,391명", icon: Users, color: "text-purple-500" },
];

export default function AdminPage() {
  const [activeNav, setActiveNav] = useState("overview");
  const [ltvTiers, setLtvTiers] = useState([
    { id: 1, label: "Tier 1", min: "0", max: "900,000,000", maxLoan: "40%", date: "2024-01-01" },
    { id: 2, label: "Tier 2", min: "900,000,000", max: "1,500,000,000", maxLoan: "30%", date: "2024-01-01" },
    { id: 3, label: "Tier 3", min: "1,500,000,000", max: "99,999,000,000", maxLoan: "20%", date: "2024-01-01" },
  ]);

  const addTier = () => {
    const newId = Math.max(...ltvTiers.map((t) => t.id)) + 1;
    setLtvTiers([...ltvTiers, { id: newId, label: `Tier ${newId}`, min: "", max: "", maxLoan: "0%", date: "" }]);
  };
  const removeTier = (id: number) => setLtvTiers(ltvTiers.filter((t) => t.id !== id));

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col p-3 hidden lg:flex shrink-0">
        <h2 className="text-white text-base font-bold mb-6 px-2 mt-2">Admin Panel</h2>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                activeNav === id ? "bg-slate-700 text-white" : "hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900">시스템 현황 요약</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center text-center">
                <Icon className={`${color} mb-2`} size={24} />
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <h3 className="text-xl font-bold mt-1">{value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* LTV Management */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>LTV 정책 관리 (3-Tier)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  {["Tier 라벨", "가격 하한", "가격 상한", "최대 대출액", "적용일", ""].map((h) => (
                    <TableHead key={h} className="whitespace-nowrap px-4">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ltvTiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="px-4"><Input defaultValue={tier.label} className="w-24 bg-white" /></TableCell>
                    <TableCell className="px-4"><Input defaultValue={tier.min} className="min-w-[130px] bg-white" /></TableCell>
                    <TableCell className="px-4"><Input defaultValue={tier.max} className="min-w-[130px] bg-white" /></TableCell>
                    <TableCell className="px-4"><Input defaultValue={tier.maxLoan} className="w-20 bg-white" /></TableCell>
                    <TableCell className="px-4"><Input type="date" defaultValue={tier.date} className="bg-white" /></TableCell>
                    <TableCell className="px-4">
                      <Button variant="ghost" size="icon" onClick={() => removeTier(tier.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between p-4 bg-gray-50 border-t">
              <Button variant="outline" size="sm" onClick={addTier}>
                <Plus className="h-4 w-4 mr-2" /> Tier 추가
              </Button>
              <Button>정책 저장</Button>
            </div>
          </CardContent>
        </Card>

        {/* Property & Lead Management */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Properties */}
          <Card>
            <CardHeader className="border-b"><CardTitle>매물 관리</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {["구역", "유형", "호가", "연락처", "상태", ""].map((h) => (
                      <TableHead key={h} className="px-4">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { zone: "노량진 1구역", type: "다세대", price: "8.5억", contact: "010-1234-5678", status: "ACTIVE" },
                    { zone: "한남 3구역", type: "뚜껑", price: "12.0억", contact: "010-9876-5432", status: "SOLD" },
                  ].map((row) => (
                    <TableRow key={row.zone}>
                      <TableCell className="px-4 font-medium">{row.zone}</TableCell>
                      <TableCell className="px-4">{row.type}</TableCell>
                      <TableCell className="px-4">{row.price}</TableCell>
                      <TableCell className="px-4 font-mono text-xs text-gray-600">{row.contact}</TableCell>
                      <TableCell className="px-4">
                        <Select defaultValue={row.status}>
                          <SelectTrigger className="w-24 h-7 text-xs bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                            <SelectItem value="SOLD">SOLD</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><ShieldCheck className="mr-2 h-4 w-4 text-green-600" />✅ Verified 토글</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />🗑️ 매물 삭제</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Lead 구독 관리</CardTitle>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />CSV 내보내기</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex gap-2 p-4 bg-gray-50 border-b">
                <Input placeholder="최소 예산 (억)" className="w-28 bg-white" />
                <span className="text-gray-400 self-center">~</span>
                <Input placeholder="최대 예산 (억)" className="w-28 bg-white" />
                <Button variant="secondary" size="sm">필터 적용</Button>
              </div>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {["타겟 지역", "예산 범위", "상태", "등록일"].map((h) => (
                      <TableHead key={h} className="px-4">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { region: "동작구, 영등포구", range: "5억 ~ 7억", active: true, date: "2024.04.20" },
                    { region: "용산구", range: "10억 ~ 15억", active: false, date: "2024.04.18" },
                  ].map((row) => (
                    <TableRow key={row.region}>
                      <TableCell className="px-4 font-medium text-sm">{row.region}</TableCell>
                      <TableCell className="px-4 text-sm">{row.range}</TableCell>
                      <TableCell className="px-4">
                        <Badge className={row.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                          {row.active ? "활성" : "중지"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 text-sm text-gray-500">{row.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
