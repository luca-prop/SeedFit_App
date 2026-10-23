import { NextResponse } from "next/server";
import { z } from "zod";

import { EVENT_TYPES, isKnownEventType, recordEvent, VISITOR_COOKIE } from "@/lib/analytics/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  eventType: z.string().refine(isKnownEventType, "unknown_event_type"),
  zoneId: z.string().max(64).optional().nullable(),
  path: z.string().max(512).optional().nullable(),
  props: z.record(z.string(), z.unknown()).optional().nullable(),
});

/** client-side track() ingestion. 본문 검증 실패·익명 ID 없음에도 204로 조용히 끝낸다. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const visitorId = readCookie(cookieHeader, VISITOR_COOKIE);

  await recordEvent({
    eventType: parsed.data.eventType,
    zoneId: parsed.data.zoneId ?? null,
    path: parsed.data.path ?? null,
    props: parsed.data.props ?? null,
    visitorId,
  });

  return new NextResponse(null, { status: 204 });
}

function readCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export const KNOWN_EVENTS = EVENT_TYPES;
