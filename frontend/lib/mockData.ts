export type UnitType = "59" | "84";

export interface ZoneData {
  name: string;
  stage: string;
  district: string;
  minBudget: number;
  data: Record<UnitType, { unitPrice: string; premium: string; totalInvestment: string; futureValue: string; refAptName?: string }>;
}

export const ZONE_DATA: Record<string, ZoneData> = {
  "zone-1": {
    name: "청파 1구역",
    district: "용산구",
    stage: "시공사선정",
    minBudget: 1170000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-2": {
    name: "후암1구역(재건축)",
    district: "용산구",
    stage: "추진위 승인",
    minBudget: 1330000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-3": {
    name: "서계통합",
    district: "용산구",
    stage: "추진위 승인",
    minBudget: 670000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-4": {
    name: "청파 2구역",
    district: "용산구",
    stage: "정비구역지정",
    minBudget: 550000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-5": {
    name: "이촌1구역(재건축)",
    district: "용산구",
    stage: "정비구역지정",
    minBudget: 1150000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-6": {
    name: "동후암 1구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 459999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-7": {
    name: "동후암 3구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 600000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-8": {
    name: "청파 3구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 300000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-9": {
    name: "원효로3가 2-2",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 650000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억", refAptName: "이촌한가람" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억", refAptName: "이촌한가람" },
    },
  },
  "zone-10": {
    name: "용산 1구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 980000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-11": {
    name: "남산 1구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 620000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-12": {
    name: "용산 3구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 660000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-13": {
    name: "이태원 1구역",
    district: "용산구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 1000000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-14": {
    name: "남산 3구역",
    district: "용산구",
    stage: "연번 부여",
    minBudget: 400000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-15": {
    name: "용산 4구역",
    district: "용산구",
    stage: "연번 부여",
    minBudget: 380000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-16": {
    name: "남산 2구역",
    district: "용산구",
    stage: "연변 부여",
    minBudget: 450000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-17": {
    name: "동후암 2구역",
    district: "용산구",
    stage: "연번 부여",
    minBudget: 400000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억 (분양권)", refAptName: "이촌한가람  / 마포자이힐스테이트라첼스 30.6억" },
    },
  },
  "zone-18": {
    name: "원효로3가 1구역",
    district: "용산구",
    stage: "연번 부여",
    minBudget: 690000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억", refAptName: "이촌한가람" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "30.2억", refAptName: "이촌한가람" },
    },
  },
  "zone-19": {
    name: "금호 16구역",
    district: "성동구",
    stage: "관리처분인가",
    minBudget: 1450000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
    },
  },
  "zone-20": {
    name: "금호 21구역",
    district: "성동구",
    stage: "시공사 선정",
    minBudget: 1300000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
    },
  },
  "zone-21": {
    name: "용답 2구역",
    district: "성동구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 409999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.3억 (분양권)", refAptName: "성동리버뷰자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.3억 (분양권)", refAptName: "성동리버뷰자이" },
    },
  },
  "zone-22": {
    name: "사근동 190-2",
    district: "성동구",
    stage: "연번 부여",
    minBudget: 220000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27억", refAptName: "라체르보푸르지오써밋" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27억", refAptName: "라체르보푸르지오써밋" },
    },
  },
  "zone-23": {
    name: "금호 22구역",
    district: "성동구",
    stage: "연번 부여",
    minBudget: 250000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
    },
  },
  "zone-24": {
    name: "용답 1구역",
    district: "성동구",
    stage: "연번 부여",
    minBudget: 320000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.3억 (분양권)", refAptName: "성동리버뷰자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.3억 (분양권)", refAptName: "성동리버뷰자이" },
    },
  },
  "zone-25": {
    name: "금호 23구역",
    district: "성동구",
    stage: "연번 부여",
    minBudget: 690000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
    },
  },
  "zone-26": {
    name: "자양 7구역",
    district: "광진구",
    stage: "시공사 선정",
    minBudget: 1689999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-27": {
    name: "자양4동 A구역",
    district: "광진구",
    stage: "정비구역 지정",
    minBudget: 1150000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-28": {
    name: "자양2동 681(모아타운)",
    district: "광진구",
    stage: "(모아)통합심의통과",
    minBudget: 390000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-29": {
    name: "자양1동 779(모아타운)",
    district: "광진구",
    stage: "(모아)통합심의통과",
    minBudget: 430000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-30": {
    name: "자양2동 649(B)(모아타운)",
    district: "광진구",
    stage: "(모아)통합심의통과",
    minBudget: 580000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-31": {
    name: "자양동 772-1(건대모아)",
    district: "광진구",
    stage: "(모아)관리계획수립",
    minBudget: 470000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-32": {
    name: "자양동 227-147",
    district: "광진구",
    stage: "정비구역 지정",
    minBudget: 640000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-33": {
    name: "중곡 1구역(A5)",
    district: "광진구",
    stage: "신속통합기획 완료",
    minBudget: 599000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
    },
  },
  "zone-34": {
    name: "구의동 46",
    district: "광진구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 330000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
    },
  },
  "zone-35": {
    name: "자양2동 663(C)(모아타운)",
    district: "광진구",
    stage: "(모아)대상지 선정",
    minBudget: 520000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-36": {
    name: "자양1동 593(A)(모아타운)",
    district: "광진구",
    stage: "(모아)대상지 선정",
    minBudget: 630000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-37": {
    name: "중곡동 232-1(A4)",
    district: "광진구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 200000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
    },
  },
  "zone-38": {
    name: "구의1동 221-1",
    district: "광진구",
    stage: "연번 부여",
    minBudget: 400000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
    },
  },
  "zone-39": {
    name: "구의동 32",
    district: "광진구",
    stage: "연번 부여",
    minBudget: 600000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20억", refAptName: "래미안구의파크스위트" },
    },
  },
  "zone-40": {
    name: "자양동 629(모아타운)",
    district: "광진구",
    stage: "추진준비",
    minBudget: 340000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "26.8억", refAptName: "롯데캐슬이스트폴" },
    },
  },
  "zone-41": {
    name: "사당 5구역(재건축)",
    district: "동작구",
    stage: "사업시행인가",
    minBudget: 700000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-42": {
    name: "상도 15구역",
    district: "동작구",
    stage: "사업시행자 지정",
    minBudget: 600000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-43": {
    name: "상도 14구역",
    district: "동작구",
    stage: "사업시행자 지정",
    minBudget: 470000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-44": {
    name: "사당 17구역",
    district: "동작구",
    stage: "추진위 승인",
    minBudget: 1200000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-45": {
    name: "사당 12구역",
    district: "동작구",
    stage: "추진위 승인",
    minBudget: 680000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-46": {
    name: "상도 16구역",
    district: "동작구",
    stage: "추진위 승인",
    minBudget: 229999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-47": {
    name: "상도 21구역(모아타운)",
    district: "동작구",
    stage: "(모아)관리계획고시",
    minBudget: 450000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-48": {
    name: "사당 16구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 540000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-49": {
    name: "상도 23구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 484999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-50": {
    name: "흑석 10구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 700000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "추후 업데이트", refAptName: "" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "추후 업데이트", refAptName: "" },
    },
  },
  "zone-51": {
    name: "사당 15구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 550000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-52": {
    name: "사당 21구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 370000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-53": {
    name: "사당 18구역",
    district: "동작구",
    stage: "연번 부여",
    minBudget: 280000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.5억", refAptName: "래미안로이파크" },
    },
  },
  "zone-54": {
    name: "상도 25구역",
    district: "동작구",
    stage: "연번 부여",
    minBudget: 320000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.6억", refAptName: "e편한세상상도노빌리티" },
    },
  },
  "zone-55": {
    name: "노량진 14구역",
    district: "동작구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 819999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "추후 업데이트", refAptName: "" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "추후 업데이트", refAptName: "" },
    },
  },
  "zone-56": {
    name: "염리 4구역",
    district: "마포구",
    stage: "추진위설립",
    minBudget: 869999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
    },
  },
  "zone-57": {
    name: "염리 5구역",
    district: "마포구",
    stage: "정비구역지정",
    minBudget: 950000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
    },
  },
  "zone-58": {
    name: "신수 13구역",
    district: "마포구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 600000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "25.2억", refAptName: "신촌숲아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "25.2억", refAptName: "신촌숲아이파크" },
    },
  },
  "zone-59": {
    name: "대흥 5구역",
    district: "마포구",
    stage: "연번 부여",
    minBudget: 490000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
    },
  },
  "zone-60": {
    name: "신길 16-2구역",
    district: "영등포구",
    stage: "신속통합기획 확정",
    minBudget: 370000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.5억", refAptName: "힐스테이트클래시안" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.5억", refAptName: "힐스테이트클래시안" },
    },
  },
  "zone-61": {
    name: "여의대방신길 2구역",
    district: "영등포구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 340000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.5억", refAptName: "힐스테이트클래시안" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "20.5억", refAptName: "힐스테이트클래시안" },
    },
  },
  "zone-62": {
    name: "전농 8구역",
    district: "동대문구",
    stage: "조합설립인가",
    minBudget: 919999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
    },
  },
  "zone-63": {
    name: "전농 15구역",
    district: "동대문구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 180000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
    },
  },
  "zone-64": {
    name: "전농 10구역",
    district: "동대문구",
    stage: "연번 부여",
    minBudget: 229999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
    },
  },
  "zone-65": {
    name: "용두 7구역",
    district: "동대문구",
    stage: "연번 부여",
    minBudget: 315000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "18억", refAptName: "래미안크레시티" },
    },
  },
  "zone-66": {
    name: "장위 14구역",
    district: "성북구",
    stage: "시공사 선정",
    minBudget: 380000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
    },
  },
  "zone-67": {
    name: "장위 15구역",
    district: "성북구",
    stage: "시공사 선정",
    minBudget: 450000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
    },
  },
  "zone-68": {
    name: "장위 13-1구역",
    district: "성북구",
    stage: "신속통합기획 완료",
    minBudget: 160000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
    },
  },
  "zone-69": {
    name: "장위 13-2구역",
    district: "성북구",
    stage: "신속통합기획 완료",
    minBudget: 180000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "17.73억 (분양권)", refAptName: "서울원아이파크" },
    },
  },
  "zone-70": {
    name: "수택 2구역",
    district: "구리시",
    stage: "조합설립인가",
    minBudget: 260000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "13.5억", refAptName: "e편한세상인창어반포레" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "13.5억", refAptName: "e편한세상인창어반포레" },
    },
  },
  "zone-71": {
    name: "중화 6구역",
    district: "중랑구",
    stage: "정비구역지정",
    minBudget: 150000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "14.95억", refAptName: "사가정센트럴아이파크" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "14.95억", refAptName: "사가정센트럴아이파크" },
    },
  },
  "zone-72": {
    name: "신정 1구역",
    district: "양천구",
    stage: "신속통합기획 대상지 선정",
    minBudget: 300000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "21.3억", refAptName: "목동힐스테이트" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "21.3억", refAptName: "목동힐스테이트" },
    },
  },
  "zone-73": {
    name: "신흥 1구역",
    district: "성남시 수정구",
    stage: "사업시행인가",
    minBudget: 560000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
    },
  },
  "zone-74": {
    name: "수진 1구역",
    district: "성남시 수정구",
    stage: "사업시행인가",
    minBudget: 650000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
    },
  },
  "zone-75": {
    name: "신흥 3구역",
    district: "성남시 수정구",
    stage: "시공사 선정",
    minBudget: 509999999,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "15.73억 (분양권)", refAptName: "산성역 헤리스톤" },
    },
  },
  "zone-76": {
    name: "마천 3구역",
    district: "송파구",
    stage: "사업시행인가",
    minBudget: 900000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.3억", refAptName: "송파시그니처롯데캐슬" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.3억", refAptName: "송파시그니처롯데캐슬" },
    },
  },
  "zone-77": {
    name: "마천 1구역",
    district: "송파구",
    stage: "조합설립인가",
    minBudget: 700000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.3억", refAptName: "송파시그니처롯데캐슬" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "22.3억", refAptName: "송파시그니처롯데캐슬" },
    },
  },
  "zone-78": {
    name: "북아현 2구역",
    district: "서대문구",
    stage: "관리처분인가",
    minBudget: 1430000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
    },
  },
  "zone-79": {
    name: "북아현 3구역",
    district: "서대문구",
    stage: "사업시행인가",
    minBudget: 1050000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "29.6억", refAptName: "마포프레스티지자이" },
    },
  },
  "zone-80": {
    name: "신당 10구역",
    district: "중구",
    stage: "시공사 선정",
    minBudget: 1100000000,
    data: {
      "59": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
      "84": { unitPrice: "추후 업데이트", premium: "추후 업데이트", totalInvestment: "추후 업데이트", futureValue: "27.5억", refAptName: "옥수파크힐스" },
    },
  },
};

export const COMPARISON_APTS = [
  { id: 1, name: "SK북한산시티", aptType: "59", recentPrice: "7.00억", recovery: 89.7, peakPrice: "7.80억", requiredInvestment: "2.10억", numInvestment: 210000000, status: "good" as const },
  { id: 2, name: "하계장미", aptType: "84", recentPrice: "7.30억", recovery: 95.4, peakPrice: "7.65억", requiredInvestment: "2.19억", numInvestment: 219000000, status: "good" as const },
  { id: 3, name: "주공뜨란채", aptType: "59", recentPrice: "8.00억", recovery: 103.2, peakPrice: "7.75억", requiredInvestment: "2.40억", numInvestment: 240000000, status: "good" as const },
  { id: 4, name: "다산e편한세상자이", aptType: "59", recentPrice: "8.40억", recovery: 94.4, peakPrice: "8.90억", requiredInvestment: "2.52억", numInvestment: 252000000, status: "good" as const },
  { id: 5, name: "월계동신", aptType: "84", recentPrice: "8.70억", recovery: 111.5, peakPrice: "7.80억", requiredInvestment: "2.70억", numInvestment: 270000000, status: "good" as const },
  { id: 6, name: "초원마을대원", aptType: "59", recentPrice: "9.70억", recovery: 118.3, peakPrice: "8.20억", requiredInvestment: "3.70억", numInvestment: 370000000, status: "good" as const },
  { id: 7, name: "이문동 쌍용", aptType: "59", recentPrice: "10.00억", recovery: 118.1, peakPrice: "8.47억", requiredInvestment: "4.00억", numInvestment: 400000000, status: "good" as const },
  { id: 8, name: "염창동아1차", aptType: "59", recentPrice: "10.70억", recovery: 124.4, peakPrice: "8.60억", requiredInvestment: "4.70억", numInvestment: 470000000, status: "good" as const },
  { id: 9, name: "관악드림타운", aptType: "59", recentPrice: "11.00억", recovery: 117.0, peakPrice: "9.40억", requiredInvestment: "5.00억", numInvestment: 500000000, status: "good" as const },
  { id: 10, name: "신정마을주공1", aptType: "59", recentPrice: "11.80억", recovery: 131.8, peakPrice: "8.95억", requiredInvestment: "5.80억", numInvestment: 580000000, status: "good" as const },
  { id: 11, name: "철산래미안자이", aptType: "59", recentPrice: "12.40억", recovery: 124.0, peakPrice: "10.00억", requiredInvestment: "6.40억", numInvestment: 640000000, status: "good" as const },
  { id: 12, name: "꿈의숲아이파크", aptType: "59", recentPrice: "12.60억", recovery: 118.9, peakPrice: "10.60억", requiredInvestment: "6.60억", numInvestment: 660000000, status: "good" as const },
  { id: 13, name: "길음뉴타운6단지", aptType: "59", recentPrice: "13.30억", recovery: 129.1, peakPrice: "10.30억", requiredInvestment: "7.30억", numInvestment: 730000000, status: "good" as const },
  { id: 14, name: "장위자이레디언트", aptType: "59", recentPrice: "13.85억", recovery: 85.0, peakPrice: "15.9억", requiredInvestment: "7.85억", numInvestment: 785000000, status: "good" as const },
  { id: 15, name: "우장산힐스테이트", aptType: "59", recentPrice: "14.50억", recovery: 120.8, peakPrice: "12.00억", requiredInvestment: "8.50억", numInvestment: 850000000, status: "good" as const },
  { id: 16, name: "신당동 삼성", aptType: "59", recentPrice: "14.95억", recovery: 135.9, peakPrice: "11.00억", requiredInvestment: "8.95억", numInvestment: 894999999, status: "good" as const },
  { id: 17, name: "롯데캐슬클라시아", aptType: "59", recentPrice: "15.00억", recovery: 118.1, peakPrice: "12.70억", requiredInvestment: "9.00억", numInvestment: 900000000, status: "good" as const },
  { id: 18, name: "래미안크레시티", aptType: "59", recentPrice: "15.60억", recovery: 115.4, peakPrice: "13.52억", requiredInvestment: "11.60억", numInvestment: 1160000000, status: "good" as const },
  { id: 19, name: "행당한진타운", aptType: "59", recentPrice: "16.50억", recovery: 136.9, peakPrice: "12.05억", requiredInvestment: "12.50억", numInvestment: 1250000000, status: "good" as const },
  { id: 20, name: "사당우성2", aptType: "59", recentPrice: "16.70억", recovery: 134.7, peakPrice: "12.40억", requiredInvestment: "12.70억", numInvestment: 1270000000, status: "good" as const },
  { id: 21, name: "고덕센트럴IPARK", aptType: "59", recentPrice: "17.00억", recovery: 117.2, peakPrice: "14.50억", requiredInvestment: "13.00억", numInvestment: 1300000000, status: "good" as const },
  { id: 22, name: "상도더샵1차", aptType: "59", recentPrice: "17.50억", recovery: 135.7, peakPrice: "12.90억", requiredInvestment: "13.50억", numInvestment: 1350000000, status: "good" as const },
  { id: 23, name: "송파시그니처롯데캐슬", aptType: "59", recentPrice: "18.00억", recovery: 125.9, peakPrice: "14.30억", requiredInvestment: "14.00억", numInvestment: 1400000000, status: "good" as const },
  { id: 24, name: "래미안에스티움", aptType: "59", recentPrice: "18.50억", recovery: 133.1, peakPrice: "13.90억", requiredInvestment: "14.50억", numInvestment: 1450000000, status: "good" as const },
  { id: 25, name: "서울역센트럴자이", aptType: "59", recentPrice: "19.40억", recovery: 121.2, peakPrice: "16.00억", requiredInvestment: "15.40억", numInvestment: 1540000000, status: "good" as const },
  { id: 26, name: "옥수삼성", aptType: "59", recentPrice: "19.70억", recovery: 138.7, peakPrice: "14.20억", requiredInvestment: "15.70억", numInvestment: 1570000000, status: "good" as const },
  { id: 27, name: "센트라스", aptType: "59", recentPrice: "20.30억", recovery: 132.7, peakPrice: "15.30억", requiredInvestment: "16.30억", numInvestment: 1630000000, status: "good" as const },
  { id: 28, name: "당산센트럴아이파크", aptType: "59", recentPrice: "20.50억", recovery: 132.3, peakPrice: "15.50억", requiredInvestment: "16.50억", numInvestment: 1650000000, status: "good" as const },
  { id: 29, name: "공덕자이", aptType: "59", recentPrice: "21.30억", recovery: 85.0, peakPrice: "24.5억", requiredInvestment: "17.30억", numInvestment: 1730000000, status: "good" as const },
  { id: 30, name: "마포래미안푸르지오", aptType: "59", recentPrice: "21.50억", recovery: 126.5, peakPrice: "17.00억", requiredInvestment: "17.50억", numInvestment: 1750000000, status: "good" as const },
  { id: 31, name: "과천푸르지오써밋", aptType: "59", recentPrice: "22.60억", recovery: 129.9, peakPrice: "17.40억", requiredInvestment: "18.60억", numInvestment: 1860000000, status: "good" as const },
  { id: 32, name: "광장힐스테이트", aptType: "59", recentPrice: "22.90억", recovery: 127.2, peakPrice: "18.00억", requiredInvestment: "18.90억", numInvestment: 1889999999, status: "good" as const },
  { id: 33, name: "옥수파크힐스", aptType: "59", recentPrice: "22.95억", recovery: 85.0, peakPrice: "26.4억", requiredInvestment: "18.95억", numInvestment: 1895000000, status: "good" as const },
  { id: 34, name: "이촌 한가람", aptType: "59", recentPrice: "24.70억", recovery: 130.0, peakPrice: "19.00억", requiredInvestment: "20.70억", numInvestment: 2070000000, status: "good" as const },
  { id: 35, name: "목동신시가지7", aptType: "59", recentPrice: "25.00억", recovery: 129.9, peakPrice: "19.25억", requiredInvestment: "21.00억", numInvestment: 2100000000, status: "good" as const },
];

export const ZONE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(ZONE_DATA).map(([id, zone]) => [id, zone.name])
);

export const MOCK_PROPERTIES = [
  { id: 1, type: "다세대", price: "560,000,000", premium: "260,000,000", rightsPrice: "300,000,000", verified: true },
  { id: 2, type: "뚜껑", price: "450,000,000", premium: "210,000,000", rightsPrice: "240,000,000", verified: true },
  { id: 3, type: "빌라", price: "920,000,000", premium: "350,000,000", rightsPrice: "570,000,000", verified: false },
  { id: 4, type: "다세대", price: "880,000,000", premium: "330,000,000", rightsPrice: "550,000,000", verified: false },
];
