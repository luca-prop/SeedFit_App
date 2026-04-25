"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  zone_id: z.string().min(1, "구역을 선택해주세요"),
  property_type: z.string().min(1, "매물 유형을 선택해주세요"),
  asking_price: z.string().min(1, "호가를 입력해주세요"),
  premium: z.string().min(1, "프리미엄을 입력해주세요"),
  rights_value: z.string().min(1, "권리가액을 입력해주세요"),
  owner_contact: z.string().optional(),
  unit_number: z.string().optional(),
});

export default function ListingForm() {
  const [isPasscodeValid, setIsPasscodeValid] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      zone_id: "",
      property_type: "",
      asking_price: "",
      premium: "",
      rights_value: "",
      owner_contact: "",
      unit_number: "",
    },
  });

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234") { // Mock passcode
      setIsPasscodeValid(true);
      setError(null);
    } else {
      setError("유효하지 않은 접근 코드입니다. 관리자에게 문의하세요.");
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Mock anomaly detection
    const price = Number(values.asking_price.replace(/,/g, ""));
    if (price > 1000000000) {
      form.setError("asking_price", {
        type: "server",
        message: "정상 범위를 벗어난 호가입니다. 오타를 확인해 주세요.",
      });
      return;
    }
    
    console.log(values);
    setSuccess(true);
  };

  if (!isPasscodeValid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>B2B 매물 등록 인증</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <FormLabel>접근 패스코드</FormLabel>
                <Input 
                  type="password" 
                  value={passcode} 
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="패스코드를 입력하세요"
                />
              </div>
              <Button type="submit" className="w-full">인증하기</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="bg-green-100 p-6 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold">매물 등록이 완료되었습니다!</h2>
        <p className="text-muted-foreground">입력하신 매물은 즉시 검증(Verified) 과정을 거쳐 노출됩니다.</p>
        <Button onClick={() => setSuccess(false)}>추가 등록하기</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">새 매물 등록</CardTitle>
          <p className="text-sm text-muted-foreground">정확한 정보를 입력할수록 Verified 뱃지 획득 확률이 높아집니다.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="zone_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대상 구역</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="구역 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="z1">장위뉴타운 4구역</SelectItem>
                          <SelectItem value="z2">노량진뉴타운 1구역</SelectItem>
                          <SelectItem value="z3">이문·휘경 뉴타운 3구역</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>매물 유형</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="유형 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TTUKKUNG">뚜껑</SelectItem>
                          <SelectItem value="DASEDAE">다세대</SelectItem>
                          <SelectItem value="VILLA">빌라</SelectItem>
                          <SelectItem value="ETC">기타</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="asking_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>매매 호가</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
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
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rights_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>권리가액</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <FormField
                  control={form.control}
                  name="owner_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>소유주 연락처 (선택)</FormLabel>
                      <FormControl>
                        <Input placeholder="010-0000-0000" {...field} />
                      </FormControl>
                      <FormDescription>B2C 사용자에게는 마스킹 처리되어 노출됩니다.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상세 주소/동호수 (선택)</FormLabel>
                      <FormControl>
                        <Input placeholder="101동 101호" {...field} />
                      </FormControl>
                      <FormDescription>Verified 검증용으로만 사용됩니다.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full py-6 text-lg font-bold">
                매물 등록하기
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
