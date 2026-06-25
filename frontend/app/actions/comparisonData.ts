"use server";

import { z } from "zod";

import { MVP_DATA_DISCLOSURE } from "@/lib/dataDisclosure";
import { prisma } from "@/lib/prisma";
import {
  findComparisonAssetMatches,
  type ComparisonAssetLtvModel,
  type MatchedComparisonAsset,
} from "@/lib/comparisonAssets";

const comparisonDataInputSchema = z.object({
  zoneId: z.string().trim().min(1),
  zoneName: z.string().trim().min(1).optional(),
  ltvModel: z.enum(["firstHome70", "general40"]).optional(),
});

type ComparisonDataInput = z.infer<typeof comparisonDataInputSchema>;

export type ComparisonDataSuccess = {
  ok: true;
  zone: {
    id: string;
    zoneName: string;
    district: string;
    dong: string;
    stage: string;
    projectType: string | null;
    notes: string | null;
    investmentMinKrw: number | null;
    investmentMaxKrw: number | null;
    sourceDate: string | null;
  };
  ltvModel: ComparisonAssetLtvModel;
  comparisonAssets: MatchedComparisonAsset[];
  summary: {
    comparisonAssetCount: number;
    highestCandidatePriceKrw: number | null;
    closestRequiredCashKrw: number | null;
    closestCashDeltaKrw: number | null;
  };
  disclosure: typeof MVP_DATA_DISCLOSURE;
};

export type ComparisonDataError = {
  ok: false;
  errorCode: "INVALID_INPUT" | "ZONE_NOT_FOUND" | "INTERNAL_ERROR";
  message: string;
};

export type ComparisonDataResult = ComparisonDataSuccess | ComparisonDataError;

function toSafeKrwNumber(value: bigint | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const converted = Number(value);

  if (!Number.isSafeInteger(converted)) {
    throw new RangeError("KRW value exceeds Number.MAX_SAFE_INTEGER");
  }

  return converted;
}

function toIsoDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

async function findZoneWithComparisonData(input: ComparisonDataInput) {
  return prisma.zone.findFirst({
    where: {
      OR: [
        {
          id: input.zoneId,
        },
        ...(input.zoneName
          ? [
              {
                zoneName: input.zoneName,
              },
            ]
          : []),
      ],
    },
    include: {
      investmentSnapshots: {
        orderBy: {
          sourceDate: "desc",
        },
        take: 1,
      },
    },
  });
}

function buildSummary(comparisonAssets: MatchedComparisonAsset[]) {
  const highestCandidatePriceKrw =
    comparisonAssets.length > 0 ? Math.max(...comparisonAssets.map((asset) => asset.actualPriceKrw)) : null;
  const closestRequiredCashKrw = comparisonAssets.length > 0 ? comparisonAssets[0].requiredCashKrw : null;
  const closestCashDeltaKrw = comparisonAssets.length > 0 ? comparisonAssets[0].cashDeltaKrw : null;

  return {
    comparisonAssetCount: comparisonAssets.length,
    highestCandidatePriceKrw,
    closestRequiredCashKrw,
    closestCashDeltaKrw,
  };
}

export async function comparisonDataAction(input: unknown): Promise<ComparisonDataResult> {
  const parsedInput = comparisonDataInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      errorCode: "INVALID_INPUT",
      message: "비교 데이터 입력값이 올바르지 않습니다.",
    };
  }

  try {
    const zone = await findZoneWithComparisonData(parsedInput.data);

    if (!zone) {
      return {
        ok: false,
        errorCode: "ZONE_NOT_FOUND",
        message: "선택한 구역을 찾을 수 없습니다.",
      };
    }

    const latestSnapshot = zone.investmentSnapshots[0];
    const investmentMinKrw = toSafeKrwNumber(latestSnapshot?.investmentMinKrw);
    const ltvModel = parsedInput.data.ltvModel ?? "firstHome70";
    const comparisonAssets = findComparisonAssetMatches({
      availableCashKrw: investmentMinKrw,
      model: ltvModel,
      limit: 5,
    });

    return {
      ok: true,
      zone: {
        id: zone.id,
        zoneName: zone.zoneName,
        district: zone.district,
        dong: zone.dong,
        stage: zone.stage,
        projectType: zone.projectType,
        notes: zone.notes,
        investmentMinKrw,
        investmentMaxKrw: toSafeKrwNumber(latestSnapshot?.investmentMaxKrw),
        sourceDate: toIsoDate(latestSnapshot?.sourceDate),
      },
      ltvModel,
      comparisonAssets,
      summary: buildSummary(comparisonAssets),
      disclosure: MVP_DATA_DISCLOSURE,
    };
  } catch (error) {
    console.error("comparisonDataAction failed", error);

    return {
      ok: false,
      errorCode: "INTERNAL_ERROR",
      message: "비교 데이터 생성 중 오류가 발생했습니다.",
    };
  }
}
