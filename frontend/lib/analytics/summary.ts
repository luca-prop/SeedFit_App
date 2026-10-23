import "server-only";

import { prisma } from "@/lib/prisma";
import { EVENT_TYPES, type EventType } from "@/lib/analytics/events";

export type EventTypeCount = { eventType: string; count: number };
export type DailyCount = { day: string; count: number };
export type TopZone = { zoneId: string; zoneName: string | null; district: string | null; count: number };
export type RecentEvent = {
  eventType: string;
  zoneId: string | null;
  path: string | null;
  visitorShort: string;
  createdAt: Date;
};

export type AnalyticsSummary = {
  totalEvents: number;
  uniqueVisitors: number;
  events7d: number;
  visitors7d: number;
  byType: EventTypeCount[];
  daily: DailyCount[];
  topZones: TopZone[];
  recent: RecentEvent[];
  generatedAt: string;
};

/** 이벤트 순서를 taxonomy 정의 순으로 고정한다 (UI 안정성). */
const EVENT_ORDER: EventType[] = [
  EVENT_TYPES.budgetSubmitted,
  EVENT_TYPES.resultsViewed,
  EVENT_TYPES.zoneDetailOpened,
  EVENT_TYPES.includeSubToggled,
  EVENT_TYPES.reportViewed,
  EVENT_TYPES.feedbackSubmitted,
];

function num(value: unknown): number {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [totals, byTypeRows, dailyRows, topZoneRows, recentRows] = await Promise.all([
    prisma.$queryRaw<Array<{ total: bigint; visitors: bigint; e7: bigint; v7: bigint }>>`
      SELECT
        COUNT(*) AS total,
        COUNT(DISTINCT visitor_id) AS visitors,
        COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') AS e7,
        COUNT(DISTINCT visitor_id) FILTER (WHERE created_at >= now() - interval '7 days') AS v7
      FROM behavior_events
    `,
    prisma.$queryRaw<Array<{ event_type: string; count: bigint }>>`
      SELECT event_type, COUNT(*) AS count
      FROM behavior_events
      GROUP BY event_type
    `,
    prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS count
      FROM behavior_events
      WHERE created_at >= now() - interval '14 days'
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<Array<{ zone_id: string; zone_name: string | null; district: string | null; count: bigint }>>`
      SELECT be.zone_id, z.zone_name, z.district, COUNT(*) AS count
      FROM behavior_events be
      LEFT JOIN zones z ON z.id = be.zone_id
      WHERE be.zone_id IS NOT NULL
      GROUP BY be.zone_id, z.zone_name, z.district
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<
      Array<{ event_type: string; zone_id: string | null; path: string | null; visitor_id: string; created_at: Date }>
    >`
      SELECT event_type, zone_id, path, visitor_id, created_at
      FROM behavior_events
      ORDER BY created_at DESC
      LIMIT 30
    `,
  ]);

  const totalsRow = totals[0];
  const typeMap = new Map(byTypeRows.map((row) => [row.event_type, num(row.count)]));
  const knownTypes = new Set<string>(EVENT_ORDER);

  const byType: EventTypeCount[] = [
    ...EVENT_ORDER.map((eventType) => ({ eventType, count: typeMap.get(eventType) ?? 0 })),
    // taxonomy 밖의 이벤트가 섞여 들어오면 뒤에 노출한다.
    ...byTypeRows
      .filter((row) => !knownTypes.has(row.event_type))
      .map((row) => ({ eventType: row.event_type, count: num(row.count) })),
  ];

  return {
    totalEvents: num(totalsRow?.total),
    uniqueVisitors: num(totalsRow?.visitors),
    events7d: num(totalsRow?.e7),
    visitors7d: num(totalsRow?.v7),
    byType,
    daily: dailyRows.map((row) => ({ day: row.day, count: num(row.count) })),
    topZones: topZoneRows.map((row) => ({
      zoneId: row.zone_id,
      zoneName: row.zone_name,
      district: row.district,
      count: num(row.count),
    })),
    recent: recentRows.map((row) => ({
      eventType: row.event_type,
      zoneId: row.zone_id,
      path: row.path,
      visitorShort: row.visitor_id.slice(0, 8),
      createdAt: row.created_at,
    })),
    generatedAt: new Date().toISOString(),
  };
}
