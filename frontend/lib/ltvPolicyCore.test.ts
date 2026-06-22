import assert from "node:assert/strict";

import { selectActiveLtvPolicy, type LtvPolicyLike } from "./ltvPolicyCore";

const effectiveFrom = new Date("2026-06-21T00:00:00.000Z");
const asOf = new Date("2026-06-22T00:00:00.000Z");
const krw = (value: number) => BigInt(value);

const policies: LtvPolicyLike[] = [
  {
    id: "t1",
    tierName: "T1",
    cashMinKrw: krw(100_000_000),
    cashMaxKrw: krw(300_000_000),
    ltvRatio: null,
    dsrNote: "MVP cash tier only",
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "t2",
    tierName: "T2",
    cashMinKrw: krw(300_000_000),
    cashMaxKrw: krw(500_000_000),
    ltvRatio: { toString: () => "0.7000" },
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "t3",
    tierName: "T3",
    cashMinKrw: krw(500_000_000),
    cashMaxKrw: krw(1_000_000_000),
    ltvRatio: "0.4000",
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "t4",
    tierName: "T4",
    cashMinKrw: krw(1_000_000_000),
    cashMaxKrw: null,
    ltvRatio: null,
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "inactive",
    tierName: "inactive",
    cashMinKrw: krw(300_000_000),
    cashMaxKrw: krw(500_000_000),
    ltvRatio: null,
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: false,
  },
  {
    id: "expired",
    tierName: "expired",
    cashMinKrw: krw(100_000_000),
    cashMaxKrw: krw(300_000_000),
    ltvRatio: null,
    dsrNote: null,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: new Date("2026-01-31T00:00:00.000Z"),
    isActive: true,
  },
];

assert.equal(selectActiveLtvPolicy(policies, krw(250_000_000), asOf)?.tierName, "T1");
assert.equal(selectActiveLtvPolicy(policies, krw(300_000_000), asOf)?.tierName, "T2");
assert.equal(selectActiveLtvPolicy(policies, krw(499_999_999), asOf)?.tierName, "T2");
assert.equal(selectActiveLtvPolicy(policies, krw(500_000_000), asOf)?.tierName, "T3");
assert.equal(selectActiveLtvPolicy(policies, krw(1_000_000_000), asOf)?.tierName, "T4");
assert.equal(selectActiveLtvPolicy(policies, krw(99_999_999), asOf), null);
assert.equal(selectActiveLtvPolicy(policies, krw(300_000_000), asOf)?.ltvRatio, 0.7);
assert.equal(selectActiveLtvPolicy(policies, krw(500_000_000), asOf)?.ltvRatio, 0.4);
assert.throws(() => selectActiveLtvPolicy(policies, BigInt(-1), asOf), RangeError);

const overlappingPolicies: LtvPolicyLike[] = [
  {
    id: "wide",
    tierName: "wide",
    cashMinKrw: krw(100_000_000),
    cashMaxKrw: krw(600_000_000),
    ltvRatio: null,
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "narrow",
    tierName: "narrow",
    cashMinKrw: krw(300_000_000),
    cashMaxKrw: krw(400_000_000),
    ltvRatio: null,
    dsrNote: null,
    effectiveFrom,
    effectiveTo: null,
    isActive: true,
  },
];

assert.equal(selectActiveLtvPolicy(overlappingPolicies, krw(350_000_000), asOf)?.tierName, "narrow");
assert.equal(selectActiveLtvPolicy(policies, krw(350_000_000), new Date("2025-12-31T00:00:00.000Z")), null);

console.log("ltvPolicyCore tests passed");
