import "server-only";

type EnvKey =
  | "DATABASE_URL"
  | "DIRECT_URL"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

type PreviewHealthEnv = Record<EnvKey, boolean>;

type PreviewHealthDbCounts = {
  zones: number;
  zoneInvestmentSnapshots: number;
  referenceApartments: number;
  zoneReferenceApartments: number;
  activeLtvPolicies: number;
};

export type PreviewHealthResult = {
  ok: boolean;
  checkedAt: string;
  environment: string;
  env: PreviewHealthEnv;
  db: {
    ok: boolean;
    counts: PreviewHealthDbCounts | null;
    latestSnapshotSourceDate: string | null;
    error: string | null;
  };
  checks: {
    hasDatabaseUrl: boolean;
    hasSeedData: boolean;
    hasActiveLtvPolicy: boolean;
  };
};

const ENV_KEYS: EnvKey[] = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function envPresence(): PreviewHealthEnv {
  return ENV_KEYS.reduce((result, key) => {
    result[key] = Boolean(process.env[key]);
    return result;
  }, {} as PreviewHealthEnv);
}

export async function getPreviewHealth(): Promise<PreviewHealthResult> {
  const env = envPresence();
  const checkedAt = new Date().toISOString();
  const base = {
    checkedAt,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    env,
  };

  if (!env.DATABASE_URL) {
    return {
      ...base,
      ok: false,
      db: {
        ok: false,
        counts: null,
        latestSnapshotSourceDate: null,
        error: "DATABASE_URL is missing",
      },
      checks: {
        hasDatabaseUrl: false,
        hasSeedData: false,
        hasActiveLtvPolicy: false,
      },
    };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const [zones, zoneInvestmentSnapshots, referenceApartments, zoneReferenceApartments, activeLtvPolicies, latestSnapshot] =
      await Promise.all([
        prisma.zone.count(),
        prisma.zoneInvestmentSnapshot.count(),
        prisma.referenceApartment.count(),
        prisma.zoneReferenceApartment.count(),
        prisma.ltvPolicy.count({ where: { isActive: true } }),
        prisma.zoneInvestmentSnapshot.aggregate({ _max: { sourceDate: true } }),
      ]);

    const counts = {
      zones,
      zoneInvestmentSnapshots,
      referenceApartments,
      zoneReferenceApartments,
      activeLtvPolicies,
    };
    const hasSeedData = zones > 0 && zoneInvestmentSnapshots > 0 && referenceApartments > 0;
    const hasActiveLtvPolicy = activeLtvPolicies > 0;

    return {
      ...base,
      ok: hasSeedData && hasActiveLtvPolicy,
      db: {
        ok: true,
        counts,
        latestSnapshotSourceDate: latestSnapshot._max.sourceDate?.toISOString() ?? null,
        error: null,
      },
      checks: {
        hasDatabaseUrl: true,
        hasSeedData,
        hasActiveLtvPolicy,
      },
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      db: {
        ok: false,
        counts: null,
        latestSnapshotSourceDate: null,
        error: error instanceof Error ? error.message : "Unknown database health check error",
      },
      checks: {
        hasDatabaseUrl: true,
        hasSeedData: false,
        hasActiveLtvPolicy: false,
      },
    };
  }
}
