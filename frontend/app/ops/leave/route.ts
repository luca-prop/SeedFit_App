import { NextResponse } from "next/server";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/app/results", request.url));
  response.cookies.set("sf_ops", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
