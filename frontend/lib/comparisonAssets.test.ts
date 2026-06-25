import assert from "node:assert/strict";

import { findComparisonAssetMatches } from "./comparisonAssets";

const elevenPointFiveEokAssets = findComparisonAssetMatches({
  availableCashKrw: 1_150_000_000,
  model: "firstHome70",
  limit: 10,
});

assert.equal(elevenPointFiveEokAssets[0].apartmentName, "래미안크레시티");
assert.equal(elevenPointFiveEokAssets[0].cashDeltaKrw, -10_000_000);
assert.equal(elevenPointFiveEokAssets[0].isWithinBudget, false);
assert.equal(elevenPointFiveEokAssets[1].apartmentName, "롯데캐슬클라시아");
assert.equal(elevenPointFiveEokAssets[1].isWithinBudget, true);
assert.ok(elevenPointFiveEokAssets.every((asset) => asset.requiredCashKrw <= 1_170_000_000));

const elevenPointFiveNoShortfallAssets = findComparisonAssetMatches({
  availableCashKrw: 1_150_000_000,
  model: "firstHome70",
  limit: 10,
  maxShortfallKrw: 0,
});

assert.equal(
  elevenPointFiveNoShortfallAssets.some((asset) => asset.apartmentName === "래미안크레시티"),
  false,
);

const thirteenPointFiveEokAssets = findComparisonAssetMatches({
  availableCashKrw: 1_350_000_000,
  model: "firstHome70",
  limit: 5,
});

assert.equal(thirteenPointFiveEokAssets[0].apartmentName, "상도더샵1차");
assert.equal(thirteenPointFiveEokAssets[0].cashDeltaKrw, 0);

const generalModelAssets = findComparisonAssetMatches({
  availableCashKrw: 500_000_000,
  model: "general40",
  limit: 10,
});

assert.deepEqual(
  generalModelAssets.map((asset) => asset.apartmentName),
  ["다산e편한세상자이", "주공뜨란채", "하계장미", "SK북한산시티"],
);

assert.deepEqual(
  findComparisonAssetMatches({
    availableCashKrw: null,
    model: "firstHome70",
  }),
  [],
);

console.log("comparisonAssets tests passed");

