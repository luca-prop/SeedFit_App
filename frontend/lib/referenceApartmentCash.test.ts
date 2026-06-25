import assert from "node:assert/strict";

import {
  calculateReferenceAssumedLoanKrw,
  calculateReferenceCashGapKrw,
  calculateReferenceRequiredCashKrw,
} from "./referenceApartmentCash";

assert.equal(calculateReferenceAssumedLoanKrw(1_500_000_000), 600_000_000);
assert.equal(calculateReferenceAssumedLoanKrw(1_500_000_001), 400_000_000);
assert.equal(calculateReferenceAssumedLoanKrw(2_500_000_000), 400_000_000);
assert.equal(calculateReferenceAssumedLoanKrw(2_500_000_001), 200_000_000);
assert.equal(calculateReferenceAssumedLoanKrw(null), null);

assert.equal(calculateReferenceRequiredCashKrw(1_490_000_000), 890_000_000);
assert.equal(calculateReferenceRequiredCashKrw(1_890_000_000), 1_490_000_000);
assert.equal(calculateReferenceRequiredCashKrw(2_600_000_000), 2_400_000_000);
assert.equal(calculateReferenceRequiredCashKrw(null), null);

assert.equal(calculateReferenceCashGapKrw(1_490_000_000, 1_150_000_000), 340_000_000);
assert.equal(calculateReferenceCashGapKrw(900_000_000, 1_150_000_000), -250_000_000);
assert.equal(calculateReferenceCashGapKrw(null, 1_150_000_000), null);

console.log("referenceApartmentCash tests passed");
