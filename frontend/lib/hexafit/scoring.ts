/**
 * 육각형 비교(HexaFit) 6축 채점 엔진.
 * 스펙: docs/육각형비교tool.md §1~3.
 *
 * 설계 원칙: 보유 데이터로만 채점한다. 값이 없으면 null(미지정)로 두고
 * 추정하지 않는다. 수동 가점(상품성 뷰/학군/브랜드, 인프라, 조합갈등 등)은
 * attributes로 명시적으로 넣을 때만 반영한다.
 */

import { resolveLocationTier, type LocationTierResult } from "./locationTier";

/** 6축 축 키 (12시 → 시계방향). */
export type HexAxis =
  | "locationTier" // 12시 급지
  | "productScarcity" // 2시 단지 희소성·고급화 (입지 제외)
  | "scaleInfrastructure" // 4시 체급·거주 인프라
  | "financialBarrier" // 6시 필요 투자금(억)
  | "stabilitySpeed" // 8시 안정성·속도
  | "profitability"; // 10시 사업성

/** 구역 1건의 채점 입력. DB에서 끌어오는 실측치 + 선택적 수동 플래그. */
export type ZoneScoringInput = {
  naturalKey?: string | null;
  zoneName: string;
  district: string;
  dong: string;
  stage: string | null;
  /** 실투자금 최소/최대 (억). 6시 축은 최소값을 분포 점수로 환산한다. */
  minInvestmentBillion: number | null;
  maxInvestmentBillion: number | null;
  /** 공급(총 신축) 세대수. 4시 Base_Scale_Score. */
  supplyUnits: number | null;
  /** 조합원분양 세대 (추정치일 수 있음). 10시 분모. */
  memberUnits: number | null;
  /** 일반분양 세대. 10시 분자. */
  generalUnits: number | null;
  /** 비교 기축 아파트 (중심 라벨용). */
  benchmarkName?: string | null;
  benchmarkPriceBillion?: number | null;
  /** 수동 가점 플래그 (운영자 확정 시에만). */
  attributes?: ZoneAttributes;
};

export type ZoneAttributes = {
  /** 2시 한강 조망. 영구 > 부분 > 벨트 중 하나. */
  viewHan?: "hanRiverFull" | "hanRiverPartial" | "hanRiverBelt" | null;
  /** 2시 공원 조망. 메이저 > 일반·하천 중 하나. 한강영구가 있으면 더하지 않음. */
  viewPark?: "parkMajor" | "parkRiver" | null;
  /** 예전 단일 조망 칸. 있으면 viewHan/viewPark로 읽는다. */
  view?: "hanRiverFull" | "hanRiverPartial" | "hanRiverBelt" | "parkMajor" | "parkRiver" | null;
  /** 시공사·고급화. 하나만. 하이엔드 1.5 > 1군+특화 0.8 > 1군 표준 0.4 */
  highEndBrand?: boolean;
  hardwareSpec?: boolean;
  contractorStandard?: boolean;
  /** 4시 운영자 칸. 세대수·급지는 자동. */
  newTownPlan?: boolean;
  stationArea?: boolean; // 역세권 +1
  doubleStation?: boolean; // 중심위치·더블 역세권 +0.3
  hanRiverTransit?: boolean; // 한강벨트 교통 +0.5
  gtxAccess?: boolean; // +0.3
  parkWaterfront?: boolean; // 대형 공원/강/하천 +0.3
  mallAdjacent?: boolean; // +0.3
  hospitalAdjacent?: boolean; // +0.2
  schoolDistrict?: "core" | "wide" | null; // 대치·목동·중계 +1 / 범학군 +0.5
  schoolOnSite?: boolean; // 초품아 +0.3
  /** 8시 */
  conflictPenalty?: number;
  speedBonus?: number;
  unionPrepApproved?: boolean;
};

export type AxisScore = {
  /** 레이더에 그릴 값. 6축 모두 0~10 점수. */
  value: number | null;
  /** 채점 근거 요약 (UI 툴팁용). */
  detail: string;
  /** 실측 기반인지 / 데이터 부족인지. */
  status: "scored" | "missing";
};

export type ZoneHexScore = {
  naturalKey: string | null;
  zoneName: string;
  axes: Record<HexAxis, AxisScore>;
  benchmarkName: string | null;
  benchmarkPriceBillion: number | null;
  /** 6축 중 실측된 축 수. 레이더 신뢰도 표시용. */
  scoredCount: number;
  /** 형상 진단 메시지 (조건 충족 시). */
  diagnosis: string[];
};

const round1 = (v: number) => Math.round(v * 10) / 10;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** 우리 단계 라벨 → 스펙 §2.4 Base_Stage_Score. 미지정은 null. */
const STAGE_BASE_SCORE: Record<string, number> = {
  "착공 및 일반분양 완료": 10.0,
  "이주 및 철거": 9.5,
  "관리처분인가": 9.0,
  "사업시행인가": 8.0,
  "건축심의": 7.0,
  "시공사 선정": 6.0,
  "사업시행자 지정": 6.0,
  "조합설립인가": 5.0,
  "정비구역지정": 3.0,
  "정비구역 지정": 3.0,
  "(모아)통합심의통과": 3.0,
  "(모아)관리계획고시": 3.0,
  "(모아)관리계획수립": 2.5,
  "신속통합기획 완료": 2.5,
  "신속통합기획 대상지 선정": 2.0,
  "(모아)대상지 선정": 2.0,
  "연번 부여": 0.5,
  "추진위 승인": 0.5,
  "추진준비": 0.5,
  // "대상지철회" → 미지정(null)
};

/** 이 단계에 추진위 승인이 있으면 +0.5. 추진위 단독 단계는 이미 0.5라 더하지 않는다. */
const UNION_PREP_BONUS_STAGES = new Set([
  "정비구역지정",
  "정비구역 지정",
  "신속통합기획 대상지 선정",
  "(모아)대상지 선정",
  "연번 부여",
]);

// --- 12시 급지 ---
function scoreLocationTier(input: ZoneScoringInput, tier: LocationTierResult): AxisScore {
  if (tier.score == null) {
    return { value: null, detail: "급지표 미등록 지역 (급지 미지정)", status: "missing" };
  }
  const suffix = tier.source === "estimate" ? " · 인접 급지 추정" : "";
  return {
    value: tier.score,
    detail: `급지 ${tier.index} · ${Math.round((tier.score ?? 0) * 10)}점 → ${tier.score}${suffix}`,
    status: "scored",
  };
}

function resolveViewHan(a: ZoneAttributes): "hanRiverFull" | "hanRiverPartial" | "hanRiverBelt" | null {
  if (a.viewHan) return a.viewHan;
  if (a.view === "hanRiverFull" || a.view === "hanRiverPartial" || a.view === "hanRiverBelt") return a.view;
  return null;
}

function resolveViewPark(a: ZoneAttributes): "parkMajor" | "parkRiver" | null {
  if (a.viewPark) return a.viewPark;
  if (a.view === "parkMajor" || a.view === "parkRiver") return a.view;
  return null;
}

export function viewBonuses(a: ZoneAttributes): { han: number; park: number; labels: string[] } {
  const hanKey = resolveViewHan(a);
  const parkKey = resolveViewPark(a);
  let han = 0;
  const labels: string[] = [];
  if (hanKey === "hanRiverFull") {
    han = 2;
    labels.push("한강영구 +2");
  } else if (hanKey === "hanRiverPartial") {
    han = 1;
    labels.push("한강부분 +1");
  } else if (hanKey === "hanRiverBelt") {
    han = 0.5;
    labels.push("한강벨트 +0.5");
  }
  let park = 0;
  if (hanKey === "hanRiverFull") {
    if (parkKey) labels.push("공원뷰 생략(한강영구)");
  } else if (parkKey === "parkMajor") {
    park = 0.5;
    labels.push("메이저공원 +0.5");
  } else if (parkKey === "parkRiver") {
    park = 0.3;
    labels.push("공원·하천 +0.3");
  }
  return { han, park, labels };
}

/** 2시 급지 가점. 1.0~2.1 = +1.0, 2.2~2.7 = +0.5, 2.8 = +0.2, 2.9 이상 = 0. */
export function productTierBonus(index: number | null | undefined): number {
  if (index == null) return 0;
  if (index <= 2.1) return 1.0;
  if (index <= 2.7) return 0.5;
  if (index <= 2.8) return 0.2;
  return 0;
}

// --- 2시 희소성·상품성 ---
function scoreProductScarcity(input: ZoneScoringInput, tier: LocationTierResult): AxisScore {
  let score = 6.0;
  const parts: string[] = ["기본 6.0"];
  const a = input.attributes ?? {};
  const tierBonus = productTierBonus(tier.index);
  if (tierBonus) {
    score += tierBonus;
    parts.push(`급지 ${tier.index} +${tierBonus}`);
  }
  const { han, park, labels } = viewBonuses(a);
  score += han + park;
  parts.push(...labels);
  if (a.highEndBrand) {
    score += 1.5;
    parts.push("하이엔드 +1.5");
  } else if (a.hardwareSpec) {
    score += 0.8;
    parts.push("1군+특화 +0.8");
  } else if (a.contractorStandard) {
    score += 0.4;
    parts.push("1군 표준 +0.4");
  }
  return { value: round1(clamp(score, 0, 10)), detail: parts.join(" · "), status: "scored" };
}

// --- 4시 규모·생활편의 ---
export function baseScaleScore(units: number): number {
  if (units >= 5000) return 6.5;
  if (units >= 3000) return 6.0;
  if (units >= 2000) return 5.5;
  if (units >= 1000) return 5.3;
  if (units >= 500) return 5.0;
  if (units >= 300) return 4.0;
  return 3.0;
}

function scoreScaleInfrastructure(input: ZoneScoringInput): AxisScore {
  if (input.supplyUnits == null || input.supplyUnits <= 0) {
    return { value: null, detail: "세대수 미확보", status: "missing" };
  }
  const base = baseScaleScore(input.supplyUnits);
  const a = input.attributes ?? {};
  const parts: string[] = [`${input.supplyUnits.toLocaleString()}세대 → ${base}`];
  let mass = base;
  if (a.newTownPlan) {
    const before = mass;
    mass = Math.min(6.5, mass + 1.0);
    parts.push(`뉴타운 +${round1(mass - before)} (체급 상한 6.5)`);
  }
  let extra = 0;
  if (a.stationArea) {
    extra += 1.0;
    parts.push("역세권 +1");
  }
  if (a.doubleStation) {
    extra += 0.3;
    parts.push("중심·더블역세권 +0.3");
  }
  if (a.hanRiverTransit) {
    extra += 0.5;
    parts.push("한강벨트교통 +0.5");
  }
  if (a.gtxAccess) {
    extra += 0.3;
    parts.push("GTX +0.3");
  }
  if (a.parkWaterfront) {
    extra += 0.3;
    parts.push("공원·강·하천 +0.3");
  }
  if (a.mallAdjacent) {
    extra += 0.3;
    parts.push("대형몰 +0.3");
  }
  if (a.hospitalAdjacent) {
    extra += 0.2;
    parts.push("종합병원 +0.2");
  }
  if (a.schoolDistrict === "core") {
    extra += 1.0;
    parts.push("핵심학군 +1");
  } else if (a.schoolDistrict === "wide") {
    extra += 0.5;
    parts.push("범학군 +0.5");
  }
  if (a.schoolOnSite) {
    extra += 0.3;
    parts.push("초품아 +0.3");
  }
  return { value: round1(clamp(mass + extra, 0, 10)), detail: parts.join(" · "), status: "scored" };
}

/**
 * 6시 축 기준. 현재 구역 최소 실투자금 분포에서 한 번 구한다.
 * 화면을 열 때마다 다시 계산하지 않고, 육각형 데이터가 갱신될 때 같이 바뀐다.
 * 0점=최저, 5점=중간값, 7.5점=상위 25% 경계, 10점=최고. 높을수록 진입 장벽이 크다.
 */
export type InvestmentScale = {
  floorEok: number;
  medianEok: number;
  p75Eok: number;
  ceilingEok: number;
  count: number;
};

export function buildInvestmentScale(values: readonly number[]): InvestmentScale | null {
  const sorted = values.filter((v) => Number.isFinite(v) && v > 0).slice().sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const n = sorted.length;
  const medianEok =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return {
    floorEok: sorted[0],
    medianEok,
    p75Eok: sorted[Math.floor(0.75 * (n - 1))],
    ceilingEok: sorted[n - 1],
    count: n,
  };
}

function formatEok(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/** 차트 캡션·축 상세에 쓰는 현재 기준. */
export function investmentScaleCaption(scale: InvestmentScale): string {
  return `5점=${formatEok(scale.medianEok)}억(중간) · 7.5점=${formatEok(scale.p75Eok)}억(상위 25%) · 10점=${formatEok(scale.ceilingEok)}억`;
}

function investmentKnots(scale: InvestmentScale): Array<[number, number]> {
  const raw: Array<[number, number]> = [
    [scale.floorEok, 0],
    [scale.medianEok, 5],
    [scale.p75Eok, 7.5],
    [scale.ceilingEok, 10],
  ];
  const knots: Array<[number, number]> = [];
  for (const knot of raw) {
    const prev = knots[knots.length - 1];
    if (!prev || knot[0] > prev[0]) knots.push(knot);
    else if (knot[0] === prev[0]) prev[1] = Math.max(prev[1], knot[1]);
  }
  return knots;
}

export function investmentToScore(eok: number, scale: InvestmentScale): number {
  const knots = investmentKnots(scale);
  if (eok <= knots[0][0]) return knots[0][1];
  const last = knots[knots.length - 1];
  if (eok >= last[0]) return last[1];
  for (let i = 1; i < knots.length; i++) {
    const [x0, y0] = knots[i - 1];
    const [x1, y1] = knots[i];
    if (eok <= x1) {
      const t = (eok - x0) / (x1 - x0);
      return round1(clamp(y0 + t * (y1 - y0), 0, 10));
    }
  }
  return last[1];
}

function scoreFinancialBarrier(input: ZoneScoringInput, scale: InvestmentScale | null): AxisScore {
  if (input.minInvestmentBillion == null) {
    return { value: null, detail: "실투자금 미확보", status: "missing" };
  }
  if (scale == null) {
    return { value: null, detail: "투자금 기준 미계산", status: "missing" };
  }
  const score = investmentToScore(input.minInvestmentBillion, scale);
  const range =
    input.maxInvestmentBillion != null && input.maxInvestmentBillion !== input.minInvestmentBillion
      ? `${input.minInvestmentBillion}~${input.maxInvestmentBillion}억`
      : `${input.minInvestmentBillion}억`;
  return {
    value: score,
    detail: `실투자금 ${range} → ${score}점 (${investmentScaleCaption(scale)})`,
    status: "scored",
  };
}

// --- 8시 안정성·속도 ---
function scoreStabilitySpeed(input: ZoneScoringInput): AxisScore {
  if (!input.stage || !(input.stage in STAGE_BASE_SCORE)) {
    return {
      value: null,
      detail: input.stage ? `단계 "${input.stage}" 미매핑` : "단계 미확보",
      status: "missing",
    };
  }
  const base = STAGE_BASE_SCORE[input.stage];
  const a = input.attributes ?? {};
  const penalty = a.conflictPenalty ?? 0;
  const unionPrep =
    a.unionPrepApproved && UNION_PREP_BONUS_STAGES.has(input.stage) ? 0.5 : 0;
  const bonus = a.speedBonus ?? 0;
  const score = round1(clamp(base - penalty + unionPrep + bonus, 0, 10));
  const parts = [`${input.stage} 기본 ${base}`];
  if (penalty) parts.push(`갈등 -${penalty}`);
  if (unionPrep) parts.push("추진위 +0.5");
  if (bonus) parts.push(`가점 +${bonus}`);
  return { value: score, detail: parts.join(" · "), status: "scored" };
}

/** 10시 매트릭스. 스펙 §2.5 — 50% 이상은 급지 구분 없음, 그 아래만 상/중/하 차등. */
export function profitabilityFromMatrix(ratioPct: number, tierIndex: number): number {
  const band: 0 | 1 | 2 = tierIndex <= 2.6 ? 0 : tierIndex <= 3.5 ? 1 : 2;
  // 행: ratio 구간, 열: [상급지, 중급지, 하위급지]
  let row: number[];
  if (ratioPct >= 100) row = [10, 10, 10];
  else if (ratioPct >= 50) row = [9, 9, 9];
  else if (ratioPct >= 30) row = [8, 7, 6.5];
  else if (ratioPct >= 20) row = [7, 6.5, 5.0];
  else if (ratioPct >= 10) row = [5.5, 5.0, 4.0];
  else row = [3, 3, 3];
  return row[band];
}

function scoreProfitability(input: ZoneScoringInput, tier: LocationTierResult): AxisScore {
  if (input.memberUnits == null || input.memberUnits <= 0 || input.generalUnits == null) {
    return { value: null, detail: "조합원·일반분양 세대 미확보", status: "missing" };
  }
  if (tier.index == null) {
    return { value: null, detail: "급지 미지정(사업성 매트릭스 불가)", status: "missing" };
  }
  const ratioPct = round1((input.generalUnits / input.memberUnits) * 100);
  const score = profitabilityFromMatrix(ratioPct, tier.index);
  return {
    value: score,
    detail: `일반/조합원 ${input.generalUnits}/${input.memberUnits} = ${ratioPct}% → ${score}점`,
    status: "scored",
  };
}

// --- 형상 진단 (스펙 §5) ---
function diagnose(axes: Record<HexAxis, AxisScore>, minInvest: number | null): string[] {
  const s12 = axes.locationTier.value;
  const s2 = axes.productScarcity.value;
  const s4 = axes.scaleInfrastructure.value;
  const s8 = axes.stabilitySpeed.value;
  const s10 = axes.profitability.value;
  const out: string[] = [];
  if (s12 != null && minInvest != null && s12 >= 8.5 && minInvest <= 4.0) {
    out.push("상급지 소액 레버리지 진입형: 상급지이면서 초기 자금 부담이 적어 갭투자가 용이한 고가성비 구역입니다.");
  }
  if (s2 != null && s4 != null && s2 >= 8.5 && s4 >= 8.5) {
    out.push("신축 랜드마크 변모형: 대단지 스펙·브랜드·입지 희소성을 겸비해 지역 대장주로 변모할 구역입니다.");
  }
  if (s8 != null && s10 != null && s8 >= 8.5 && s10 >= 8.0) {
    out.push("사업 완결/안정추구형: 진행단계가 빠르고 일반분양 비율이 높아 사업 리스크가 적은 안정적 투자처입니다.");
  }
  if (s12 != null && minInvest != null && s12 >= 8.5 && minInvest >= 12.0) {
    out.push("고자본 메이저 구역: 성동·광진·마포·강남권 메이저 입지로 높은 초기 자본이 필요한 최상위 프리미엄 구역입니다.");
  }
  if (s10 != null && s8 != null && s10 >= 8.0 && s8 <= 5.5) {
    out.push("조합 갈등 경고형: 사업성은 높으나 진행단계 리스크가 커 주의가 필요한 구역입니다.");
  }
  return out;
}

/** 구역 1건 채점. scale은 현재 데이터셋의 투자금 분포. 없으면 6시 축은 미지정. */
export function scoreZone(input: ZoneScoringInput, scale: InvestmentScale | null = null): ZoneHexScore {
  const tier = resolveLocationTier({ naturalKey: input.naturalKey, dong: input.dong });
  const axes: Record<HexAxis, AxisScore> = {
    locationTier: scoreLocationTier(input, tier),
    productScarcity: scoreProductScarcity(input, tier),
    scaleInfrastructure: scoreScaleInfrastructure(input),
    financialBarrier: scoreFinancialBarrier(input, scale),
    stabilitySpeed: scoreStabilitySpeed(input),
    profitability: scoreProfitability(input, tier),
  };
  const scoredCount = (Object.keys(axes) as HexAxis[]).filter((k) => axes[k].status === "scored").length;
  return {
    naturalKey: input.naturalKey ?? null,
    zoneName: input.zoneName,
    axes,
    benchmarkName: input.benchmarkName ?? null,
    benchmarkPriceBillion: input.benchmarkPriceBillion ?? null,
    scoredCount,
    diagnosis: diagnose(axes, input.minInvestmentBillion),
  };
}

/** UI 라벨/각도 메타. 12시부터 시계방향. */
export const HEX_AXIS_META: Array<{ key: HexAxis; label: string; unit: "score" | "billion" }> = [
  { key: "locationTier", label: "급지", unit: "score" },
  { key: "productScarcity", label: "희소성·상품성", unit: "score" },
  { key: "scaleInfrastructure", label: "규모·생활편의", unit: "score" },
  { key: "financialBarrier", label: "필요 투자금", unit: "score" },
  { key: "stabilitySpeed", label: "안정성·속도", unit: "score" },
  { key: "profitability", label: "사업성", unit: "score" },
];
