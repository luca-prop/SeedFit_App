import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FilterSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`district-${index}`} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={`stage-${index}`} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export default function AppLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="space-y-5">
        <Card className="border-blue-100 bg-white">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </CardContent>
        </Card>

        <FilterSkeleton />

        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-10 w-full max-w-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
