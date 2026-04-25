"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mic, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  zone: z.string().min(1, "구역을 선택해주세요"),
  type: z.string().min(1, "매물 유형을 선택해주세요"),
  price: z.string().min(1, "호가를 입력해주세요"),
  premium: z.string(),
  rightsPrice: z.string(),
  contact: z.string().min(1, "소유주 연락처를 입력해주세요"),
  dongho: z.string().min(1, "동/호수를 입력해주세요"),
});

const formatCurrency = (val: string) =>
  val.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function B2BPage() {
  const [mode, setMode] = useState<"form" | "briefing">("form");
  const [isInvalidPasscode, setIsInvalidPasscode] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { zone: "", type: "", price: "", premium: "", rightsPrice: "", contact: "", dongho: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (Number(values.price.replace(/,/g, "")) > 5000000000) {
      setServerError("정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.");
      return;
    }
    setServerError("");
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">B2B 중개사 센터</h1>
        <p className="text-gray-500 mt-1">매물 등록 및 고객 브리핑 모드를 사용할 수 있습니다.</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-8 border-b pb-4">
        <Button
          variant={mode === "form" ? "default" : "outline"}
          onClick={() => { setMode("form"); setSubmitted(false); }}
        >
          매물 등록 폼
        </Button>
        <Button
          variant={mode === "briefing" ? "default" : "outline"}
          onClick={() => setMode("briefing")}
          className={mode === "briefing" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}
        >
          <Mic className="h-4 w-4 mr-2" />
          고객 브리핑 모드
        </Button>
      </div>

      {/* Registration Form */}
      {mode === "form" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>신규 매물 등록</CardTitle>
                <CardDescription>공인중개사 전용 매물 등록 시스템입니다.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsInvalidPasscode(!isInvalidPasscode)} className="text-xs text-gray-400">
                [Dev] 패스코드 에러 토글
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">매물 등록 완료!</h3>
                <p className="text-gray-500 mb-6">관리자 검토 후 Verified 승인이 진행됩니다.</p>
                <Button onClick={() => { setSubmitted(false); form.reset(); }}>새 매물 등록하기</Button>
              </div>
            ) : (
              <>
                {isInvalidPasscode && (
                  <Alert variant="destructive" className="mb-6">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>접근 제한</AlertTitle>
                    <AlertDescription>유효하지 않은 접근 코드입니다. 관리자에게 문의해 주세요.</AlertDescription>
                  </Alert>
                )}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="zone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>구역 선택 *</FormLabel>
                          <Select disabled={isInvalidPasscode} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="구역 선택" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="zone-1">노량진 1구역</SelectItem>
                              <SelectItem value="zone-2">한남 3구역</SelectItem>
                              <SelectItem value="zone-3">흑석 9구역</SelectItem>
                              <SelectItem value="zone-4">수색 3구역</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>매물 유형 *</FormLabel>
                          <Select disabled={isInvalidPasscode} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="유형 선택" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {["뚜껑", "다세대", "빌라", "상가", "기타"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormLabel>호가 *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input disabled={isInvalidPasscode} {...field} onChange={(e) => field.onChange(formatCurrency(e.target.value))} placeholder="850,000,000" className={`pr-8 ${serverError ? "border-red-500" : ""}`} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
                            </div>
                          </FormControl>
                          {serverError && <p className="text-sm text-red-500 mt-1">{serverError}</p>}
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="premium" render={({ field }) => (
                        <FormItem>
                          <FormLabel>프리미엄</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input disabled={isInvalidPasscode} {...field} onChange={(e) => field.onChange(formatCurrency(e.target.value))} placeholder="320,000,000" className="pr-8" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="contact" render={({ field }) => (
                        <FormItem>
                          <FormLabel>소유주 연락처 *</FormLabel>
                          <FormControl><Input disabled={isInvalidPasscode} placeholder="010-0000-0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dongho" render={({ field }) => (
                        <FormItem>
                          <FormLabel>동/호수 *</FormLabel>
                          <FormControl><Input disabled={isInvalidPasscode} placeholder="101동 202호" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={isInvalidPasscode} className="w-full">매물 등록하기</Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Briefing Mode */}
      {mode === "briefing" && (
        <div className="bg-gray-50 min-h-[500px] p-6 rounded-xl border-2 border-indigo-100 relative">
          <div className="absolute top-4 right-4">
            <Badge className="bg-indigo-600 text-white px-3 py-1 shadow-sm">🎤 고객 브리핑 모드</Badge>
          </div>
          <h2 className="text-2xl font-bold mb-8 mt-2 text-gray-900">노량진 1구역 다세대 (급매)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="bg-white/90">
              <CardHeader><CardTitle className="text-base">매물 기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[["호가", "8억 5,000만 원"], ["예상 프리미엄", "3억 2,000만 원"]].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between bg-gray-100 p-2 rounded items-center mt-3">
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> 보안 정보
                  </span>
                  <span className="font-mono text-gray-400 text-sm">010-****-5678 | ***-****</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader><CardTitle className="text-base text-indigo-900">투자 시뮬레이션</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[["총 투자 예상액", "11억 7,000만 원", false], ["예상 입주권 가치", "16억 5,000만 원", true]].map(([label, value, highlight]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`font-bold text-lg ${highlight ? "text-indigo-600" : ""}`}>{value}</span>
                  </div>
                ))}
                <div className="h-28 bg-indigo-100 rounded-lg mt-4 flex items-end p-2 gap-2">
                  {[["현재", "h-1/2", "bg-indigo-300 text-indigo-900"], ["입주 시", "h-3/4", "bg-indigo-400 text-white"], ["5년 후", "h-full", "bg-indigo-600 text-white"]].map(([label, height, color]) => (
                    <div key={label as string} className={`${color} ${height} w-1/3 rounded-t flex items-center justify-center text-xs font-bold`}>{label}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
