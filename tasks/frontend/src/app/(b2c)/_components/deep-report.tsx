import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  data: {
    label: string;
    redev: string;
    existing: string;
  }[];
}

function ReportSection({ title, data }: ReportSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">구분</TableHead>
              <TableHead>재개발 구역</TableHead>
              <TableHead>기축 아파트 (평균)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-muted-foreground">{row.label}</TableCell>
                <TableCell className="font-bold">{row.redev}</TableCell>
                <TableCell>{row.existing}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function DeepReport() {
  return (
    <div className="space-y-8">
      <ReportSection 
        title="1. 투자 구조 비교"
        data={[
          { label: "총 투자 금액", redev: "4.5억", existing: "9.2억" },
          { label: "실투자금 (현금)", redev: "2.8억", existing: "3.5억" },
          { label: "대출 가능액 (LTV)", redev: "1.5억", existing: "5.4억" },
          { label: "취득세 및 부대비용", redev: "0.2억", existing: "0.3억" },
        ]}
      />
      <ReportSection 
        title="2. 주거 비용 및 현금 흐름"
        data={[
          { label: "월 예상 주거비", redev: "85만원", existing: "120만원" },
          { label: "금융 비용 (이자)", redev: "55만원", existing: "180만원" },
          { label: "보유세 (연간)", redev: "120만원", existing: "450만원" },
        ]}
      />
      <ReportSection 
        title="3. 미래 가치 분석"
        data={[
          { label: "준공 후 예상 시세", redev: "15억", existing: "12억 (10년 후)" },
          { label: "잠재 수익금", redev: "10.5억", existing: "2.8억" },
          { label: "연평균 수익률", redev: "18.5%", existing: "3.2%" },
        ]}
      />
    </div>
  );
}
