import assert from "node:assert/strict";

import {
  calculateAcquisitionTax,
  calculateEntryCost,
  calculateErrorRate,
  checkReverseBudget,
  sumCostItems,
} from "./acquisitionCostCore";

const krw = (value: number) => BigInt(value);

assert.equal(
  calculateAcquisitionTax({
    basePriceKrw: krw(1_000_000_000),
    taxRateBps: 300,
  }),
  krw(30_000_000),
);

assert.equal(
  calculateAcquisitionTax({
    basePriceKrw: krw(999_999_999),
    taxRateBps: 333,
  }),
  krw(33_299_999),
);

assert.equal(
  sumCostItems([
    {
      label: "중개보수",
      amountKrw: krw(5_000_000),
    },
    {
      label: "등기비용",
      amountKrw: krw(2_000_000),
    },
  ]),
  krw(7_000_000),
);

assert.deepEqual(
  calculateEntryCost({
    baseInvestmentKrw: krw(300_000_000),
    acquisitionBasePriceKrw: krw(1_000_000_000),
    acquisitionTaxRateBps: 300,
    additionalCosts: [
      {
        label: "중개보수",
        amountKrw: krw(5_000_000),
      },
      {
        label: "등기비용",
        amountKrw: krw(2_000_000),
      },
    ],
  }),
  {
    baseInvestmentKrw: krw(300_000_000),
    acquisitionTaxKrw: krw(30_000_000),
    additionalCostKrw: krw(7_000_000),
    totalRequiredCashKrw: krw(337_000_000),
  },
);

assert.deepEqual(checkReverseBudget(krw(340_000_000), krw(337_000_000)), {
  availableCashKrw: krw(340_000_000),
  requiredCashKrw: krw(337_000_000),
  remainingCashKrw: krw(3_000_000),
  isWithinBudget: true,
});

assert.deepEqual(checkReverseBudget(krw(300_000_000), krw(337_000_000)), {
  availableCashKrw: krw(300_000_000),
  requiredCashKrw: krw(337_000_000),
  remainingCashKrw: krw(-37_000_000),
  isWithinBudget: false,
});

assert.deepEqual(calculateErrorRate(krw(105_000_000), krw(100_000_000)), {
  expectedKrw: krw(105_000_000),
  actualKrw: krw(100_000_000),
  absoluteErrorKrw: krw(5_000_000),
  errorRateBps: 500,
  isWithinTolerance: true,
});

assert.deepEqual(calculateErrorRate(krw(95_000_000), krw(100_000_000)), {
  expectedKrw: krw(95_000_000),
  actualKrw: krw(100_000_000),
  absoluteErrorKrw: krw(5_000_000),
  errorRateBps: 500,
  isWithinTolerance: true,
});

assert.deepEqual(calculateErrorRate(krw(106_000_000), krw(100_000_000)), {
  expectedKrw: krw(106_000_000),
  actualKrw: krw(100_000_000),
  absoluteErrorKrw: krw(6_000_000),
  errorRateBps: 600,
  isWithinTolerance: false,
});

assert.throws(
  () =>
    calculateEntryCost({
      baseInvestmentKrw: krw(300_000_000),
      acquisitionBasePriceKrw: krw(1_000_000_000),
      acquisitionTaxRateBps: -1,
    }),
  RangeError,
);

assert.throws(() => calculateErrorRate(krw(100_000_000), krw(0)), RangeError);
assert.throws(() => sumCostItems([{ label: "음수비용", amountKrw: krw(-1) }]), RangeError);

console.log("acquisitionCostCore tests passed");
