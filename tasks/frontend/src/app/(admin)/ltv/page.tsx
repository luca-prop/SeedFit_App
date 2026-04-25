"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LtvPolicyPage() {
  const [policies, setLtvPolicies] = useState([
    { id: 1, label: "15억 이하", min: 0, max: 1500000000, loan: 600000000, date: "2026-01-01" },
    { id: 2, label: "15억~25억", min: 1500000001, max: 2500000000, loan: 400000000, date: "2026-01-01" },
    { id: 3, label: "25억 초과", min: 2500000001, max: 99999999999, loan: 200000000, date: "2026-01-01" },
  ]);

  const addTier = () => {
    const newId = policies.length + 1;
    setLtvPolicies([...policies, { id: newId, label: `Tier ${newId}`, min: 0, max: 0, loan: 0, date: new Date().toISOString().split('T')[0] }]);
  };

  const removeTier = (id: number) => {
    if (policies.length > 1) {
      setLtvPolicies(policies.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">LTV 정책 관리</h1>
          <p className="text-muted-foreground">정부 정책에 따른 대출 한도를 Tier별로 관리합니다.</p>
        </div>
        <Button className="gap-2" onClick={addTier}>
          <Plus className="h-4 w-4" />
          Tier 추가
        </Button>
      </div>

      <Alert className="bg-slate-900 text-slate-50 border-none">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="font-bold">⚠️ 주의: 실시간 반영</AlertTitle>
        <AlertDescription className="text-slate-400">
          정책 수정 시 모든 B2C 역산 결과와 대시보드에 즉시 반영됩니다. 신중하게 변경하세요.
        </AlertDescription>
      </Alert>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Tier 라벨</TableHead>
              <TableHead>가격 하한 (원)</TableHead>
              <TableHead>가격 상한 (원)</TableHead>
              <TableHead>최대 대출액 (원)</TableHead>
              <TableHead>적용일</TableHead>
              <TableHead className="w-[100px]">동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  <Input defaultValue={policy.label} />
                </TableCell>
                <TableCell>
                  <Input type="number" defaultValue={policy.min} />
                </TableCell>
                <TableCell>
                  <Input type="number" defaultValue={policy.max} />
                </TableCell>
                <TableCell>
                  <Input type="number" defaultValue={policy.loan} />
                </TableCell>
                <TableCell>
                  <Input type="date" defaultValue={policy.date} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeTier(policy.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardContent className="py-6 border-t flex justify-end">
          <Button className="gap-2 px-8 py-6 text-lg font-bold">
            <Save className="h-5 w-5" />
            정책 저장 및 즉시 배포
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
