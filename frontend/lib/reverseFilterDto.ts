import { z } from "zod";

export const REVERSE_FILTER_MIN_CASH_KRW = 100_000_000;
export const REVERSE_FILTER_MAX_CASH_KRW = 2_500_000_000;
export const REVERSE_FILTER_CASH_STEP_KRW = 50_000_000;
export const REVERSE_FILTER_NEAR_BUDGET_THRESHOLD_KRW = 500_000_000;
export const REVERSE_FILTER_NEAR_BUDGET_FIXED_LIMIT_KRW = 50_000_000;
export const REVERSE_FILTER_NEAR_BUDGET_RATIO_BPS = 1_000;

const safeKrwNumberSchema = z
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER);

export const reverseFilterSortBySchema = z.enum([
  "budgetFit",
  "investmentMin",
  "investmentMax",
  "stage",
  "zoneName",
]);

export const reverseFilterSortDirectionSchema = z.enum(["asc", "desc"]);

export const reverseFilterBudgetStatusSchema = z.enum(["within_budget", "near_budget", "over_budget"]);

export const zoneCoverageSchema = z.enum(["CORE", "SUB"]);

export const reverseFilterErrorCodeSchema = z.enum([
  "INVALID_INPUT",
  "NO_ACTIVE_LTV_POLICY",
  "POLICY_NOT_CONFIGURED",
  "DATA_NOT_READY",
  "INTERNAL_ERROR",
]);

export const reverseFilterInputSchema = z.object({
  budgetMinKrw: safeKrwNumberSchema
    .min(REVERSE_FILTER_MIN_CASH_KRW)
    .max(REVERSE_FILTER_MAX_CASH_KRW)
    .refine((value) => value % REVERSE_FILTER_CASH_STEP_KRW === 0, {
      message: "budgetMinKrw must move in 50,000,000 KRW slider steps.",
    }),
  budgetMaxKrw: safeKrwNumberSchema
    .min(REVERSE_FILTER_MIN_CASH_KRW)
    .max(REVERSE_FILTER_MAX_CASH_KRW)
    .refine((value) => value % REVERSE_FILTER_CASH_STEP_KRW === 0, {
      message: "budgetMaxKrw must move in 50,000,000 KRW slider steps.",
    }),
  interestedDistricts: z.array(z.string().trim().min(1).max(40)).max(10).optional().default([]),
  sortBy: reverseFilterSortBySchema.optional().default("budgetFit"),
  sortDirection: reverseFilterSortDirectionSchema.optional().default("asc"),
}).refine((value) => value.budgetMinKrw <= value.budgetMaxKrw, {
  message: "budgetMinKrw must be less than or equal to budgetMaxKrw.",
  path: ["budgetMaxKrw"],
});

export const reverseFilterZoneSchema = z.object({
  zoneId: z.string().min(1),
  zoneName: z.string().min(1),
  district: z.string().min(1),
  dong: z.string().min(1),
  stage: z.string().min(1),
  coverage: zoneCoverageSchema,
  projectType: z.string().nullable(),
  investmentMinKrw: safeKrwNumberSchema,
  investmentMaxKrw: safeKrwNumberSchema.nullable(),
  requiredCashMinKrw: safeKrwNumberSchema,
  requiredCashMaxKrw: safeKrwNumberSchema.nullable(),
  budgetGapKrw: z.number().int().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER),
  budgetStatus: reverseFilterBudgetStatusSchema,
  matchScore: z.number().int().min(0).max(100),
  sourceDate: z.string().date(),
  excludedReason: z.string().nullable().optional(),
});

export const reverseFilterExcludedZoneSchema = reverseFilterZoneSchema.extend({
  budgetStatus: z.literal("over_budget"),
  excludedReason: z.string().min(1),
});

export const reverseFilterSuccessSchema = z.object({
  ok: z.literal(true),
  input: reverseFilterInputSchema,
  matchedZones: z.array(reverseFilterZoneSchema),
  nearZones: z.array(reverseFilterZoneSchema),
  excludedZones: z.array(reverseFilterExcludedZoneSchema),
  totalMatchedCount: z.number().int().min(0),
  dataSyncedAt: z.string().datetime(),
  disclaimer: z.string().min(1),
});

export const reverseFilterErrorSchema = z.object({
  ok: z.literal(false),
  errorCode: reverseFilterErrorCodeSchema,
  message: z.string().min(1),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export const reverseFilterResultSchema = z.discriminatedUnion("ok", [
  reverseFilterSuccessSchema,
  reverseFilterErrorSchema,
]);

export type ReverseFilterSortBy = z.infer<typeof reverseFilterSortBySchema>;
export type ReverseFilterSortDirection = z.infer<typeof reverseFilterSortDirectionSchema>;
export type ReverseFilterBudgetStatus = z.infer<typeof reverseFilterBudgetStatusSchema>;
export type ReverseFilterErrorCode = z.infer<typeof reverseFilterErrorCodeSchema>;
export type ReverseFilterInput = z.infer<typeof reverseFilterInputSchema>;
export type ReverseFilterZone = z.infer<typeof reverseFilterZoneSchema>;
export type ReverseFilterExcludedZone = z.infer<typeof reverseFilterExcludedZoneSchema>;
export type ReverseFilterSuccess = z.infer<typeof reverseFilterSuccessSchema>;
export type ReverseFilterError = z.infer<typeof reverseFilterErrorSchema>;
export type ReverseFilterResult = z.infer<typeof reverseFilterResultSchema>;

export function parseReverseFilterInput(input: unknown): ReverseFilterInput {
  return reverseFilterInputSchema.parse(input);
}

export function getReverseFilterNearBudgetLimitKrw(budgetMaxKrw: number): number {
  const parsedCash = safeKrwNumberSchema.parse(budgetMaxKrw);

  if (parsedCash < REVERSE_FILTER_NEAR_BUDGET_THRESHOLD_KRW) {
    return REVERSE_FILTER_NEAR_BUDGET_FIXED_LIMIT_KRW;
  }

  return Math.floor((parsedCash * REVERSE_FILTER_NEAR_BUDGET_RATIO_BPS) / 10_000);
}

export function formatReverseFilterZodError(error: z.ZodError): ReverseFilterError {
  return {
    ok: false,
    errorCode: "INVALID_INPUT",
    message: "Reverse Filter input is invalid.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}
