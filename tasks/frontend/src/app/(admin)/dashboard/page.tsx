import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Users 
} from "lucide-react";

function StatCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">시스템 현황 요약</h1>
        <p className="text-muted-foreground">전체 플랫폼의 핵심 지표를 한눈에 파악합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="총 구역 수" 
          value="50" 
          icon={Layers} 
          description="서울시 재개발 구역"
        />
        <StatCard 
          title="총 매물 수" 
          value="1,248" 
          icon={Building2} 
          description="중개사 등록 매물"
        />
        <StatCard 
          title="Verified 비율" 
          value="42%" 
          icon={CheckCircle2} 
          description="검증 완료된 매물"
        />
        <StatCard 
          title="최근 동기화" 
          value="2시간 전" 
          icon={Clock} 
          description="국토부 API 연동"
        />
        <StatCard 
          title="Lead 구독 수" 
          value="856" 
          icon={Users} 
          description="알림 구독 고객"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
        <Card>
          <CardHeader>
            <CardTitle>최근 등록 매물</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple list for prototyping */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">장위 4구역 다세대</span>
                  </div>
                  <span className="text-sm text-muted-foreground">3분 전</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림 구독 트렌드</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
            <span className="text-muted-foreground font-medium italic">차트 영역 (Amplitude/Chart.js 연동 예정)</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
