import { NextResponse, type NextRequest } from "next/server";

/** 익명 방문자 쿠키. events.ts의 VISITOR_COOKIE와 같은 값이어야 한다. */
const VISITOR_COOKIE = "sf_vid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * 로그인 없이 "누가 어떤 구역을 보는지"를 묶기 위한 익명 ID를 보장한다.
 * 쿠키가 없으면 UUID를 발급하고, 같은 요청의 다운스트림(서버 컴포넌트)도
 * 바로 읽을 수 있도록 request 헤더에도 실어 보낸다.
 * Next 16 proxy 규칙: 파일명 proxy.ts + export proxy.
 */
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (existing) {
    return NextResponse.next();
  }

  const visitorId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", appendCookie(request.headers.get("cookie"), VISITOR_COOKIE, visitorId));

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return response;
}

function appendCookie(current: string | null, name: string, value: string): string {
  const pair = `${name}=${value}`;
  return current ? `${current}; ${pair}` : pair;
}

export const config = {
  // 정적 자산·내부 경로 제외.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
