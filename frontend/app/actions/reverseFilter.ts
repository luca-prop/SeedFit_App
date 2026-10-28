"use server";

import { ZodError } from "zod";

import type { Zone, ZoneInvestmentSnapshot } from "@/generated/prisma/client";
import { listActiveLtvPolicies } from "@/lib/ltvPolicy";
import { prisma } from "@/lib/prisma";
import {
  buildReverseFilterGroups,
  REVERSE_FILTER_DISCLAIMER,
  type ReverseFilterSnapshotCandidate,
} from "@/lib/reverseFilterCore";
import {
  formatReverseFilterZodError,
  parseReverseFilterInput,
  reverseFilterSuccessSchema,
  type ReverseFilterResult,
} from "@/lib/reverseFilterDto";
import { getFallbackDataSyncedAt, listFallbackZoneSnapshots } from "@/lib/reverseFilterFallback";

type ZoneWithLatestSnapshot = Zone & {
  investmentSnapshots: ZoneInvestmentSnapshot[];
};

function toSnapshotCandidate(row: ZoneWithLatestSnapshot): ReverseFilterSnapshotCandidate | null {
  const latestSnapshot = row.investmentSnapshots[0];

  if (!latestSnapshot) {
    return null;
  }

  return {
    zoneId: row.id,
    zoneName: row.zoneName,
    district: row.district,
    dong: row.dong,
    stage: row.stage,
    coverage: row.coverage === "CORE" || row.coverage === "SUB" ? row.coverage : null,
    projectType: row.projectType,
    salePriceMinKrw: latestSnapshot.salePriceMinKrw,
    salePriceMaxKrw: latestSnapshot.salePriceMaxKrw,
    investmentMinKrw: latestSnapshot.investmentMinKrw,
    investmentMaxKrw: latestSnapshot.investmentMaxKrw,
    sourceDate: latestSnapshot.sourceDate,
  };
}

function latestDataSyncedAt(candidates: ReverseFilterSnapshotCandidate[]): string {
  const latestTime = candidates.reduce((latest, candidate) => Math.max(latest, candidate.sourceDate.getTime()), 0);

  return new Date(latestTime || Date.now()).toISOString();
}

async function listLatestZoneSnapshots(): Promise<ReverseFilterSnapshotCandidate[]> {
  const rows = await prisma.zone.findMany({
    include: {
      investmentSnapshots: {
        orderBy: {
          sourceDate: "desc",
        },
        take: 1,
      },
    },
    orderBy: [
      {
        district: "asc",
      },
      {
        zoneName: "asc",
      },
    ],
  });

  return rows
    .map((row) => toSnapshotCandidate(row))
    .filter((candidate): candidate is ReverseFilterSnapshotCandidate => candidate !== null);
}

async function loadReverseFilterSource(): Promise<{
  candidates: ReverseFilterSnapshotCandidate[];
  dataSyncedAt: string;
  usedFallback: boolean;
}> {
  try {
    const activeLtvPolicies = await listActiveLtvPolicies();
    const candidates = await listLatestZoneSnapshots();

    if (activeLtvPolicies.length > 0 && candidates.length > 0) {
      return {
        candidates,
        dataSyncedAt: latestDataSyncedAt(candidates),
        usedFallback: false,
      };
    }

    console.warn("reverseFilterAction falling back to curated seed", {
      activeLtvPolicies: activeLtvPolicies.length,
      candidates: candidates.length,
    });
  } catch (error) {
    console.error("reverseFilterAction database path failed; using curated seed fallback", error);
  }

  const candidates = listFallbackZoneSnapshots();

  return {
    candidates,
    dataSyncedAt: getFallbackDataSyncedAt(),
    usedFallback: true,
  };
}

export async function reverseFilterAction(input: unknown): Promise<ReverseFilterResult> {
  try {
    const parsedInput = parseReverseFilterInput(input);
    const source = await loadReverseFilterSource();

    if (source.candidates.length === 0) {
      return {
        ok: false,
        errorCode: "DATA_NOT_READY",
        message: "Reverse Filter 구역 snapshot 데이터가 준비되지 않았습니다.",
      };
    }

    const groups = buildReverseFilterGroups(source.candidates, parsedInput);

    return reverseFilterSuccessSchema.parse({
      ok: true,
      input: parsedInput,
      ...groups,
      dataSyncedAt: source.dataSyncedAt,
      disclaimer: source.usedFallback
        ? `${REVERSE_FILTER_DISCLAIMER} (현재 Preview DB 연결이 불가해 큐레이션 seed로 조회 중입니다.)`
        : REVERSE_FILTER_DISCLAIMER,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatReverseFilterZodError(error);
    }

    console.error("reverseFilterAction failed", error);

    return {
      ok: false,
      errorCode: "INTERNAL_ERROR",
      message: "검색 데이터를 불러오는 중 문제가 발생했습니다.",
    };
  }
}
