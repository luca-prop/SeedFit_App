import type { ZoneAttributes } from "./scoring";

/**
 * 2시·4시 운영자 확정 플래그. naturalKey 기준.
 * 검수 보드에서 승인된 값만 넣는다. 비어 있으면 2시=6+급지, 4시=세대수만.
 */
export const HEXAFIT_ATTRIBUTES: Record<string, ZoneAttributes> = {
  "강북구|미아동|미아 2구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "강북구|미아동|미아 3구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "강북구|미아동|미아 4구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "강북구|미아동|미아 9-2구역(재건축)": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "광진구|자양동|자양 7구역": {
    "viewHan": "hanRiverFull",
    "hardwareSpec": true,
    "schoolDistrict": "wide",
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "광진구|자양동|자양1동 779(모아타운)": {
    "viewHan": "hanRiverPartial",
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "광진구|자양동|자양2동 649(B)(모아타운)": {
    "viewHan": "hanRiverFull",
    "hardwareSpec": true,
    "newTownPlan": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "광진구|자양동|자양4동 A구역": {
    "viewHan": "hanRiverFull",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true
  },
  "광진구|자양동|자양3동A구역": {
    "viewHan": "hanRiverPartial",
    "hardwareSpec": true,
    "schoolDistrict": "wide",
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "광진구|자양동|자양동 772-1(건대모아)": {
    "viewHan": "hanRiverPartial",
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true
  },
  "구리시|수택동|수택 2구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "mallAdjacent": true
  },
  "금천구|독산동|독산 1구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "schoolOnSite": true
  },
  "금천구|독산동|독산 2구역": {
    "contractorStandard": true,
    "newTownPlan": true
  },
  "금천구|독산동|독산시흥구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "동대문구|이문동|이문 4구역": {
    "viewPark": "parkRiver",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "동대문구|전농동|전농 8구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "gtxAccess": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "동대문구|제기동|제기 4구역": {
    "contractorStandard": true,
    "stationArea": true,
    "gtxAccess": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "동대문구|제기동|제기 6구역": {
    "contractorStandard": true,
    "stationArea": true,
    "gtxAccess": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "동대문구|청량리동|청량리 6구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "stationArea": true,
    "gtxAccess": true,
    "parkWaterfront": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "동대문구|청량리동|청량리 8구역": {
    "contractorStandard": true,
    "stationArea": true,
    "gtxAccess": true,
    "parkWaterfront": true,
    "mallAdjacent": true
  },
  "동작구|노량진동|노량진 1구역": {
    "viewHan": "hanRiverPartial",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "schoolOnSite": true
  },
  "동작구|노량진동|노량진 3구역": {
    "viewHan": "hanRiverPartial",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "schoolOnSite": true
  },
  "동작구|대방동|노량진 7구역": {
    "viewHan": "hanRiverBelt",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "schoolOnSite": true
  },
  "동작구|사당동|사당 12구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "stationArea": true
  },
  "동작구|사당동|사당 17구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "동작구|사당동|사당 5구역(재건축)": {
    "viewPark": "parkRiver",
    "contractorStandard": true
  },
  "동작구|상도동|상도 14구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "동작구|상도동|상도 15구역": {
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "동작구|상도동|상도 21구역(모아타운)": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "마포구|공덕동|공덕 7구역": {
    "viewHan": "hanRiverBelt",
    "contractorStandard": true,
    "newTownPlan": true,
    "gtxAccess": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "마포구|공덕동|공덕 8구역": {
    "viewHan": "hanRiverBelt",
    "contractorStandard": true,
    "newTownPlan": true,
    "gtxAccess": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "마포구|염리동|염리 4구역": {
    "viewHan": "hanRiverBelt",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "마포구|염리동|염리 5구역": {
    "viewHan": "hanRiverBelt",
    "contractorStandard": true,
    "schoolDistrict": "wide",
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "서대문구|북아현동|북아현 2구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "doubleStation": true,
    "gtxAccess": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "서대문구|북아현동|북아현 3구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "gtxAccess": true,
    "hospitalAdjacent": true,
    "schoolOnSite": true
  },
  "서초구|방배동|방배 13구역": {
    "viewPark": "parkRiver",
    "highEndBrand": true,
    "schoolDistrict": "wide",
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "서초구|방배동|방배 15구역(재건축)": {
    "viewPark": "parkRiver",
    "highEndBrand": true,
    "schoolDistrict": "wide",
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성남시 수정구|수진동|수진 1구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "성남시 수정구|신흥동|신흥 1구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "성남시 수정구|신흥동|신흥 3구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "성동구|금호동2가|금호 16구역": {
    "viewHan": "hanRiverBelt",
    "viewPark": "parkRiver",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성동구|금호동3가|금호 21구역": {
    "viewHan": "hanRiverPartial",
    "viewPark": "parkRiver",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성동구|성수동|성수전략1구역": {
    "viewHan": "hanRiverFull",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성동구|성수동|성수전략2구역": {
    "viewHan": "hanRiverFull",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true
  },
  "성동구|성수동|성수전략3구역": {
    "viewHan": "hanRiverFull",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true
  },
  "성동구|성수동|성수전략4구역": {
    "viewHan": "hanRiverFull",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "hanRiverTransit": true,
    "parkWaterfront": true
  },
  "성북구|길음동|길음 5구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "성북구|길음동|신길음구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true
  },
  "성북구|장위동|장위 13-1구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true
  },
  "성북구|장위동|장위 13-2구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성북구|장위동|장위 14구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "성북구|하월곡동|신월곡 1구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "mallAdjacent": true,
    "schoolOnSite": true
  },
  "송파구|마천동|마천 1구역": {
    "viewPark": "parkRiver",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "송파구|마천동|마천 3구역": {
    "viewPark": "parkRiver",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  },
  "영등포구|신길동|신길 16-2구역": {
    "contractorStandard": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "영등포구|신길동|신길 2구역": {
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "용산구|이촌동|이촌1구역(재건축)": {
    "viewHan": "hanRiverFull",
    "highEndBrand": true,
    "newTownPlan": true,
    "hanRiverTransit": true,
    "gtxAccess": true,
    "parkWaterfront": true,
    "mallAdjacent": true
  },
  "용산구|청파동|서계통합": {
    "viewHan": "hanRiverBelt",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "gtxAccess": true
  },
  "용산구|청파동|청파 1구역": {
    "viewHan": "hanRiverBelt",
    "highEndBrand": true,
    "newTownPlan": true,
    "stationArea": true
  },
  "용산구|청파동|청파 2구역": {
    "viewHan": "hanRiverBelt",
    "hardwareSpec": true,
    "newTownPlan": true,
    "stationArea": true,
    "schoolOnSite": true
  },
  "용산구|후암동|남산 1구역": {
    "viewHan": "hanRiverBelt",
    "hardwareSpec": true,
    "newTownPlan": true
  },
  "은평구|갈현동|갈현 1구역": {
    "contractorStandard": true,
    "gtxAccess": true,
    "schoolOnSite": true
  },
  "은평구|대조동|대조 1구역": {
    "hardwareSpec": true,
    "stationArea": true,
    "gtxAccess": true,
    "schoolOnSite": true
  },
  "은평구|불광동|불광 5구역": {
    "hardwareSpec": true,
    "stationArea": true,
    "gtxAccess": true,
    "schoolOnSite": true
  },
  "중구|신당동|신당 10구역": {
    "hardwareSpec": true,
    "stationArea": true,
    "doubleStation": true
  },
  "중랑구|중화동|중화 6구역": {
    "viewPark": "parkRiver",
    "contractorStandard": true,
    "stationArea": true,
    "parkWaterfront": true,
    "schoolOnSite": true
  }
};
