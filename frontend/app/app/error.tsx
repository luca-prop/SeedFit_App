"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  const digest = error.digest ? `오류 추적 ID: ${error.digest}` : null;

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-10">
      <Card className="w-full border-red-100 bg-white shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-950">화면 데이터를 불러오지 못했습니다</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              일시적인 서버 오류이거나 Preview DB 연결 상태가 맞지 않을 수 있습니다. 다시 시도해도 반복되면
              `/app/preview-health`에서 DB/env 상태를 먼저 확인해 주세요.
            </p>
          </div>

          <Alert className="mt-6 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>확인 순서</AlertTitle>
            <AlertDescription className="text-amber-800">
              최신 Preview alias URL인지 확인하고, Preview Health가 READY인지 본 뒤 같은 흐름을 다시 실행합니다.
              {digest ? <span className="mt-2 block font-mono text-xs">{digest}</span> : null}
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" size="lg" className="min-h-11" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            <Link
              href="/app/preview-health"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Preview Health 확인
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
