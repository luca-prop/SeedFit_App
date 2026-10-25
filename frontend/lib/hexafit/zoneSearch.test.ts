import assert from "node:assert/strict";

import { hexafitZones } from "../../app/lib/hexafitData";
import { zoneMatchesQuery } from "./zoneSearch";

const coreZones = hexafitZones.filter((z) => z.coverage === "CORE");

function names(query: string): string[] {
  return coreZones.filter((z) => zoneMatchesQuery(z, query)).map((z) => z.zoneName);
}

assert.equal(coreZones.length, 67, "검색 대상은 CORE 67곳");
assert.ok(names("금호21").includes("금호 21구역"), "금호21 → 금호 21구역");
assert.ok(names("금호 21").includes("금호 21구역"), "금호 21 → 금호 21구역");
assert.equal(names("금호21").includes("금호 22구역"), false, "SUB 금호 22는 검색 대상 밖");
assert.equal(names("금호 22").includes("금호 22구역"), false, "띄어쓴 SUB도 검색 대상 밖");
assert.deepEqual(names("금호").filter((n) => n.startsWith("금호")).sort(), ["금호 16구역", "금호 21구역"]);

console.log("hexafit zone search tests passed");
