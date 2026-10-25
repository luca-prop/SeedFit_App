import { NextResponse } from "next/server";

/** 공개 화면에 링크하지 않는다. 이 주소로 들어온 브라우저만 스캐터 초기 구역 스위치를 본다. */
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/app/results", request.url));
  response.cookies.set("sf_ops", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
