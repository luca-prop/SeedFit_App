/**
 * Results / reverse-filter X-axis stage buckets.
 * SoT: docs/DATA_CURATION_SPEC.v.2.md §4.0
 *
 * 사업시행자 지정 contains the substring "사업시행", so it must be matched
 * before the generic 사업시행(인가) bucket. Spec maps it to 조합설립 (step 3).
 */
export type StageAxisLabel =
  | "추진준비"
  | "구역지정"
  | "조합설립"
  | "시공사"
  | "사업시행"
  | "관리처분"
  | "이주철거"
  | "착공";

export function stageAxisLabelFor(stage: string): StageAxisLabel {
  const normalized = stage.replace(/\s+/g, "");

  if (normalized.includes("착공")) return "착공";
  if (normalized.includes("이주") || normalized.includes("철거")) return "이주철거";
  if (normalized.includes("관리처분")) return "관리처분";
  // Before "사업시행" — otherwise "사업시행자지정" wrongly becomes 사업시행.
  if (normalized.includes("조합설립") || normalized.includes("사업시행자지정")) return "조합설립";
  if (normalized.includes("사업시행")) return "사업시행";
  if (normalized.includes("시공사") || normalized.includes("건축심의")) return "시공사";
  if (normalized.includes("구역지정") || normalized.includes("관리계획고시") || normalized.includes("추진위")) {
    return "구역지정";
  }

  return "추진준비";
}
