/**
 * 12시 급지 산출. 스펙 `육각형비교tool.md` §1.2 급지표의 100점을 10점으로 나눈다.
 * 1.0~1.5 = 100점(10.0). Index≥1.6 = 100 − (Index − 1.5)×10.
 * 예: 성수 1.6=99점=9.9, 일원 1.9=96점=9.6, 마곡 3.0=85점=8.5, 갈현 4.0=75점=7.5.
 *
 * 급지 Index는 운영자의 급지표에 있는 지역만 부여한다. 표에 없는 동은
 * DONG_TIER_ESTIMATES가 있으면 추정, 없으면 null. null 구역의 12시·10시는 미지정.
 * 보정이 필요하면 LOCATION_TIER_OVERRIDES(구역 naturalKey 기준)로만 덮는다.
 */

/** 급지표의 각 Index에 속한 지역 토큰. 스펙 §1.2 표 그대로. */
const TIER_INDEX_AREAS: Array<{ index: number; areas: string[] }> = [
  { index: 1.0, areas: ["압구정"] },
  { index: 1.1, areas: ["반포"] },
  { index: 1.2, areas: ["잠원"] },
  { index: 1.3, areas: ["한남/앞"] },
  { index: 1.4, areas: ["대치", "이촌/동"] },
  { index: 1.5, areas: ["삼성", "도곡", "한남/뒤"] },
  { index: 1.6, areas: ["서초", "여의도", "한강로", "이태원", "성수"] },
  { index: 1.7, areas: ["잠실", "역삼", "개포", "방배/본"] },
  { index: 1.8, areas: ["신천", "방배"] },
  { index: 1.9, areas: ["일원"] },
  { index: 2.0, areas: ["목동/앞"] },
  { index: 2.1, areas: ["수서", "목동/뒤"] },
  { index: 2.2, areas: ["흑석", "가락", "방이", "둔촌"] },
  { index: 2.3, areas: ["마포", "옥수", "노량진", "이촌/서", "과천", "염리"] },
  { index: 2.4, areas: ["광장", "자양", "문정", "아현", "금호", "공덕", "후암"] },
  { index: 2.5, areas: ["왕십리", "구의", "사당", "수내", "정자", "대흥", "신수", "서계", "청파"] },
  { index: 2.6, areas: ["고덕", "북아현", "당산", "자곡", "서현", "명일", "대방"] },
  { index: 2.7, areas: ["상도", "신당"] },
  { index: 2.8, areas: ["신길", "거여", "마천"] },
  { index: 2.9, areas: ["청량리"] },
  { index: 3.0, areas: ["마곡", "암사"] },
  { index: 3.1, areas: ["신도림", "전농", "답십리"] },
  { index: 3.2, areas: ["신정", "천호"] },
  { index: 3.3, areas: ["이문", "철산", "제기"] },
  // 신월곡 1구역의 행정동은 하월곡동이라 두 토큰을 같은 급지로 둔다.
  { index: 3.4, areas: ["길음", "보문", "염창", "가양", "가재울", "월계", "신월곡", "하월곡"] },
  { index: 3.5, areas: ["봉천", "홍제", "광운대", "산성", "광명", "수지", "장위", "방화", "미아", "수진", "신흥"] },
  { index: 3.6, areas: ["상암", "신림", "녹번", "중화"] },
  { index: 3.7, areas: ["덕은", "상봉", "불광", "대조", "수택", "독산"] },
  { index: 3.8, areas: ["연신내"] },
  { index: 4.0, areas: ["갈현"] },
];

/** 토큰 → Index (슬래시 토큰은 애매하므로 세부 매칭에만 쓴다). */
const AREA_TO_INDEX = new Map<string, number>();
for (const { index, areas } of TIER_INDEX_AREAS) {
  for (const area of areas) {
    if (!AREA_TO_INDEX.has(area)) AREA_TO_INDEX.set(area, index);
  }
}

/** 동 이름에서 급지 토큰 후보를 만든다. "성수동"→"성수", "금호동3가"→"금호". */
function dongToToken(dong: string): string {
  return dong.replace(/\d+가$/u, "").replace(/동$/u, "");
}

/** 운영자 확정 오버라이드. 이촌은 동/서를 구역마다 확인한다. */
export const LOCATION_TIER_OVERRIDES: Record<string, number> = {
  "용산구|이촌동|이촌1구역(재건축)": 2.3, // 이촌/서
};

/**
 * 급지표(SoT)에 없는 동의 인접 급지 기반 추정값(동 토큰 기준).
 * 공식 표 값이 아니라 운영자 조정 대상 — source="estimate"로 구분 표기한다.
 * 근거: 표에 등재된 인접 지역의 Index에 지리적 위계를 맞춰 보간.
 */
export const DONG_TIER_ESTIMATES: Record<string, number> = {
  중곡: 2.8, // 구의(2.5)·군자 인접
  용두: 2.8, // 청량리(2.9)·왕십리 인접
  사근: 2.6, // 왕십리(2.5)·한양대 인접
  용답: 2.9, // 답십리(3.1)·장안 인접
  행당: 2.5, // 왕십리(2.5) 인접
  용산: 2.0, // 한강로(1.6)·용산역 인접
  원효로: 2.2, // 신용산 인접
};

export type LocationTierResult = {
  index: number | null;
  score: number | null;
  source: "override" | "dong" | "estimate" | "none";
  matchedArea: string | null;
};

/** 급지 점수. Index 없으면 null. */
export function resolveLocationTier(input: {
  naturalKey?: string | null;
  dong: string;
}): LocationTierResult {
  const override = input.naturalKey ? LOCATION_TIER_OVERRIDES[input.naturalKey] : undefined;
  if (typeof override === "number") {
    return { index: override, score: tierScore(override), source: "override", matchedArea: null };
  }

  const token = dongToToken(input.dong);
  const index = AREA_TO_INDEX.get(token);
  if (typeof index === "number") {
    return { index, score: tierScore(index), source: "dong", matchedArea: token };
  }

  const estimate = DONG_TIER_ESTIMATES[token];
  if (typeof estimate === "number") {
    return { index: estimate, score: tierScore(estimate), source: "estimate", matchedArea: token };
  }

  return { index: null, score: null, source: "none", matchedArea: null };
}

/** 급지표 100점. 1.0~1.5는 100, 이후 Index 0.1마다 1점. */
export function tierHundredPoints(index: number): number {
  if (index <= 1.5) return 100;
  return Math.round(100 - (index - 1.5) * 10);
}

/** 12시 점수 = 급지표 100점 / 10. */
export function tierScore(index: number): number {
  return round1(tierHundredPoints(index) / 10);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
