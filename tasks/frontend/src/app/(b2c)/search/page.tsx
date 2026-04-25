import { SyncWarningBanner } from "../_components/sync-warning-banner";
import { ZoneResultCard } from "../_components/zone-result-card";
import { EmptyState } from "../_components/empty-state";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ cash?: string }>;
}) {
  const { cash: cashParam } = await searchParams;
  const cash = Number(cashParam || 0);
  
  // Mock data for prototyping
  const mockZones = [
    {
      zoneId: "1",
      name: "장위뉴타운 4구역",
      district: "성북구",
      stage: "관리처분인가",
      minInvestment: 280000000,
      maxInvestment: 320000000,
      matchScore: 95,
    },
    {
      zoneId: "2",
      name: "노량진뉴타운 1구역",
      district: "동작구",
      stage: "사업시행인가",
      minInvestment: 350000000,
      maxInvestment: 400000000,
      matchScore: 82,
    },
    {
      zoneId: "3",
      name: "이문·휘경 뉴타운 3구역",
      district: "동대문구",
      stage: "관리처분인가",
      minInvestment: 250000000,
      maxInvestment: 290000000,
      matchScore: 88,
    },
  ];

  const filteredZones = cash > 0 ? mockZones.filter(z => z.minInvestment <= cash * 1.2) : [];
  const isEmpty = cash > 0 && filteredZones.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            내 예산 <span className="text-primary">{cash.toLocaleString()}원</span>으로 
            진입 가능한 구역
          </h1>
          <p className="text-muted-foreground">총 {filteredZones.length}개의 구역이 매칭되었습니다.</p>
        </div>
      </div>

      <SyncWarningBanner lastSyncedAt="2026-03-01T00:00:00Z" />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredZones.map((zone) => (
              <ZoneResultCard key={zone.zoneId} {...zone} />
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
