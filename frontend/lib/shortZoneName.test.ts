import assert from "node:assert/strict";

import { shortZoneName } from "./shortZoneName";

assert.equal(shortZoneName("자양2동 649(B)(모아타운)"), "자양2 649(B) (모아)");
assert.equal(shortZoneName("자양1동 779(모아타운)"), "자양1 779 (모아)");
assert.equal(shortZoneName("자양동 772-1(건대모아)"), "자양 772-1 (모아)");
assert.equal(shortZoneName("자양4동 A구역"), "자양4 A");
assert.equal(shortZoneName("자양 7구역"), "자양 7");
assert.equal(shortZoneName("북아현3구역"), "북아현3");
assert.equal(shortZoneName("동후암3구역"), "동후암3");
assert.doesNotMatch(shortZoneName("자양1동 779(모아타운)"), /자양1동779|자양1779/);
assert.doesNotMatch(shortZoneName("자양2동 649(B)(모아타운)"), /모아타운|건대모아/);

console.log("shortZoneName.test.ts passed");
