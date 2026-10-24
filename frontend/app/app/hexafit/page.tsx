import HexafitExplorer from "@/components/b2c/HexafitExplorer";
import { EVENT_TYPES, recordEvent } from "@/lib/analytics/events";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SearchParams = Promise<{ zones?: string | string[] }>;

function parseZones(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(",");
  return list.map((z) => z.trim()).filter(Boolean).slice(0, 4);
}

export default async function HexafitPage({ searchParams }: { searchParams: SearchParams }) {
  const { zones } = await searchParams;
  const initialZones = parseZones(zones);

  await recordEvent({
    eventType: EVENT_TYPES.hexafitCompared,
    path: "/app/hexafit",
    props: { zones: initialZones },
  });

  return <HexafitExplorer initialZones={initialZones} />;
}
