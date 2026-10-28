import assert from "node:assert/strict";

import { deriveZoneCoverage, filterZonesByCoverage } from "./zoneCoverage";

assert.equal(deriveZoneCoverage("연번 부여"), "SUB");
assert.equal(deriveZoneCoverage("신속통합기획 대상지 선정"), "SUB");
assert.equal(deriveZoneCoverage("신속통합기획 확정"), "SUB");
assert.equal(deriveZoneCoverage("신속통합기획 완료"), "SUB");
assert.equal(deriveZoneCoverage("(모아)대상지 선정"), "SUB");
assert.equal(deriveZoneCoverage("(모아)관리계획수립"), "SUB");
assert.equal(deriveZoneCoverage("(모아)통합심의통과"), "SUB");
assert.equal(deriveZoneCoverage("추진준비"), "SUB");

assert.equal(deriveZoneCoverage("정비구역지정"), "CORE");
assert.equal(deriveZoneCoverage("정비구역 지정"), "CORE");
assert.equal(deriveZoneCoverage("(모아)관리계획고시"), "CORE");
assert.equal(deriveZoneCoverage("추진위 승인"), "SUB");
assert.equal(deriveZoneCoverage("추진위설립"), "SUB");
assert.equal(
  deriveZoneCoverage("추진위 승인", null, "정비구역지정|2026.01.15\n추진위승인|2026.01.29"),
  "CORE",
);
assert.equal(
  deriveZoneCoverage("추진위 승인", null, "정비구역지정|1개월째 진행중(중앙값 15개월)"),
  "SUB",
);
assert.equal(
  deriveZoneCoverage("연번 부여", null, "정비구역지정|2000.02.09\n추진위승인|2012.04.06"),
  "SUB",
);
assert.equal(deriveZoneCoverage("조합설립인가"), "CORE");
assert.equal(deriveZoneCoverage("사업시행인가"), "CORE");

assert.equal(deriveZoneCoverage("연번 부여", "CORE"), "CORE");
assert.equal(deriveZoneCoverage("조합설립인가", "SUB"), "SUB");

assert.deepEqual(
  filterZonesByCoverage(
    [
      { coverage: "CORE" as const, id: "a" },
      { coverage: "SUB" as const, id: "b" },
    ],
    false,
  ),
  [{ coverage: "CORE", id: "a" }],
);

assert.equal(filterZonesByCoverage([{ coverage: "SUB" as const }], true).length, 1);

console.log("zoneCoverage.test.ts passed");
