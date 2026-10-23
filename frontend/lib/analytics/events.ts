import "server-only";

import { cookies, headers } from "next/headers";

import { prisma } from "@/lib/prisma";

/** 익명 방문자 쿠키 이름. middleware가 설정한다. */
export const VISITOR_COOKIE = "sf_vid";

/**
 * 런칭 계획(MVP_OPERATIONS_AND_LAUNCH_PLAN §3.6)의 최소 이벤트 taxonomy.
 * 새 이벤트는 여기 먼저 추가한다 — 자유 문자열을 흘려보내지 않는다.
 */
export const EVENT_TYPES = {
  budgetSubmitted: "budget_submitted",
  resultsViewed: "results_viewed",
  zoneDetailOpened: "zone_detail_opened",
  includeSubToggled: "include_sub_toggled",
  reportViewed: "report_viewed",
  feedbackSubmitted: "feedback_submitted",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

const EVENT_TYPE_SET = new Set<string>(Object.values(EVENT_TYPES));

export function isKnownEventType(value: unknown): value is EventType {
  return typeof value === "string" && EVENT_TYPE_SET.has(value);
}

export type RecordEventInput = {
  eventType: EventType;
  zoneId?: string | null;
  path?: string | null;
  referrer?: string | null;
  props?: Record<string, unknown> | null;
  /** client 요청(API route)에서 넘어온 쿠키 값. 서버 컴포넌트에서는 생략한다. */
  visitorId?: string | null;
  userId?: string | null;
};

async function resolveVisitorId(explicit?: string | null): Promise<string | null> {
  if (explicit) return explicit;
  try {
    const store = await cookies();
    return store.get(VISITOR_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

async function resolveReferrer(explicit?: string | null): Promise<string | null> {
  if (explicit !== undefined) return explicit;
  try {
    const store = await headers();
    return store.get("referer");
  } catch {
    return null;
  }
}

/**
 * 행동 이벤트 1건을 기록한다. 절대 요청을 막지 않는다 — 실패는 로그만 남긴다.
 * 익명 ID가 없으면(쿠키 차단 등) 조용히 건너뛴다.
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    const visitorId = await resolveVisitorId(input.visitorId);
    if (!visitorId) return;
    if (!isKnownEventType(input.eventType)) return;

    await prisma.behaviorEvent.create({
      data: {
        visitorId,
        userId: input.userId ?? null,
        eventType: input.eventType,
        zoneId: input.zoneId ?? null,
        path: input.path ?? null,
        referrer: await resolveReferrer(input.referrer),
        props: (input.props ?? undefined) as never,
      },
    });
  } catch (error) {
    console.error("recordEvent failed", { eventType: input.eventType, error });
  }
}
