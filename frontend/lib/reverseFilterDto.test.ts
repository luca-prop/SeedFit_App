import assert from "node:assert/strict";
import { ZodError } from "zod";

import {
  formatReverseFilterZodError,
  parseReverseFilterInput,
  reverseFilterErrorSchema,
  reverseFilterSuccessSchema,
} from "./reverseFilterDto";

const parsedInput = parseReverseFilterInput({
  availableCashKrw: 300_000_000,
});

assert.deepEqual(parsedInput, {
  availableCashKrw: 300_000_000,
  interestedDistricts: [],
  sortBy: "budgetFit",
  sortDirection: "asc",
});

const districtFilteredInput = parseReverseFilterInput({
  availableCashKrw: 500_000_000,
  interestedDistricts: ["마포구", "용산구"],
  sortBy: "investmentMin",
  sortDirection: "desc",
});

assert.deepEqual(districtFilteredInput, {
  availableCashKrw: 500_000_000,
  interestedDistricts: ["마포구", "용산구"],
  sortBy: "investmentMin",
  sortDirection: "desc",
});

assert.throws(
  () =>
    parseReverseFilterInput({
      availableCashKrw: 5_000_000,
    }),
  ZodError,
);

try {
  parseReverseFilterInput({
    availableCashKrw: "3억",
  });
  assert.fail("Expected invalid string cash input to throw");
} catch (error) {
  assert.ok(error instanceof ZodError);
  const formatted = formatReverseFilterZodError(error);

  assert.equal(formatted.ok, false);
  assert.equal(formatted.errorCode, "INVALID_INPUT");
  assert.ok(formatted.fieldErrors?.availableCashKrw?.length);
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
  disclaimer: "본 데이터는 국토부 실거래가 기준이며, 현장 호가와 다를 수 있습니다.",
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
