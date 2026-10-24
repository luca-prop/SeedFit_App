/**
 * 12시 급지 산출. 스펙 `육각형비교tool.md` §1 의 급지표를 그대로 옮긴다.
 * Score12 = 10.0 - (Index - 1.0).
 *
 * 급지 Index는 운영자의 급지표에 있는 지역만 부여한다. 표에 없는 동은 null —
 * 추정하지 않는다. null 구역의 12시·10시(급지 결합)는 "미지정"으로 둔다.
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
  { index: 1.6, areas: ["서초", "여의도", "한강로", "성수"] },
  { index: 1.7, areas: ["잠실", "역삼", "개포", "방배/본"] },
  { index: 1.8, areas: ["신천", "방배"] },
  { index: 1.9, areas: ["일원"] },
  { index: 2.0, areas: ["목동/앞"] },
  { index: 2.1, areas: ["수서", "목동/뒤"] },
  { index: 2.2, areas: ["흑석", "가락", "방이", "둔촌"] },
  { index: 2.3, areas: ["마포", "옥수", "노량진", "이촌/서", "과천"] },
  { index: 2.4, areas: ["광장", "자양", "문정", "아현", "금호"] },
  { index: 2.5, areas: ["왕십리", "구의", "사당", "수내", "정자"] },
  { index: 2.6, areas: ["고덕", "북아현", "당산", "자곡", "서현"] },
  { index: 2.7, areas: ["명일"] },
  { index: 2.8, areas: ["상도", "신길", "신당"] },
  { index: 2.9, areas: ["청량리", "거여"] },
  { index: 3.0, areas: ["마곡", "암사"] },
  { index: 3.1, areas: ["신도림", "답십리"] },
  { index: 3.2, areas: ["신정", "천호"] },
  { index: 3.3, areas: ["이문", "철산"] },
  { index: 3.4, areas: ["길음", "보문", "염창", "가양", "가재울"] },
  { index: 3.5, areas: ["봉천", "홍제", "광운대", "산성", "광명", "수지", "장위", "방화"] },
  { index: 3.6, areas: ["상암", "신림"] },
  { index: 3.7, areas: ["덕은", "상봉"] },
  { index: 3.8, areas: ["연신내", "녹번"] },
  { index: 3.9, areas: ["월계"] },
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

/** 운영자 확정 오버라이드 (구역 naturalKey 기준). 표에 없거나 애매한 구역만. */
export const LOCATION_TIER_OVERRIDES: Record<string, number> = {
  // 예: "동작구|대방동|노량진 7구역": 2.3,
};

export type LocationTierResult = {
  index: number | null;
  score: number | null;
  source: "override" | "dong" | "none";
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

  return { index: null, score: null, source: "none", matchedArea: null };
}

export function tierScore(index: number): number {
  return round1(10.0 - (index - 1.0) * 1.0);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
