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
  | "productScarcity" // 2시 상품성·희소성
  | "scaleInfrastructure" // 4시 규모·인프라
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
  /** 실투자금 최소/최대 (억). 6시 축에 그대로 바인딩. */
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
  // 2시 상품성
  hanRiverBelt?: boolean; // 한강벨트 +1.5
  highEndBrand?: boolean; // 하이엔드 브랜드 확정 +0.5
  riverView?: "full" | "partial" | null; // 조망 +0.5 / +0.3
  schoolDistrict?: "top" | "good" | null; // 학군 +0.5 / +0.3
  // 4시 인프라
  mallAdjacent?: boolean; // 대형몰 인접 +0.5
  stationDevelopment?: boolean; // 역세권/교통호재 +0.25
  newTownPlan?: boolean; // 신도시/뉴타운 통합개발 +0.5
  // 8시 안정성
  conflictPenalty?: number; // 조합 갈등/소송 감점 (0~3)
  speedBonus?: number; // 추가 가점 (0~0.5)
};

export type AxisScore = {
  /** 레이더에 그릴 값. locationTier/productScarcity/scaleInfrastructure/
   * stabilitySpeed/profitability 는 0~10 점수, financialBarrier 는 억 원 물리값. */
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

/** 우리 단계 라벨 → 스펙 Base_Stage_Score. 미지정은 null. */
const STAGE_BASE_SCORE: Record<string, number> = {
  "관리처분인가": 9.0,
  "사업시행인가": 8.5,
  "건축심의": 8.0,
  "사업시행자 지정": 8.0,
  "시공사 선정": 8.0,
  "조합설립인가": 7.5,
  "정비구역지정": 6.5,
  "정비구역 지정": 6.5,
  "(모아)통합심의통과": 6.0,
  "(모아)관리계획고시": 5.5,
  "(모아)관리계획수립": 5.5,
  "신속통합기획 완료": 5.5,
  "신속통합기획 대상지 선정": 5.0,
  "(모아)대상지 선정": 5.0,
  "연번 부여": 4.0,
  "추진위 승인": 3.5,
  "추진준비": 3.0,
  // "대상지철회" → 미지정(null)
};

const GANGNAM3 = new Set(["서초구", "강남구", "송파구"]);

// --- 12시 급지 ---
function scoreLocationTier(input: ZoneScoringInput, tier: LocationTierResult): AxisScore {
  if (tier.score == null) {
    return { value: null, detail: "급지표 미등록 지역 (급지 미지정)", status: "missing" };
  }
  return {
    value: tier.score,
    detail: `급지 Index ${tier.index} → ${tier.score}점`,
    status: "scored",
  };
}

// --- 2시 상품성·희소성 ---
function scoreProductScarcity(input: ZoneScoringInput): AxisScore {
  let score = 7.0;
  const parts: string[] = ["기본 7.0"];
  const a = input.attributes ?? {};
  if (GANGNAM3.has(input.district)) {
    score += 2.0;
    parts.push("강남3구 +2.0");
  }
  if (a.hanRiverBelt) {
    score += 1.5;
    parts.push("한강벨트 +1.5");
  }
  if (a.highEndBrand) {
    score += 0.5;
    parts.push("하이엔드 +0.5");
  }
  if (a.riverView === "full") {
    score += 0.5;
    parts.push("한강조망 +0.5");
  } else if (a.riverView === "partial") {
    score += 0.3;
    parts.push("한강조망 +0.3");
  }
  if (a.schoolDistrict === "top") {
    score += 0.5;
    parts.push("학군 +0.5");
  } else if (a.schoolDistrict === "good") {
    score += 0.3;
    parts.push("학군 +0.3");
  }
  return { value: round1(clamp(score, 0, 10)), detail: parts.join(" · "), status: "scored" };
}

// --- 4시 규모·인프라 ---
function baseScaleScore(units: number): number {
  if (units >= 5000) return 10.0;
  if (units >= 3000) return 9.5;
  if (units >= 2000) return 9.0;
  if (units >= 1000) return 8.5;
  if (units >= 500) return 7.5;
  // <500: 3.0~6.0 선형
  return round1(clamp(3.0 + (units / 500) * 3.0, 3.0, 6.0));
}

function scoreScaleInfrastructure(input: ZoneScoringInput): AxisScore {
  if (input.supplyUnits == null || input.supplyUnits <= 0) {
    return { value: null, detail: "세대수 미확보", status: "missing" };
  }
  let score = baseScaleScore(input.supplyUnits);
  const parts: string[] = [`${input.supplyUnits.toLocaleString()}세대 → 기본 ${score}`];
  const a = input.attributes ?? {};
  if (a.mallAdjacent) {
    score += 0.5;
    parts.push("대형몰 +0.5");
  }
  if (a.stationDevelopment) {
    score += 0.25;
    parts.push("교통호재 +0.25");
  }
  if (a.newTownPlan) {
    score += 0.5;
    parts.push("통합개발 +0.5");
  }
  return { value: round1(clamp(score, 0, 10)), detail: parts.join(" · "), status: "scored" };
}

// --- 6시 필요 투자금 (억 물리값) ---
function scoreFinancialBarrier(input: ZoneScoringInput): AxisScore {
  if (input.minInvestmentBillion == null) {
    return { value: null, detail: "실투자금 미확보", status: "missing" };
  }
  const detail =
    input.maxInvestmentBillion != null && input.maxInvestmentBillion !== input.minInvestmentBillion
      ? `실투자금 ${input.minInvestmentBillion}~${input.maxInvestmentBillion}억 (최소 바인딩)`
      : `실투자금 ${input.minInvestmentBillion}억`;
  return { value: input.minInvestmentBillion, detail, status: "scored" };
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
  const bonus = a.speedBonus ?? 0;
  const score = round1(clamp(base - penalty + bonus, 0, 10));
  const parts = [`${input.stage} 기본 ${base}`];
  if (penalty) parts.push(`갈등 -${penalty}`);
  if (bonus) parts.push(`가점 +${bonus}`);
  return { value: score, detail: parts.join(" · "), status: "scored" };
}

// --- 10시 사업성 (일반분양/조합원 비율 × 급지군) ---
function profitabilityFromMatrix(ratioPct: number, tierIndex: number): number {
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

/** 구역 1건 채점. */
export function scoreZone(input: ZoneScoringInput): ZoneHexScore {
  const tier = resolveLocationTier({ naturalKey: input.naturalKey, dong: input.dong });
  const axes: Record<HexAxis, AxisScore> = {
    locationTier: scoreLocationTier(input, tier),
    productScarcity: scoreProductScarcity(input),
    scaleInfrastructure: scoreScaleInfrastructure(input),
    financialBarrier: scoreFinancialBarrier(input),
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
  { key: "productScarcity", label: "상품성·희소성", unit: "score" },
  { key: "scaleInfrastructure", label: "규모·인프라", unit: "score" },
  { key: "financialBarrier", label: "필요 투자금(억)", unit: "billion" },
  { key: "stabilitySpeed", label: "안정성·속도", unit: "score" },
  { key: "profitability", label: "사업성", unit: "score" },
];
