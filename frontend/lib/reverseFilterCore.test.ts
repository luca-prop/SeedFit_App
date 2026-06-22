import assert from "node:assert/strict";

import { buildReverseFilterGroups, buildReverseFilterZone, REVERSE_FILTER_GROUP_LIMIT } from "./reverseFilterCore";
import type { ReverseFilterInput } from "./reverseFilterDto";

const krw = (value: number) => BigInt(value);
const input: ReverseFilterInput = {
  availableCashKrw: 300_000_000,
  interestedDistricts: [],
  sortBy: "budgetFit",
  sortDirection: "asc",
};

const sourceDate = new Date("2026-05-19T00:00:00.000Z");

const withinZone = buildReverseFilterZone(
  {
    zoneId: "zone-within",
    zoneName: "예산내구역",
    district: "마포구",
    dong: "공덕동",
    stage: "조합설립인가",
    projectType: "재개발",
    salePriceMinKrw: krw(900_000_000),
    salePriceMaxKrw: krw(1_000_000_000),
    investmentMinKrw: krw(280_000_000),
    investmentMaxKrw: krw(360_000_000),
    sourceDate,
  },
  input,
);

assert.equal(withinZone?.budgetStatus, "within_budget");
assert.equal(withinZone?.matchScore, 100);
assert.equal(withinZone?.budgetGapKrw, 20_000_000);
assert.equal(withinZone?.requiredCashMinKrw, 280_000_000);

const nearZone = buildReverseFilterZone(
  {
    zoneId: "zone-near",
    zoneName: "근접구역",
    district: "용산구",
    dong: "한남동",
    stage: "사업시행인가",
    projectType: "재개발",
    salePriceMinKrw: null,
    salePriceMaxKrw: null,
    investmentMinKrw: krw(340_000_000),
    investmentMaxKrw: krw(400_000_000),
    sourceDate,
  },
  input,
);

assert.equal(nearZone?.budgetStatus, "near_budget");
assert.equal(nearZone?.matchScore, 70);
assert.equal(nearZone?.budgetGapKrw, -40_000_000);

const overZone = buildReverseFilterZone(
  {
    zoneId: "zone-over",
    zoneName: "초과구역",
    district: "강남구",
    dong: "대치동",
    stage: "관리처분인가",
    projectType: "재건축",
    salePriceMinKrw: null,
    salePriceMaxKrw: null,
    investmentMinKrw: krw(500_000_000),
    investmentMaxKrw: null,
    sourceDate,
  },
  input,
);

assert.equal(overZone?.budgetStatus, "over_budget");
assert.equal(overZone?.matchScore, 0);
assert.equal(overZone?.excludedReason, "예산 초과");

const ignoredZone = buildReverseFilterZone(
  {
    zoneId: "zone-missing",
    zoneName: "현재매물없음",
    district: "마포구",
    dong: "아현동",
    stage: "추진위원회",
    projectType: "재개발",
    salePriceMinKrw: null,
    salePriceMaxKrw: null,
    investmentMinKrw: null,
    investmentMaxKrw: null,
    sourceDate,
  },
  input,
);

assert.equal(ignoredZone, null);

const grouped = buildReverseFilterGroups(
  [
    {
      zoneId: "zone-within",
      zoneName: "예산내구역",
      district: "마포구",
      dong: "공덕동",
      stage: "조합설립인가",
      projectType: "재개발",
      salePriceMinKrw: null,
      salePriceMaxKrw: null,
      investmentMinKrw: krw(280_000_000),
      investmentMaxKrw: krw(360_000_000),
      sourceDate,
    },
    {
      zoneId: "zone-near",
      zoneName: "근접구역",
      district: "용산구",
      dong: "한남동",
      stage: "사업시행인가",
      projectType: "재개발",
      salePriceMinKrw: null,
      salePriceMaxKrw: null,
      investmentMinKrw: krw(340_000_000),
      investmentMaxKrw: krw(400_000_000),
      sourceDate,
    },
    {
      zoneId: "zone-over",
      zoneName: "초과구역",
      district: "강남구",
      dong: "대치동",
      stage: "관리처분인가",
      projectType: "재건축",
      salePriceMinKrw: null,
      salePriceMaxKrw: null,
      investmentMinKrw: krw(500_000_000),
      investmentMaxKrw: null,
      sourceDate,
    },
  ],
  input,
);

assert.equal(grouped.matchedZones.length, 1);
assert.equal(grouped.nearZones.length, 1);
assert.equal(grouped.excludedZones.length, 1);
assert.equal(grouped.totalMatchedCount, 1);

const districtFiltered = buildReverseFilterGroups(
  [
    {
      zoneId: "zone-mapo",
      zoneName: "마포구역",
      district: "마포구",
      dong: "공덕동",
      stage: "조합설립인가",
      projectType: "재개발",
      salePriceMinKrw: null,
      salePriceMaxKrw: null,
      investmentMinKrw: krw(280_000_000),
      investmentMaxKrw: null,
      sourceDate,
    },
    {
      zoneId: "zone-yongsan",
      zoneName: "용산구역",
      district: "용산구",
      dong: "한남동",
      stage: "사업시행인가",
      projectType: "재개발",
      salePriceMinKrw: null,
      salePriceMaxKrw: null,
      investmentMinKrw: krw(280_000_000),
      investmentMaxKrw: null,
      sourceDate,
    },
  ],
  {
    ...input,
    interestedDistricts: ["마포구"],
  },
);

assert.equal(districtFiltered.matchedZones.length, 1);
assert.equal(districtFiltered.matchedZones[0].district, "마포구");
assert.equal(REVERSE_FILTER_GROUP_LIMIT, 30);

console.log("reverseFilterCore tests passed");
