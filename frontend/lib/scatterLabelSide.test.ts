import assert from "node:assert/strict";

import { assignLabelSides } from "./scatterLabelSide";

const pair = assignLabelSides([
  { id: "sangdo", stageIndex: 2, x: 2.1, y: 1.8, name: "상도21" },
  { id: "jangwi", stageIndex: 2, x: 2.18, y: 1.8, name: "장위13-2" },
]);
assert.equal(pair.get("sangdo"), "left");
assert.equal(pair.get("jangwi"), "right");

const withNeighbor = assignLabelSides([
  { id: "sadang", stageIndex: 2, x: 1.85, y: 1.6, name: "사당12" },
  { id: "sangdo", stageIndex: 2, x: 2.1, y: 1.8, name: "상도21" },
  { id: "jangwi", stageIndex: 2, x: 2.18, y: 1.8, name: "장위13-2" },
]);
assert.equal(withNeighbor.get("sangdo"), "left");
assert.equal(withNeighbor.get("jangwi"), "right");

console.log("scatterLabelSide.test.ts passed");
