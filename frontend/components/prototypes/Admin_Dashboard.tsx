"use client";

import React, { useState } from "react";
import { Users, Home, ShieldCheck, Clock, CreditCard, Plus, Trash2, Download, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const [ltvTiers, setLtvTiers] = useState([
    { id: 1, label: "Tier 1", min: "0", max: "900,000,000", maxLoan: "40%", date: "2024-01-01" },
    { id: 2, label: "Tier 2", min: "900,000,000", max: "1,500,000,000", maxLoan: "30%", date: "2024-01-01" },
    { id: 3, label: "Tier 3", min: "1,500,000,000", max: "99,999,000,000", maxLoan: "20%", date: "2024-01-01" },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-sm md:text-base">
      {/* Sidebar Mock */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col p-4 hidden lg:flex shrink-0">
        <h2 className="text-white text-xl font-bold mb-8 px-2 mt-4">Admin Panel</h2>
        <nav className="space-y-2 flex-grow">
          <div className="bg-slate-800 text-white p-3 rounded-lg flex items-center gap-3 font-medium"><Home size={18} /> 대시보드</div>
          <div className="p-3 rounded-lg flex items-center gap-3 hover:bg-slate-800 cursor-pointer transition-colors"><CreditCard size={18} /> LTV 관리</div>
          <div className="p-3 rounded-lg flex items-center gap-3 hover:bg-slate-800 cursor-pointer transition-colors"><Home size={18} /> 매물 관리</div>
          <div className="p-3 rounded-lg flex items-center gap-3 hover:bg-slate-800 cursor-pointer transition-colors"><Users size={18} /> 구독 관리</div>
        </nav>
      </div>

      <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">시스템 현황 요약</h1>
        
        {/* 1. Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Home className="text-blue-500 mb-3" size={28} />
              <p className="text-xs md:text-sm text-gray-500 font-medium">총 구역 수</p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">128개</h3>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Home className="text-indigo-500 mb-3" size={28} />
              <p className="text-xs md:text-sm text-gray-500 font-medium">총 매물 수</p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">1,452건</h3>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="text-green-500 mb-3" size={28} />
              <p className="text-xs md:text-sm text-gray-500 font-medium">Verified 비율</p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">42.5%</h3>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Clock className="text-orange-500 mb-3" size={28} />
              <p className="text-xs md:text-sm text-gray-500 font-medium">최근 동기화</p>
              <h3 className="text-lg md:text-xl font-bold mt-1">2시간 전</h3>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow col-span-2 md:col-span-1 xl:col-span-1">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Users className="text-purple-500 mb-3" size={28} />
              <p className="text-xs md:text-sm text-gray-500 font-medium">Lead 구독 수</p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">8,391명</h3>
            </CardContent>
          </Card>
        </div>

        {/* 2. LTV Management */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle>LTV 정책 관리 (3-Tier)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap px-4">Tier 라벨</TableHead>
                  <TableHead className="whitespace-nowrap px-4">가격 하한</TableHead>
                  <TableHead className="whitespace-nowrap px-4">가격 상한</TableHead>
                  <TableHead className="whitespace-nowrap px-4">최대 대출액</TableHead>
                  <TableHead className="whitespace-nowrap px-4">적용일</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ltvTiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="px-4 py-3"><Input defaultValue={tier.label} className="w-24 bg-white" /></TableCell>
                    <TableCell className="px-4 py-3"><Input defaultValue={tier.min} className="min-w-[120px] bg-white" /></TableCell>
                    <TableCell className="px-4 py-3"><Input defaultValue={tier.max} className="min-w-[120px] bg-white" /></TableCell>
                    <TableCell className="px-4 py-3"><Input defaultValue={tier.maxLoan} className="w-20 bg-white" /></TableCell>
                    <TableCell className="px-4 py-3"><Input type="date" defaultValue={tier.date} className="bg-white" /></TableCell>
                    <TableCell className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={18} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between p-4 bg-gray-50/50 border-t">
              <Button variant="outline" size="sm" className="bg-white"><Plus size={16} className="mr-2" /> Tier 추가</Button>
              <Button>정책 저장</Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Property Management & 4. Lead Subs */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle>매물 관리</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="px-4">구역</TableHead>
                    <TableHead className="px-4">유형</TableHead>
                    <TableHead className="px-4">호가</TableHead>
                    <TableHead className="px-4">연락처</TableHead>
                    <TableHead className="px-4">상태</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-4 py-3 font-medium">노량진 1구역</TableCell>
                    <TableCell className="px-4 py-3">다세대</TableCell>
                    <TableCell className="px-4 py-3 text-right">8.5억</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-gray-600">010-1234-5678</TableCell>
                    <TableCell className="px-4 py-3">
                      <Select defaultValue="ACTIVE">
                        <SelectTrigger className="w-24 h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="ACTIVE">ACTIVE</SelectItem><SelectItem value="SOLD">SOLD</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hover:bg-gray-100"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> ✅ Verified 토글</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> 🗑️ 매물 삭제</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-4 py-3 font-medium">한남 3구역</TableCell>
                    <TableCell className="px-4 py-3">뚜껑</TableCell>
                    <TableCell className="px-4 py-3 text-right">12.0억</TableCell>
                    <TableCell className="px-4 py-3 font-mono text-gray-600">010-9876-5432</TableCell>
                    <TableCell className="px-4 py-3">
                      <Select defaultValue="SOLD">
                        <SelectTrigger className="w-24 h-8 text-xs bg-white text-gray-500"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="ACTIVE">ACTIVE</SelectItem><SelectItem value="SOLD">SOLD</SelectItem></SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hover:bg-gray-100"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> ✅ Verified 토글</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> 🗑️ 매물 삭제</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardHeader className="bg-white border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Lead 구독 관리</CardTitle>
                <Button variant="outline" size="sm" className="bg-white"><Download size={14} className="mr-2" /> CSV 내보내기</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <Input placeholder="최소 예산 (억)" className="w-28 bg-white" />
                  <span className="text-gray-500">~</span>
                  <Input placeholder="최대 예산 (억)" className="w-28 bg-white" />
                </div>
                <Button variant="secondary" className="bg-white hover:bg-gray-100 border shadow-sm">필터 적용</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="px-4">타겟 지역</TableHead>
                      <TableHead className="px-4">예산 범위</TableHead>
                      <TableHead className="px-4">상태</TableHead>
                      <TableHead className="px-4">등록일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium">동작구, 영등포구</TableCell>
                      <TableCell className="px-4 py-3">5억 ~ 7억</TableCell>
                      <TableCell className="px-4 py-3"><Badge className="bg-green-100 text-green-800 hover:bg-green-200">활성</Badge></TableCell>
                      <TableCell className="px-4 py-3 text-gray-500">2024.04.20</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="px-4 py-3 font-medium">용산구</TableCell>
                      <TableCell className="px-4 py-3">10억 ~ 15억</TableCell>
                      <TableCell className="px-4 py-3"><Badge variant="secondary" className="bg-gray-100 text-gray-600">중지</Badge></TableCell>
                      <TableCell className="px-4 py-3 text-gray-500">2024.04.18</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
