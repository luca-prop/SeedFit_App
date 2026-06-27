import { NextResponse } from "next/server";

import { getPreviewHealth } from "@/lib/previewHealth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const health = await getPreviewHealth();

  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
