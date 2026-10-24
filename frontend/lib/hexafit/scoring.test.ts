import assert from "node:assert/strict";

import { resolveLocationTier, tierScore } from "./locationTier";
import { scoreZone, type ZoneScoringInput } from "./scoring";

// --- 급지 ---
assert.equal(tierScore(1.6), 9.4, "성수 급지 1.6 → 9.4");
assert.equal(tierScore(1.0), 10.0, "최상급지 1.0 → 10.0");

const seongsu = resolveLocationTier({ naturalKey: "성동구|성수동|성수전략1구역", dong: "성수동" });
assert.equal(seongsu.index, 1.6, "성수동 → 급지 1.6");
assert.equal(seongsu.score, 9.4);
assert.equal(seongsu.source, "dong");

const jayang = resolveLocationTier({ dong: "자양동" });
assert.equal(jayang.index, 2.4, "자양동 → 2.4");

const geumho = resolveLocationTier({ dong: "금호동3가" });
assert.equal(geumho.index, 2.4, "금호동3가 → 금호 → 2.4");

const unknown = resolveLocationTier({ dong: "미아동" });
assert.equal(unknown.index, null, "급지표 미등록 동 → null");
assert.equal(unknown.score, null);

// --- 전체 채점: 성수(세대수·실투자·단계·일분/조합원 모두 보유) ---
const full: ZoneScoringInput = {
  naturalKey: "성동구|성수동|성수전략1구역",
  zoneName: "성수전략1구역",
  district: "성동구",
  dong: "성수동",
  stage: "관리처분인가",
  minInvestmentBillion: 21,
  maxInvestmentBillion: 31,
  supplyUnits: 2909,
  memberUnits: 1800,
  generalUnits: 900,
  benchmarkName: "트리마제",
  benchmarkPriceBillion: 46.5,
};
const s = scoreZone(full);
assert.equal(s.axes.locationTier.value, 9.4, "12시 급지 9.4");
assert.equal(s.axes.productScarcity.value, 7.0, "2시 기본 7.0 (강남3구 아님)");
assert.equal(s.axes.scaleInfrastructure.value, 9.0, "4시 2909세대 → 9.0");
assert.equal(s.axes.financialBarrier.value, 21, "6시 실투자금 21억 물리 바인딩");
assert.equal(s.axes.stabilitySpeed.value, 9.0, "8시 관리처분 → 9.0");
assert.equal(s.axes.profitability.value, 9, "10시 900/1800=50% 상급지 → 9");
assert.equal(s.scoredCount, 6, "6축 전부 채점");

// --- 세대수/일분·조합원 미보유 → 4시·10시 미지정 ---
const partial: ZoneScoringInput = {
  ...full,
  supplyUnits: null,
  memberUnits: null,
  generalUnits: null,
};
const p = scoreZone(partial);
assert.equal(p.axes.scaleInfrastructure.status, "missing");
assert.equal(p.axes.profitability.status, "missing");
assert.equal(p.axes.locationTier.status, "scored");
assert.equal(p.scoredCount, 4, "급지·상품성·투자금·단계 4축");

// --- 급지 미지정 → 10시도 미지정 ---
const noTier = scoreZone({ ...full, dong: "미아동", naturalKey: "강북구|미아동|미아2구역" });
assert.equal(noTier.axes.locationTier.status, "missing");
assert.equal(noTier.axes.profitability.status, "missing", "급지 없으면 사업성 매트릭스 불가");

// --- 강남3구 상품성 가점 ---
const gangnam = scoreZone({ ...full, district: "서초구", dong: "방배동", naturalKey: "서초구|방배동|방배5구역" });
assert.equal(gangnam.axes.productScarcity.value, 9.0, "강남3구 +2.0 → 9.0");

// --- 수동 플래그 반영 ---
const withAttrs = scoreZone({
  ...full,
  attributes: { conflictPenalty: 1.5, highEndBrand: true, hanRiverBelt: true },
});
assert.equal(withAttrs.axes.stabilitySpeed.value, 7.5, "관리처분 9.0 - 갈등 1.5");
assert.equal(withAttrs.axes.productScarcity.value, 9.0, "7.0 + 한강벨트1.5 + 하이엔드0.5");

// --- 형상 진단: 고자본 메이저(급지 8.5+, 초투 12억+) ---
assert.ok(
  s.diagnosis.some((d) => d.includes("고자본 메이저")),
  "성수 21억 → 고자본 메이저 진단",
);

console.log("hexafit scoring tests passed");
