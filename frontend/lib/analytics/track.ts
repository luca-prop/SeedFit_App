"use client";

/**
 * client 측 행동 트래커. /api/events로 fire-and-forget POST 한다.
 * 네트워크 실패가 UI를 막지 않도록 await 하지 않는다.
 */
export const CLIENT_EVENTS = {
  budgetSubmitted: "budget_submitted",
  includeSubToggled: "include_sub_toggled",
  feedbackSubmitted: "feedback_submitted",
} as const;

export type ClientEventType = (typeof CLIENT_EVENTS)[keyof typeof CLIENT_EVENTS];

export function track(
  eventType: ClientEventType,
  props?: Record<string, unknown>,
  zoneId?: string,
): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    eventType,
    zoneId: zoneId ?? null,
    path: window.location.pathname + window.location.search,
    props: props ?? null,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // sendBeacon 실패 시 fetch로 폴백
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
