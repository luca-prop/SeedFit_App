export type UnitType = "59" | "84";

export interface ZoneData {
  name: string;
  stage: string;
  data: Record<UnitType, { unitPrice: string; premium: string; futureValue: string }>;
}

export const ZONE_DATA: Record<string, ZoneData> = {
  "zone-1": {
    name: "노량진 1구역",
    stage: "관리처분인가",
    data: {
      "59": { unitPrice: "4억 8,000만 원", premium: "2억 5,000만 원", futureValue: "약 16억 원" },
      "84": { unitPrice: "6억 2,000만 원", premium: "3억 2,000만 원", futureValue: "약 21억 원" },
    },
  },
  "zone-2": {
    name: "한남 3구역",
    stage: "이주/철거",
    data: {
      "59": { unitPrice: "7억 원", premium: "5억 원", futureValue: "약 30억 원" },
      "84": { unitPrice: "9억 5,000만 원", premium: "7억 원", futureValue: "약 38억 원" },
    },
  },
  "zone-3": {
    name: "흑석 9구역",
    stage: "조합설립인가",
    data: {
      "59": { unitPrice: "3억 8,000만 원", premium: "2억 원", futureValue: "약 18억 원" },
      "84": { unitPrice: "5억 1,000만 원", premium: "2억 8,000만 원", futureValue: "약 24억 원" },
    },
  },
  "zone-4": {
    name: "수색 3구역",
    stage: "시공사선정",
    data: {
      "59": { unitPrice: "3억 2,000만 원", premium: "1억 5,000만 원", futureValue: "약 12억 원" },
      "84": { unitPrice: "4억 5,000만 원", premium: "2억 원", futureValue: "약 16억 원" },
    },
  },
};

export const COMPARISON_APTS = [
  { id: 1, name: "꿈의숲 아이파크", aptType: "84", recentPrice: "10.2억", recovery: 81.6, peakPrice: "12.5억", requiredInvestment: "3.8억", status: "good" as const },
  { id: 2, name: "상도 래미안 1차", aptType: "84", recentPrice: "9.5억", recovery: 72.0, peakPrice: "13.2억", requiredInvestment: "3.1억", status: "warning" as const },
  { id: 3, name: "대방 대림아파트", aptType: "59", recentPrice: "7.8억", recovery: 55.0, peakPrice: "14.2억", requiredInvestment: "2.8억", status: "danger" as const },
];

export const ZONE_NAMES: Record<string, string> = {
  "zone-1": "노량진 1구역",
  "zone-2": "한남 3구역",
  "zone-3": "흑석 9구역",
  "zone-4": "수색 3구역",
};

export const MOCK_PROPERTIES = [
  { id: 1, type: "다세대", price: "850,000,000", premium: "320,000,000", rightsPrice: "530,000,000", verified: true },
  { id: 2, type: "뚜껑", price: "450,000,000", premium: "210,000,000", rightsPrice: "240,000,000", verified: true },
  { id: 3, type: "빌라", price: "920,000,000", premium: "350,000,000", rightsPrice: "570,000,000", verified: false },
  { id: 4, type: "다세대", price: "880,000,000", premium: "330,000,000", rightsPrice: "550,000,000", verified: false },
];
