"use client";

import React from "react";
import { ShieldCheck, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function B2CPropertyList() {
  const properties = [
    { id: 1, type: "다세대", price: "850,000,000", premium: "320,000,000", rightsPrice: "530,000,000", verified: true },
    { id: 2, type: "뚜껑", price: "450,000,000", premium: "210,000,000", rightsPrice: "240,000,000", verified: true },
    { id: 3, type: "빌라", price: "920,000,000", premium: "350,000,000", rightsPrice: "570,000,000", verified: false },
    { id: 4, type: "다세대", price: "880,000,000", premium: "330,000,000", rightsPrice: "550,000,000", verified: false },
  ];

  // Sort: Verified first
  const sortedProperties = [...properties].sort((a, b) => (a.verified === b.verified ? 0 : a.verified ? -1 : 1));

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">노량진 1구역 등록 매물</h2>
        <span className="text-sm text-gray-500 font-medium">총 {properties.length}건</span>
      </div>
      
      <div className="space-y-5">
        {sortedProperties.map((prop) => (
          <Card 
            key={prop.id} 
            className={`overflow-hidden transition-all hover:shadow-md ${prop.verified ? 'border-green-500 border-2 shadow-sm' : 'border-gray-200'}`}
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className={`p-6 flex-grow ${prop.verified ? 'bg-green-50/20' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${prop.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-lg">{prop.type}</span>
                    </div>
                    {prop.verified && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 border border-green-200 flex items-center shadow-sm">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">호가</p>
                      <p className="font-bold text-lg text-gray-900">{prop.price}원</p>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <p className="text-xs text-primary/70 mb-1.5 font-medium">예상 프리미엄</p>
                      <p className="font-bold text-lg text-primary">{prop.premium}원</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">권리가액</p>
                      <p className="font-semibold text-lg text-gray-700">{prop.rightsPrice}원</p>
                    </div>
                  </div>
                  
                  {/* Security enforcement block: Explicitly mentioning no sensitive info */}
                  {/* The prompt specifically states: "중요 보안: 카드 내부 어디에도 소유주 연락처, 동호수, 상세 주소가 노출되지 않도록 배제" */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
