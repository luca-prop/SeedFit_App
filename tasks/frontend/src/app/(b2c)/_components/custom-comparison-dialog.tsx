"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, Check } from "lucide-react";

interface Apartment {
  id: string;
  name: string;
  district: string;
  price: number;
}

export function CustomComparisonDialog() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Mock data for searching
  const mockApts: Apartment[] = [
    { id: "a1", name: "래미안 장위 퍼스트하이", district: "성북구", price: 950000000 },
    { id: "a2", name: "꿈의숲 아이파크", district: "성북구", price: 1020000000 },
    { id: "a3", name: "장위 지웰 에스테이트", district: "성북구", price: 680000000 },
    { id: "a4", name: "노량진 드림타운", district: "동작구", price: 1150000000 },
  ];

  const filteredApts = mockApts.filter(apt => 
    apt.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog>
      <DialogTrigger className="inline-flex items-center justify-center rounded-lg border border-border bg-background h-7 px-2.5 text-[0.8rem] font-medium hover:bg-muted transition-colors">
        변경
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>비교 대상 아파트 선택</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="아파트명을 검색하세요..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {filteredApts.map((apt) => (
              <div 
                key={apt.id}
                onClick={() => toggleSelect(apt.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected.includes(apt.id) ? "bg-primary/5 border-primary" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{apt.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.district} · {(apt.price / 100000000).toFixed(1)}억</p>
                  </div>
                </div>
                {selected.includes(apt.id) && <Check className="h-4 w-4 text-primary" />}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full">적용하기 ({selected.length}개 선택됨)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
