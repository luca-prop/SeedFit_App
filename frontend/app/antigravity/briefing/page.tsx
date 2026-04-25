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
  contact: z.string(),
  dongho: z.string(),
});

export default function B2BRegistrationBriefing() {
  const [mode, setMode] = useState<"form" | "briefing">("form");
  const [isInvalidPasscode, setIsInvalidPasscode] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone: "", type: "", price: "", premium: "", rightsPrice: "", contact: "", dongho: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Simulate server validation error
    if (Number(values.price.replace(/,/g, "")) > 5000000000) {
      setServerError("정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.");
      return;
    }
    setServerError("");
    alert("등록 성공!");
  };

  const formatCurrency = (val: string) => val.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex gap-4 mb-8 border-b pb-4">
        <Button variant={mode === "form" ? "default" : "outline"} onClick={() => setMode("form")}>
          매물 등록 폼
        </Button>
        <Button variant={mode === "briefing" ? "default" : "outline"} onClick={() => setMode("briefing")} className={mode === "briefing" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}>
          <Mic className="w-4 h-4 mr-2" /> 고객 브리핑 모드
        </Button>
      </div>

      {mode === "form" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>신규 매물 등록 (B2B)</CardTitle>
                <CardDescription>공인중개사 전용 매물 등록 시스템입니다.</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setIsInvalidPasscode(!isInvalidPasscode)}>
                패스코드 에러 토글
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isInvalidPasscode && (
              <Alert variant="destructive" className="mb-6">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>접근 제한</AlertTitle>
                <AlertDescription>유효하지 않은 접근 코드입니다.</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>구역 선택</FormLabel>
                        <Select disabled={isInvalidPasscode} onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="구역 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="zone1">노량진 1구역</SelectItem>
                            <SelectItem value="zone2">한남 3구역</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>매물 유형</FormLabel>
                        <Select disabled={isInvalidPasscode} onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="뚜껑">뚜껑</SelectItem>
                            <SelectItem value="다세대">다세대</SelectItem>
                            <SelectItem value="빌라">빌라</SelectItem>
                            <SelectItem value="기타">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>호가</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              disabled={isInvalidPasscode}
                              {...field}
                              onChange={(e) => field.onChange(formatCurrency(e.target.value))}
                              className={serverError ? "border-red-500 pr-8" : "pr-8"}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">원</span>
                          </div>
                        </FormControl>
                        {serverError && <p className="text-sm font-medium text-destructive mt-2">{serverError}</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="premium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>프리미엄</FormLabel>
                        <FormControl>
                          <Input disabled={isInvalidPasscode} {...field} onChange={(e) => field.onChange(formatCurrency(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>소유주 연락처</FormLabel>
                        <FormControl>
                          <Input disabled={isInvalidPasscode} placeholder="010-0000-0000" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dongho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>동/호수</FormLabel>
                        <FormControl>
                          <Input disabled={isInvalidPasscode} placeholder="101동 202호" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isInvalidPasscode} className="w-full">매물 등록하기</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {mode === "briefing" && (
        <div className="bg-gray-50 min-h-[600px] p-6 rounded-xl border-2 border-indigo-100 relative">
          <div className="absolute top-4 right-4">
            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm font-medium shadow-sm">
              🎤 고객 브리핑 모드
            </Badge>
          </div>

          <h2 className="text-3xl font-bold mb-8 mt-4 text-gray-900">노량진 1구역 다세대 (급매)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">매물 기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">호가</span>
                  <span className="font-bold text-xl">8억 5,000만 원</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">예상 프리미엄</span>
                  <span className="font-bold text-lg text-primary">3억 2,000만 원</span>
                </div>
                {/* Masked Info */}
                <div className="flex justify-between text-sm pt-2 bg-gray-100 p-2 rounded items-center mt-4">
                  <span className="text-gray-500 flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/> 보안 정보</span>
                  <span className="font-mono text-gray-400 font-bold">010-****-5678 | ***-****</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg text-indigo-900">투자 시뮬레이션 (마스킹 해제됨)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">총 투자 예상액</span>
                    <span className="font-bold text-lg">11억 7,000만 원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">예상 입주권 가치</span>
                    <span className="font-bold text-indigo-600 text-xl">16억 5,000만 원</span>
                  </div>
                  <div className="h-32 bg-indigo-100 rounded-lg mt-6 flex items-end p-2 gap-2 overflow-hidden">
                    <div className="bg-indigo-300 w-1/3 h-1/2 rounded-t transition-all hover:opacity-80 flex items-center justify-center text-xs font-bold text-indigo-900">현재</div>
                    <div className="bg-indigo-400 w-1/3 h-3/4 rounded-t transition-all hover:opacity-80 flex items-center justify-center text-xs font-bold text-white">입주 시</div>
                    <div className="bg-indigo-600 w-1/3 h-full rounded-t transition-all hover:opacity-80 flex items-center justify-center text-xs font-bold text-white">5년 후</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
