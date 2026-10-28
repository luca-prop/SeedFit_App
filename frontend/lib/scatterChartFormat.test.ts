import assert from "node:assert/strict";

import { formatAxisEok, niceYTicks } from "./scatterChartFormat";

assert.equal(formatAxisEok(7.500000000001), "7.5억");
assert.equal(formatAxisEok(17.075), "17억");
assert.equal(formatAxisEok(3), "3억");
assert.equal(formatAxisEok(4.5), "4.5억");
assert.equal(formatAxisEok(0.000001), "0억");
assert.equal(formatAxisEok(Number.NaN), "");

assert.deepEqual(niceYTicks(3.5, 7.5), [3.5, 4.5, 5.5, 6.5, 7.5]);
assert.equal(niceYTicks(4.5, 17)[0], 4.5);
assert.equal(niceYTicks(4.5, 17).at(-1), 17);
assert.ok(niceYTicks(4.5, 17).every((tick) => Number.isInteger(tick * 2)));
assert.ok(!niceYTicks(4.5, 17).includes(17.075));

console.log("scatterChartFormat.test.ts passed");
