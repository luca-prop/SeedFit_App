import "server-only";

import type { LtvPolicy } from "@/generated/prisma/client";

import { selectActiveLtvPolicy, type SelectedLtvPolicy } from "@/lib/ltvPolicyCore";
import { prisma } from "@/lib/prisma";

export type GetLtvPolicyOptions = {
  asOf?: Date;
};

export async function listActiveLtvPolicies(options: GetLtvPolicyOptions = {}): Promise<LtvPolicy[]> {
  const asOf = options.asOf ?? new Date();

  return prisma.ltvPolicy.findMany({
    where: {
      isActive: true,
      effectiveFrom: {
        lte: asOf,
      },
      OR: [
        {
          effectiveTo: null,
        },
        {
          effectiveTo: {
            gte: asOf,
          },
        },
      ],
    },
    orderBy: [
      {
        cashMinKrw: "asc",
      },
      {
        effectiveFrom: "desc",
      },
    ],
  });
}

export async function getLtvPolicyForCash(
  cashKrw: bigint,
  options: GetLtvPolicyOptions = {},
): Promise<SelectedLtvPolicy | null> {
  const asOf = options.asOf ?? new Date();
  const policies = await listActiveLtvPolicies({ asOf });

  return selectActiveLtvPolicy(policies, cashKrw, asOf);
}
