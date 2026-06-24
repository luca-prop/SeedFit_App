import assert from "node:assert/strict";
import { ZodError } from "zod";

import { MVP_DATA_DISCLOSURE } from "./dataDisclosure";
import {
  formatReverseFilterZodError,
  getReverseFilterNearBudgetLimitKrw,
  parseReverseFilterInput,
  reverseFilterErrorSchema,
  reverseFilterSuccessSchema,
} from "./reverseFilterDto";

const parsedInput = parseReverseFilterInput({
  budgetMinKrw: 250_000_000,
  budgetMaxKrw: 350_000_000,
});

assert.deepEqual(parsedInput, {
  budgetMinKrw: 250_000_000,
  budgetMaxKrw: 350_000_000,
  interestedDistricts: [],
  sortBy: "budgetFit",
  sortDirection: "asc",
});

const districtFilteredInput = parseReverseFilterInput({
  budgetMinKrw: 500_000_000,
  budgetMaxKrw: 700_000_000,
  interestedDistricts: ["마포구", "용산구"],
  sortBy: "investmentMin",
  sortDirection: "desc",
});

assert.deepEqual(districtFilteredInput, {
  budgetMinKrw: 500_000_000,
  budgetMaxKrw: 700_000_000,
  interestedDistricts: ["마포구", "용산구"],
  sortBy: "investmentMin",
  sortDirection: "desc",
});

assert.throws(
  () =>
    parseReverseFilterInput({
      budgetMinKrw: 50_000_000,
      budgetMaxKrw: 150_000_000,
    }),
  ZodError,
);

assert.throws(
  () =>
    parseReverseFilterInput({
      budgetMinKrw: 125_000_000,
      budgetMaxKrw: 350_000_000,
    }),
  ZodError,
);

assert.throws(
  () =>
    parseReverseFilterInput({
      budgetMinKrw: 2_450_000_000,
      budgetMaxKrw: 2_550_000_000,
    }),
  ZodError,
);

assert.throws(
  () =>
    parseReverseFilterInput({
      budgetMinKrw: 400_000_000,
      budgetMaxKrw: 300_000_000,
    }),
  ZodError,
);

assert.equal(getReverseFilterNearBudgetLimitKrw(300_000_000), 50_000_000);
assert.equal(getReverseFilterNearBudgetLimitKrw(500_000_000), 50_000_000);
assert.equal(getReverseFilterNearBudgetLimitKrw(1_200_000_000), 120_000_000);

try {
  parseReverseFilterInput({
    budgetMinKrw: "2.5억",
    budgetMaxKrw: 350_000_000,
  });
  assert.fail("Expected invalid string cash input to throw");
} catch (error) {
  assert.ok(error instanceof ZodError);
  const formatted = formatReverseFilterZodError(error);

  assert.equal(formatted.ok, false);
  assert.equal(formatted.errorCode, "INVALID_INPUT");
  assert.ok(formatted.fieldErrors?.budgetMinKrw?.length);
}

const success = reverseFilterSuccessSchema.parse({
  ok: true,
  input: parsedInput,
  matchedZones: [
    {
      zoneId: "zone-1",
      zoneName: "공덕1구역",
      district: "마포구",
      dong: "공덕동",
      stage: "조합설립인가",
      projectType: "재개발",
      investmentMinKrw: 280_000_000,
      investmentMaxKrw: 350_000_000,
      requiredCashMinKrw: 300_000_000,
      requiredCashMaxKrw: 370_000_000,
      budgetGapKrw: 0,
      budgetStatus: "within_budget",
      matchScore: 100,
      sourceDate: "2026-05-19",
    },
  ],
  nearZones: [],
  excludedZones: [
    {
      zoneId: "zone-2",
      zoneName: "한남뉴타운",
      district: "용산구",
      dong: "한남동",
      stage: "관리처분인가",
      projectType: "재개발",
      investmentMinKrw: 1_200_000_000,
      investmentMaxKrw: 1_500_000_000,
      requiredCashMinKrw: 1_250_000_000,
      requiredCashMaxKrw: 1_550_000_000,
      budgetGapKrw: -950_000_000,
      budgetStatus: "over_budget",
      matchScore: 0,
      sourceDate: "2026-05-19",
      excludedReason: "예산 초과",
    },
  ],
  totalMatchedCount: 1,
  dataSyncedAt: "2026-06-22T00:00:00.000Z",
  disclaimer: MVP_DATA_DISCLOSURE.disclaimer,
});

assert.equal(success.ok, true);
assert.equal(success.matchedZones.length, 1);
assert.equal(success.excludedZones[0].excludedReason, "예산 초과");

const errorResponse = reverseFilterErrorSchema.parse({
  ok: false,
  errorCode: "DATA_NOT_READY",
  message: "Reverse Filter source data is not ready.",
});

assert.equal(errorResponse.ok, false);
assert.equal(errorResponse.errorCode, "DATA_NOT_READY");

console.log("reverseFilterDto tests passed");
