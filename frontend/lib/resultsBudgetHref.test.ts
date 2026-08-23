import assert from "node:assert/strict";

import {
  applyBudgetToResultsHref,
  formatBudgetEokRange,
  normalizeBudgetRange,
} from "./resultsBudgetHref";

assert.equal(formatBudgetEokRange(1_000_000_000, 1_500_000_000), "10억 ~ 15억");
assert.equal(formatBudgetEokRange(300_000_000, 300_000_000), "3억 ~ 3억");
assert.equal(formatBudgetEokRange(150_000_000, 250_000_000), "1.5억 ~ 2.5억");

assert.deepEqual(normalizeBudgetRange([800_000_000, 400_000_000], [100_000_000, 300_000_000]), [
  400_000_000,
  800_000_000,
]);
assert.deepEqual(normalizeBudgetRange([], [100_000_000, 300_000_000]), [100_000_000, 300_000_000]);

assert.equal(
  applyBudgetToResultsHref(
    "budgetMin=100000000&budgetMax=300000000&sort=budgetFitAsc&districts=광진구&includeSub=1",
    1_000_000_000,
    1_500_000_000,
  ),
  "/app/results?budgetMin=1000000000&budgetMax=1500000000&sort=budgetFitAsc&districts=%EA%B4%91%EC%A7%84%EA%B5%AC&includeSub=1",
);

assert.equal(
  applyBudgetToResultsHref("budget=300000000&sort=zoneNameAsc", 500_000_000, 800_000_000),
  "/app/results?sort=zoneNameAsc&budgetMin=500000000&budgetMax=800000000",
);

console.log("resultsBudgetHref.test.ts passed");
