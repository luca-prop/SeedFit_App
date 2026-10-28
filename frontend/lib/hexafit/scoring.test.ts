import assert from "node:assert/strict";

import { hexafitZones } from "../../app/lib/hexafitData";
import { HEXAFIT_ATTRIBUTES } from "./attributes";
import { resolveLocationTier, tierHundredPoints, tierScore } from "./locationTier";
import {
  buildInvestmentScale,
  investmentToScore,
  productTierBonus,
  profitabilityFromMatrix,
  scoreZone,
  viewBonuses,
  type InvestmentScale,
  type ZoneScoringInput,
} from "./scoring";

const liveScale = buildInvestmentScale(
  hexafitZones.flatMap((z) => (z.minInvestmentBillion == null ? [] : [z.minInvestmentBillion])),
);
if (!liveScale) throw new Error("투자금 기준 없음");
const scale: InvestmentScale = liveScale;
assert.equal(Object.keys(HEXAFIT_ATTRIBUTES).length, 66, "CORE 승인 2시·4시 플래그");
for (const key of Object.keys(HEXAFIT_ATTRIBUTES)) {
  const zone = hexafitZones.find((z) => z.naturalKey === key);
  assert.ok(zone, key);
  assert.equal(zone.coverage, "CORE", key);
}

// --- 급지: 스펙 §1.2 100점 / 10 ---
assert.equal(tierHundredPoints(1.5), 100, "1.5 → 100점");
assert.equal(tierHundredPoints(1.6), 99, "성수 1.6 → 99점");
assert.equal(tierHundredPoints(1.9), 96, "일원 1.9 → 96점");
assert.equal(tierHundredPoints(3.0), 85, "마곡 3.0 → 85점");
assert.equal(tierScore(1.0), 10.0, "최상급지 1.0 → 10.0");
assert.equal(tierScore(1.6), 9.9, "성수 99점 → 9.9");
assert.equal(tierScore(1.9), 9.6, "일원 96점 → 9.6");
assert.equal(tierScore(3.0), 8.5, "마곡 85점 → 8.5");

const seongsu = resolveLocationTier({ naturalKey: "성동구|성수동|성수전략1구역", dong: "성수동" });
assert.equal(seongsu.index, 1.6, "성수동 → 급지 1.6");
assert.equal(seongsu.score, 9.9);
assert.equal(seongsu.source, "dong");

const jayang = resolveLocationTier({ dong: "자양동" });
assert.equal(jayang.index, 2.4, "자양동 → 2.4");

const geumho = resolveLocationTier({ dong: "금호동3가" });
assert.equal(geumho.index, 2.4, "금호동3가 → 금호 → 2.4");

const bangbae = resolveLocationTier({ dong: "방배동" });
assert.equal(bangbae.index, 1.8, "방배 → 1.8");
assert.equal(bangbae.score, 9.7);

const itaewon = resolveLocationTier({ dong: "이태원동" });
assert.equal(itaewon.index, 1.6, "이태원 → 1.6");
assert.equal(itaewon.source, "dong");

for (const [dong, index] of [
  ["염리동", 2.3],
  ["공덕동", 2.4],
  ["대흥동", 2.5],
  ["신수동", 2.5],
] as const) {
  const t = resolveLocationTier({ dong });
  assert.equal(t.index, index, `${dong} → ${index}`);
  assert.equal(t.source, "dong");
}

const ichon = resolveLocationTier({
  naturalKey: "용산구|이촌동|이촌1구역(재건축)",
  dong: "이촌동",
});
assert.equal(ichon.index, 2.3, "이촌1구역 → 이촌/서 2.3");
assert.equal(ichon.source, "override");
assert.equal(ichon.score, 9.2);

const ichonBare = resolveLocationTier({ dong: "이촌동" });
assert.equal(ichonBare.index, null, "이촌동만 있으면 동/서 미확인 → 미지정");

for (const [dong, index, score] of [
  ["미아동", 3.5, 8.0],
  ["하월곡동", 3.4, 8.1],
  ["갈현동", 4.0, 7.5],
  ["불광동", 3.7, 7.8],
  ["대조동", 3.7, 7.8],
  ["중화동", 3.6, 7.9],
  ["수택동", 3.7, 7.8],
  ["독산동", 3.7, 7.8],
  ["전농동", 3.1, 8.4],
  ["제기동", 3.3, 8.2],
  ["대방동", 2.6, 8.9],
  ["청파동", 2.5, 9.0],
  ["후암동", 2.4, 9.1],
  ["수진동", 3.5, 8.0],
  ["신흥동", 3.5, 8.0],
] as const) {
  const t = resolveLocationTier({ dong });
  assert.equal(t.index, index, `${dong} → ${index}`);
  assert.equal(t.score, score, `${dong} 12시 ${score}`);
  assert.equal(t.source, "dong", `${dong}는 급지표`);
}

const unknown = resolveLocationTier({ dong: "존재하지않는동" });
assert.equal(unknown.index, null, "급지표·추정 모두 없는 동 → null");
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
const s = scoreZone(full, scale);
assert.equal(s.axes.locationTier.value, 9.9, "12시 급지 9.9");
assert.equal(s.axes.productScarcity.value, 7.0, "2시 기본 6 + 성수 급지 1.0");
assert.equal(s.axes.scaleInfrastructure.value, 5.5, "4시 2909세대 → 5.5");
assert.equal(scale.count, 107, "실투자금 107곳");
assert.equal(scale.floorEok, 1.55, "최저 1.55억 = 0점");
assert.equal(scale.medianEok, 6.5, "중간값 6.5억 = 5점");
assert.equal(scale.p75Eok, 10, "상위 25% 경계 10억 = 7.5점");
assert.equal(scale.ceilingEok, 30, "최고 30억 = 10점");
assert.equal(investmentToScore(1.55, scale), 0, "최저 → 0점");
assert.equal(investmentToScore(6.5, scale), 5, "중간값 → 5점");
assert.equal(investmentToScore(10, scale), 7.5, "10억 → 7.5점");
assert.equal(investmentToScore(21, scale), 8.9, "21억 → 8.9점");
assert.equal(investmentToScore(30, scale), 10, "최고 → 10점");
assert.equal(s.axes.financialBarrier.value, 8.9, "6시 21억 → 8.9/10");
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
const p = scoreZone(partial, scale);
assert.equal(p.axes.scaleInfrastructure.status, "missing");
assert.equal(p.axes.profitability.status, "missing");
assert.equal(p.axes.locationTier.status, "scored");
assert.equal(p.scoredCount, 4, "급지·상품성·투자금·단계 4축");

// --- 급지 미지정 → 10시도 미지정 ---
const noTier = scoreZone(
  {
    ...full,
    dong: "존재하지않는동",
    naturalKey: "강북구|미아동|미아2구역",
  },
  scale,
);
assert.equal(noTier.axes.locationTier.status, "missing");
assert.equal(noTier.axes.profitability.status, "missing", "급지 없으면 사업성 매트릭스 불가");

// --- 2시: 강남3구·한강벨트는 입지라 더하지 않음 ---
const gangnam = scoreZone(
  { ...full, district: "서초구", dong: "방배동", naturalKey: "서초구|방배동|방배5구역" },
  scale,
);
assert.equal(gangnam.axes.productScarcity.value, 7.0, "방배 2시 = 6 + 급지1.0");
assert.equal(gangnam.axes.locationTier.value, 9.7, "방배 12시 9.7");

const withAttrs = scoreZone(
  {
    ...full,
    attributes: {
      conflictPenalty: 1.5,
      highEndBrand: true,
      hardwareSpec: true,
      view: "hanRiverFull",
      schoolOnSite: true,
      stationArea: true,
      hanRiverTransit: true,
      gtxAccess: true,
    },
  },
  scale,
);
assert.equal(withAttrs.axes.stabilitySpeed.value, 7.5, "관리처분 9.0 - 갈등 1.5");
assert.equal(withAttrs.axes.productScarcity.value, 10, "6+급지1+한강영구2+하이엔드1.5=10.5 → 10");
assert.equal(withAttrs.axes.scaleInfrastructure.value, 7.6, "5.5 + 역세권1 + 한강교통0.5 + GTX0.3 + 초품아0.3");

const jayangScore = scoreZone({ ...full, dong: "자양동", naturalKey: "광진구|자양동|자양3동A구역" }, scale);
assert.equal(jayangScore.axes.productScarcity.value, 6.5, "자양 2.4 → 급지 +0.5");
assert.equal(productTierBonus(2.8), 0.2, "급지 2.8은 +0.2");
assert.equal(productTierBonus(2.9), 0, "급지 2.9 이상은 0");
const singil = scoreZone(
  { ...full, dong: "신길동", naturalKey: "영등포구|신길동|신길 2구역", attributes: { doubleStation: true } },
  scale,
);
assert.equal(singil.axes.productScarcity.value, 6.2, "신길 2.8 → 6+0.2");
assert.equal(singil.axes.scaleInfrastructure.value, 5.8, "2909세대 5.5 + 중심·더블 0.3");
const miaScore = scoreZone({ ...full, dong: "미아동", naturalKey: "강북구|미아동|미아 2구역", supplyUnits: 4003 }, scale);
assert.equal(miaScore.axes.productScarcity.value, 6.0, "미아 3.5 → 급지 0");
assert.equal(miaScore.axes.scaleInfrastructure.value, 6.0, "4003세대 → 6.0");
const miaTown = scoreZone(
  { ...full, dong: "미아동", supplyUnits: 4003, attributes: { newTownPlan: true } },
  scale,
);
assert.equal(miaTown.axes.scaleInfrastructure.value, 6.5, "6.0+뉴타운은 6.5에서 멈춤");
const standard = scoreZone({ ...full, attributes: { contractorStandard: true } }, scale);
assert.equal(standard.axes.productScarcity.value, 7.4, "성수 6+급지1+1군표준 0.4");
const specialized = scoreZone({ ...full, attributes: { hardwareSpec: true } }, scale);
assert.equal(specialized.axes.productScarcity.value, 7.8, "성수 6+급지1+1군특화 0.8");
assert.equal(viewBonuses({ viewHan: "hanRiverFull", viewPark: "parkMajor" }).han + viewBonuses({ viewHan: "hanRiverFull", viewPark: "parkMajor" }).park, 2, "한강영구면 공원 생략");
assert.equal(viewBonuses({ viewHan: "hanRiverBelt", viewPark: "parkMajor" }).han, 0.5);
assert.equal(viewBonuses({ viewHan: "hanRiverBelt", viewPark: "parkMajor" }).park, 0.5);
assert.equal(viewBonuses({ viewHan: "hanRiverPartial", viewPark: "parkRiver" }).han + viewBonuses({ viewHan: "hanRiverPartial", viewPark: "parkRiver" }).park, 1.3);

const zoneDesignated = scoreZone({ ...full, stage: "정비구역지정" }, scale);
assert.equal(zoneDesignated.axes.stabilitySpeed.value, 3.0, "정비구역 3.0");
const zonePlusPrep = scoreZone(
  { ...full, stage: "정비구역지정", attributes: { unionPrepApproved: true } },
  scale,
);
assert.equal(zonePlusPrep.axes.stabilitySpeed.value, 3.5, "정비구역 + 추진위 3.5");
assert.equal(scoreZone({ ...full, stage: "시공사 선정" }, scale).axes.stabilitySpeed.value, 6.0);
assert.equal(scoreZone({ ...full, stage: "조합설립인가" }, scale).axes.stabilitySpeed.value, 5.0);
assert.equal(scoreZone({ ...full, stage: "사업시행인가" }, scale).axes.stabilitySpeed.value, 8.0);
assert.equal(scoreZone({ ...full, stage: "추진위 승인" }, scale).axes.stabilitySpeed.value, 0.5);

// --- 10시 급지 차등: 50% 이상은 같고, 30%에서 갈림 ---
assert.equal(profitabilityFromMatrix(50, 1.6), 9, "50% 상급지 9");
assert.equal(profitabilityFromMatrix(50, 3.0), 9, "50% 중급지도 9");
assert.equal(profitabilityFromMatrix(50, 3.7), 9, "50% 하위도 9");
assert.equal(profitabilityFromMatrix(30, 1.6), 8, "30% 상급지 8");
assert.equal(profitabilityFromMatrix(30, 3.0), 7, "30% 중급지 7");
assert.equal(profitabilityFromMatrix(30, 3.7), 6.5, "30% 하위급지 6.5");
assert.equal(profitabilityFromMatrix(25, 1.6), 7, "25% 상급지 7");
assert.equal(profitabilityFromMatrix(25, 3.0), 6.5, "25% 중급지 6.5");
assert.equal(profitabilityFromMatrix(25, 3.7), 5, "25% 하위급지 5");
assert.equal(profitabilityFromMatrix(15, 1.6), 5.5, "15% 상급지 5.5");
assert.equal(profitabilityFromMatrix(15, 3.7), 4, "15% 하위급지 4");
assert.equal(profitabilityFromMatrix(5, 1.6), 3, "10% 미만은 급지 무관 3");

// --- 형상 진단: 고자본 메이저(급지 8.5+, 초투 12억+) ---
assert.ok(
  s.diagnosis.some((d) => d.includes("고자본 메이저")),
  "성수 21억 → 고자본 메이저 진단",
);

console.log("hexafit scoring tests passed");
