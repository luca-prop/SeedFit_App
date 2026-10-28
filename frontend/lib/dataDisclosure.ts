import seed from "@/lib/data/mvpReverseFilterSeed.json";

export const MVP_DATA_DISCLOSURE = {
  zoneDataBasis: `구역 큐레이션 기준일: ${seed.sourceDate}`,
  referencePriceBasis: "기축 기준가 기준일: 2026-05-03",
  sourceFileBasis: "원천 데이터: Golden Sample(재개발 마스터) · DATA_CURATION_SPEC.v.2 · 기축 기준가 데이터 세트",
  sourceReviewBasis: "운영팀이 공개 자료와 단지 기준가를 검수해 MVP 데이터에 반영합니다. 기축 84타입 시세 크롤은 아직 2026-05-03 세트입니다.",
  disclaimer:
    "본 데이터와 계산 결과는 투자 판단을 돕기 위한 참고용이며, 실제 매수 가능 가격·대출 가능 여부·세금은 금융기관 및 세무 전문가 확인이 필요합니다.",
} as const;
