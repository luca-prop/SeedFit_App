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

export async function reverseFilterAction(input: unknown): Promise<ReverseFilterResult> {
  try {
    const parsedInput = parseReverseFilterInput(input);
    const activeLtvPolicies = await listActiveLtvPolicies();

    if (activeLtvPolicies.length === 0) {
      return {
        ok: false,
        errorCode: "NO_ACTIVE_LTV_POLICY",
        message: "활성화된 LTV 정책이 없습니다.",
      };
    }

    const candidates = await listLatestZoneSnapshots();

    if (candidates.length === 0) {
      return {
        ok: false,
        errorCode: "DATA_NOT_READY",
        message: "Reverse Filter 구역 snapshot 데이터가 준비되지 않았습니다.",
      };
    }

    const groups = buildReverseFilterGroups(candidates, parsedInput);

    return reverseFilterSuccessSchema.parse({
      ok: true,
      input: parsedInput,
      ...groups,
      dataSyncedAt: latestDataSyncedAt(candidates),
      disclaimer: REVERSE_FILTER_DISCLAIMER,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return formatReverseFilterZodError(error);
    }

    console.error("reverseFilterAction failed", error);

    return {
      ok: false,
      errorCode: "INTERNAL_ERROR",
      message: "Reverse Filter 처리 중 오류가 발생했습니다.",
    };
  }
}
