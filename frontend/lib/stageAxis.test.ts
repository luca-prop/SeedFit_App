import assert from "node:assert/strict";

import { stageAxisLabelFor } from "./stageAxis";

assert.equal(stageAxisLabelFor("사업시행자 지정"), "조합설립");
assert.equal(stageAxisLabelFor("사업시행자지정"), "조합설립");
assert.equal(stageAxisLabelFor("사업시행인가"), "사업시행");
assert.equal(stageAxisLabelFor("사업시행자 지정"), "조합설립");
assert.equal(stageAxisLabelFor("시공사 선정"), "시공사");
assert.equal(stageAxisLabelFor("조합설립인가"), "조합설립");
assert.equal(stageAxisLabelFor("정비구역지정"), "구역지정");
assert.equal(stageAxisLabelFor("관리처분인가"), "관리처분");

console.log("stageAxis.test.ts passed");
