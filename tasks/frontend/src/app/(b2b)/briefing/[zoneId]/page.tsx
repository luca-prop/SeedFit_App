import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Eye, EyeOff, Printer, Share2 } from "lucide-react";
import { maskPhoneNumber, maskUnitNumber } from "@/lib/masking";
import { Button } from "@/components/ui/button";

export default async function BriefingPage({
  params
}: {
  params: Promise<{ zoneId: string }>
}) {
  const { zoneId } = await params;
  // Mock data
  const listing = {
    zone_name: "장위뉴타운 4구역",
    property_type: "다세대",
    asking_price: 450000000,
    premium: 50000000,
    rights_value: 400000000,
    owner_contact: "01012345678",
    unit_number: "101동 1201호",
  };

  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-primary-foreground px-3 py-1 gap-1">
            <Mic className="h-3 w-3" />
            고객 브리핑 모드
          </Badge>
          <span className="text-sm text-muted-foreground font-medium">민감 정보가 자동으로 마스킹됩니다.</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
          <Button size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            공유
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
              보안 정보 (마스킹됨)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">소유주 연락처</span>
              <span className="font-mono font-bold tracking-wider">{maskPhoneNumber(listing.owner_contact)}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">상세 주소 / 동호수</span>
              <span className="font-mono font-bold tracking-wider">{maskUnitNumber(listing.unit_number)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              매물 핵심 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">구역명</span>
              <span className="font-bold">{listing.zone_name}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">매물 유형</span>
              <span className="font-bold">{listing.property_type}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">매매 호가</span>
              <span className="font-bold text-lg">{formatKRW(listing.asking_price)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 text-slate-50 border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">투자 수익 시뮬레이션</CardTitle>
          <p className="text-slate-400 text-center">주변 대장 단지 시세를 기반으로 산출된 예상 가치입니다.</p>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">실투자금</p>
              <p className="text-4xl font-black">2.5억</p>
            </div>
            <div className="text-center space-y-2 border-x border-slate-800">
              <p className="text-slate-400 text-sm">예상 가치</p>
              <p className="text-4xl font-black text-primary">15억</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">잠재 수익</p>
              <p className="text-4xl font-black text-green-400">+12.5억</p>
            </div>
          </div>
          
          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              전문가 코멘트
            </h4>
            <p className="text-sm leading-relaxed text-slate-300">
              해당 구역은 현재 관리처분인가 단계로, 3년 내 이주 및 철거가 예상됩니다. 
              인근 래미안 장위 퍼스트하이 실거래가(15억) 대비 현저히 낮은 권리가액으로 
              안전마진이 충분히 확보된 우량 매물입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
