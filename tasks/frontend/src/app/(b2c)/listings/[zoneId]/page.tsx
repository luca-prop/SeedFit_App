import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, MapPin } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ListingCardProps {
  type: string;
  price: number;
  premium: number;
  rightsValue: number;
  isVerified: boolean;
}

function ListingCard({ type, price, premium, rightsValue, isVerified }: ListingCardProps) {
  const formatKRW = (amount: number) => {
    return (amount / 100000000).toFixed(1) + "억";
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${
      isVerified ? "border-green-500 bg-green-50/10 ring-1 ring-green-500/20" : ""
    }`}>
      {isVerified && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-green-500 hover:bg-green-500 gap-1 py-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">매매 호가</p>
          <p className="text-2xl font-bold">{formatKRW(price)}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">프리미엄</p>
            <p className="font-bold">{formatKRW(premium)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">권리가액</p>
            <p className="font-bold">{formatKRW(rightsValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ZoneListingsPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const { zoneId } = await params;
  // Mock data
  const mockListings = [
    { type: "뚜껑", price: 450000000, premium: 50000000, rightsValue: 400000000, isVerified: true },
    { type: "다세대", price: 380000000, premium: 30000000, rightsValue: 350000000, isVerified: true },
    { type: "빌라", price: 520000000, premium: 70000000, rightsValue: 450000000, isVerified: false },
    { type: "기타", price: 400000000, premium: 40000000, rightsValue: 360000000, isVerified: false },
    { type: "뚜껑", price: 550000000, premium: 80000000, rightsValue: 470000000, isVerified: false },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">성북구</span>
          </div>
          <h1 className="text-3xl font-bold">장위뉴타운 4구역 매물 리스트</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1">총 {mockListings.length}개 매물</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockListings.map((listing, i) => (
          <ListingCard key={i} {...listing} />
        ))}
      </div>

      <Pagination className="pt-8">
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
