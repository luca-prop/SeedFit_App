0. 시각적 구조화 및 직관적 인지 프레임워크
본 시스템은 정비구역의 현재 사업 상태와 완공 후 미래 가치, 그리고 입지 위계와 자금 장벽을 시각적으로 이분화하여, 이용자가 그래프 형상(Polygon Shape)만 보고도 구역의 성격과 투자 포지션을 단 1초 만에 직관적으로 파악할 수 있도록 구성한다.

                         [12시] 급지 (입지 위계)
                                   ▲
        (현재: 사업 진행 영역)      │      (미래: 완공 후 변모 모습)
   [10시] 사업성 (일반분양 비율)     │      [2시] 상품성·희소성 (브랜드/뷰/학군)
   [8시]  안정성·속도 (단계 - 감점)  │      [4시] 단지 규모·인프라 (세대수/상권)
                                   ▼
                   [6시] 필요 투자금 (실투자금 규모)
시각적 읽기 규칙 (Intuitive Perception Rules)
좌측 (10시, 8시): 현재 진행 중인 재개발 사업의 하드웨어적 수익성과 소프트웨어적 인허가 속도/안정성

우측 (2시, 4시): 사업 완료 후 신축 아파트로 변모했을 때의 상징성, 브랜드, 학군, 세대 규모 및 생활 인프라

북/남 축 (12시, 6시): 12시는 상급지 위계, 6시는 진입에 필요한 초기 실투자금(억 원)의 물리학적 크기

형상 인식의 직관성:

상부 팽이형 (12시 High / 6시 Small): 상급지이면서 초기 투자금이 적게 드는 '가성비 레버리지 진입 구역'

우측 날개형 (2시·4시 High): 완공 후 지역 랜드마크가 확정적인 '미래 가치 극대화 구역'

좌측 방패형 (10시·8시 High): 인허가가 완성 단계이고 사업성이 우수한 '안전 완결형 구역'

남쪽 둔덕형 (6시 Large): 10억~15억 이상의 고자본이 투입되는 '메이저 상급지 구역'

1. [12시] 급지 (Location Tier) 산출 체계
지도의 소수점 급지 인덱스(Index, 1.0 ~ 4.2)를 기반으로 10점 만점 기준 점수로 직결 산출한다. (가감점 보정 규칙은 기준 단순화를 위해 생략함)

1.1 산출 공식 (10점 만점)
Score 
12
​
 =10.0−(Index−1.0)×1.0
1.2 급지표 (최신 업데이트 기준 마스터 데이터)
Below is the master location tier table derived from the base map (서울/경기 급지표_2.0) and updated with all requested modifications/additions. Locations not present in the base map or the update list are excluded.

급지 인덱스 (Index)	12시 급지 점수	포함 지역
1.0~1.5 (100점): 압구정, 반포, 잠원, 한남/앞, 대치, 이촌/동, 삼성, 도곡, 한남/뒤
1.6 (99점): 서초, 여의도, 한강로, 성수
1.7 (98점): 잠실, 역삼, 개포, 방배/본
1.8 (97점): 신천, 방배
1.9 (96점): 일원
2.0 (95점): 목동/앞
2.1 (94점): 수서, 목동/뒤
2.2 (93점): 흑석, 가락, 방이, 둔촌
2.3 (92점): 마포, 옥수, 노량진, 이촌/서, 과천
2.4 (91점): 광장, 자양, 문정, 아현, 금호
2.5 (90점): 왕십리, 구의, 사당, 수내, 정자
2.6 (89점): 고덕, 북아현, 당산, 자곡, 서현
2.7 (88점): 명일
2.8 (87점): 상도, 신길, 신당
2.9 (86점): 청량리, 거여
3.0 (85점): 마곡, 암사
3.1 (84점): 신도림, 답십리
3.2 (83점): 신정, 천호
3.3 (82점): 이문, 철산
3.4 (81점): 길음, 보문, 염창, 가양, 가재울
3.5 (80점): 봉천, 홍제, 광운대, 산성, 광명, 수지, 장위, 방화
3.6 (79점): 상암, 신림
3.7 (78점): 덕은, 상봉
3.8 (77점): 연신내, 녹번
3.9 (76점): 월계


*세부 급지
1.0 압구정
 1.1 반포
 1.2 잠원
 1.3 한남/앞
 1.4 대치, 이촌/동
 1.5 삼성, 도곡, 한남/뒤
 1.6 서초, 여의도, 한강로, 성수
 1.7 잠실, 역삼, 개포, 방배/본
 1.8 신천, 방배
 1.9 일원
2.0 목동/앞
 2.1 수서, 목동/뒤
 2.2 흑석, 가락, 방이, 둔촌
 2.3 마포, 옥수, 노량진, 이촌/서. 과천
 2.4 광장, 자양, 문정, 아현, 금호
 2.5 왕십리, 구의. 사당, 수내, 정자
 2.6 고덕, 북아현, 당산, 자곡, 서현
 2.7 명일
 2.8 상도, 신길, 신당
 2.9 청량리, 거여
3.0 마곡, 암사
 3.1 신도림, 답십리
 3.2 신정, 천호
 3.3 이문, 철산
 3.4 길음, 보문, 염창, 가양, 가재울
 3.5 봉천, 홍제, 광운대, 산성, 광명, 수지, 장위, 방화
 3.6 상암, 신림
 3.7 덕은, 상봉
 3.8 연신내, 녹번
 3.9 월계



2. 영역별 상세 평가 산출 로직 (10점 만점 체계)
2.1 [2시] 상품성·희소성 (Product Value & Scarcity)
신축 완공 후 단지의 상징성과 고급화 가치를 산출한다.

Score 
2
​
 =min(10.0,Base_Score+∑Additive_Scores)
기본 점수 (Base_Score): 7.0점

가점 항목 (Additive_Scores):

강남 3구 (서초/강남/송파): +2.0점

한강벨트 연접: +1.5점

하이엔드 브랜드 적용: +0.5점

(아크로, 르엘, 써밋, 디에이치 확정 시 적용 / 래미안, 자이는 일반 라인업이어도 브랜드 가점 적용)

한강 조망권: +0.3점 ~ +0.5점 (부분조망 +0.3 / 영구 파노라마 조망 +0.5)

학군 프리미엄:

범대치, 목동, 중계 핵심 학원가: +0.5점

광장, 고덕, 방이, 마포(대흥) 학군: +0.3점

2.2 [4시] 단지 규모·인프라 (Scale & Infrastructure)
세대수가 주는 대단지 프리미엄과 주변 상권/뉴타운 인프라를 결합 산출한다.

Score 
4
​
 =min(10.0,Base_Scale_Score+∑Infra_Additives)
1) 단지 세대수 기본 점수 (Base_Scale_Score)
총 신축 세대수	기본 점수
5,000세대 이상	10.0점
3,000세대 이상	9.5점
2,000세대 이상	9.0점
1,000세대 이상	8.5점
500세대 이상	7.5점
500세대 미만	3.0점 ~ 6.0점
2) 인프라 및 정비구역 개발 가점 (Infra_Additives)
대형 쇼핑몰 인접 (잠실 롯데, 코엑스, 고속터미널 급): +0.5점

거점 역세권 개발 급 (건대, 청량리, 광운대역세권 개발 등): +0.25점

대규모 뉴타운 단위 조성 (아현, 장위, 노량진, 거여마천 등): +0.5점

(교통 인프라는 기본 단지 세대수 및 상권 점수에 포함되며, 추가 보정 시 옵션 적용)

2.3 [6시] 필요 투자금 (Required Capital / Investment Barrier)
인위적인 10점 만점 압축을 지양하고, 실제 초기 투자금 수치(억 원 단위)를 레이더 차트 축의 물리적 길이로 직접 바인딩한다.

표현 방식: 레이더 차트 6시 방향 축의 길이를 실제 최소 실투자금(억 원, Billion KRW)에 인덱싱하여 직접 시각화한다.

직관적 시각 효과:

초투 13.0억~15.0억 원 대 → 6시 축이 남쪽으로 길게 확장됨 (고자본 진입 장벽)

초투 2.5억~3.5억 원 대 → 6시 축이 중심점 부근으로 바짝 좁아짐 (소액 진입 가능)

2.4 [8시] 사업 안정성·속도 (Stability & Progress Speed)
사업 인허가 진행단계 기본 점수에서 조합 내부 갈등 및 소송 리스크 감점을 차감하여 산출한다.

Score 
8
​
 =min(10.0,max(0.0,Base_Stage_Score−Conflict_Penalty))
1) 기본 진행단계 점수 (Base_Stage_Score)
정비사업 진행 단계	기본 점수
착공 및 일반분양 완료	10.0점
이주 및 철거 진행 중	9.5점
관리처분인가 완료	9.0점
사업시행인가 완료	8.5점
시공사 선정 완료	8.0점
조합설립인가 완료	7.5점
정비구역 지정 완료	6.5점
신속통합기획 / 모아타운 대상지 선정	5.0점
추진위원회 승인 / 주민동의서 수렴 단계	3.5점
2) 조합/갈등 리스크 감점 (Conflict_Penalty)
경미한 마찰 (공사비 증액 협상 지연 등): -0.5점

중증 갈등 (조합장 해임, 비대위 주요 소송, 시공사 계약 해지 등): -1.0점 ~ -1.5점

극단적 파행 (조합 승인 취소, 법원 정비구역 지정 취소 판결): -2.5점

(가점 요인) 인허가 초단기 통과 및 조합 집행력 매우 탁월: +0.5점 가점

2.5 [10시] 사업성 (Profitability)
재개발 사업 특성상 대지지분 변수를 제외하고, 일반분양수 / 조합원수 비율과 12시 급지 위치의 매트릭스 결합으로 점수를 산출한다.

Ratio=( 
조합원 세대수
일반분양 세대수
​
 )×100%
사업성 점수 매트릭스 (Score 
10
​
 )
일반분양 비율 (Ratio)	1.0 ~ 2.6 급지 (상급지)	2.7 ~ 3.5 급지 (중급지)	3.6 이상 급지 (하위급지)
100% 이상	10.0점	10.0점	10.0점
50% 이상 ~ 100% 미만	9.0점	9.0점	9.0점
30% 이상 ~ 50% 미만	8.0점	7.0점	6.5점
20% 이상 ~ 30% 미만	7.0점	6.5점	5.0점
10% 이상 ~ 20% 미만	5.5점	5.0점	4.0점
10% 미만	3.0점	3.0점	3.0점
3. 데이터 스키마 명세 (TypeScript Interface)
TypeScript
// types/hexafit.ts

export type TierIndex = number; // 1.0 ~ 4.2

export interface ZoneAnalysisData {
  id: string;
  zoneName: string;            // 예: "금호 21구역"
  region: {
    district: string;          // 예: "성동구"
    dong: string;              // 예: "금호동3가"
  };
  
  // 12시: 급지 데이터
  locationTier: {
    tierIndex: TierIndex;      // 마스터 기준 인덱스 (예: 2.4)
    finalScore: number;        // 10.0 - (tierIndex - 1.0)
  };

  // 2시: 상품성 데이터
  productScarcity: {
    baseScore: number;         // 기본 7.0
    isGangnam3: boolean;       // +2.0
    isHanRiverBelt: boolean;   // +1.5
    hasHighEndBrand: boolean;  // +0.5
    riverViewScore: number;    // 0.0, 0.3, 0.5
    schoolScore: number;       // 0.0, 0.3, 0.5
    finalScore: number;        // Max 10.0
  };

  // 4시: 규모/인프라 데이터
  scaleInfrastructure: {
    totalUnits: number;        // 신축 세대수
    baseScaleScore: number;    // 세대수 기준 점수 (10.0, 9.5, 9.0 ...)
    hasMajorMall: boolean;     // +0.5
    hasStationDev: boolean;    // +0.25
    isNewTown: boolean;        // +0.5
    finalScore: number;        // Max 10.0
  };

  // 6시: 필요 투자금
  financialBarrier: {
    minInvestmentBillion: number;  // 최소 실투자금 (억 원, 예: 13.0)
    maxInvestmentBillion: number;  // 최대 실투자금 (억 원, 예: 14.0)
  };

  // 8시: 사업 안정성/속도
  stabilitySpeed: {
    stage: 'PLANNING' | 'ZONE_DESIGNATED' | 'UNION_ESTABLISHED' | 'CONTRACTOR_SELECTED' | 'BUSINESS_APPROVED' | 'MANAGEMENT_APPROVED' | 'DEMOLITION' | 'CONSTRUCTION';
    baseStageScore: number;        // 진행단계 점수
    conflictPenalty: number;       // 감점 수치 (0.0 ~ 2.5)
    finalScore: number;            // baseStageScore - conflictPenalty
  };

  // 10시: 사업성
  profitability: {
    memberCount: number;           // 조합원 수
    generalSalesCount: number;     // 일반분양 세대수
    generalSalesRatio: number;     // (일반분양수 / 조합원수) * 100 (%)
    finalScore: number;            // 매트릭스 변환 점수 (3.0 ~ 10.0)
  };

  // 비교 기축 아파트 데이터
  benchmarkApartment: {
    name: string;                  // 예: "옥수파크힐스"
    priceBillion: number;          // 시세 (억 원, 예: 27.5)
  };
}
4. 시각화 & 렌더링 명세 (Python Implementation)
Python
import numpy as np
import matplotlib.pyplot as plt

def generate_hexafit_v2_chart(data_list, output_path="hexafit_v2_chart.png"):
    labels = [
        "12시: 급지\n(위계·입지)", 
        "2시: 상품성·희소성\n(브랜드·뷰·학군)", 
        "4시: 규모·인프라\n(세대수·상권)", 
        "6시: 필요 투자금\n(실투자금 억 원)", 
        "8시: 속도·안정성\n(진행단계·리스크)", 
        "10시: 사업성\n(일분비율·수익성)"
    ]
    num_vars = len(labels)
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1] # 루프 닫기

    fig, ax = plt.subplots(figsize=(8.5, 8.5), subplot_kw=dict(polar=True), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    ax.set_theta_offset(np.pi / 2) # 12시 방향 시작
    ax.set_theta_direction(-1)     # 시계 방향 정렬

    plt.xticks(angles[:-1], labels, color='#e2e8f0', size=10.5)
    plt.yticks([2, 4, 6, 8, 10, 15], ["2", "4", "6", "8", "10", "15억"], color="#94a3b8", size=9)
    plt.ylim(0, 15)

    ax.grid(color='#334155', linestyle='--', linewidth=0.8)
    ax.spines['polar'].set_color('#475569')

    colors = ["#ec4899", "#8b5cf6", "#10b981", "#f59e0b"]
    
    for idx, item in enumerate(data_list):
        scores = [
            item['locationTier']['finalScore'],
            item['productScarcity']['finalScore'],
            item['scaleInfrastructure']['finalScore'],
            item['financialBarrier']['minInvestmentBillion'], # 억 원 물리 수치 직접 바인딩
            item['stabilitySpeed']['finalScore'],
            item['profitability']['finalScore']
        ]
        vals = scores + scores[:1]
        color = colors[idx % len(colors)]
        
        ax.plot(angles, vals, linewidth=2.5, linestyle='solid', label=f"{item['zoneName']} (초투 {item['financialBarrier']['minInvestmentBillion']}억)", color=color)
        ax.fill(angles, vals, color=color, alpha=0.15)

    plt.legend(loc="upper right", bbox_to_anchor=(1.40, 1.12), facecolor="#1e293b", edgecolor="#475569", labelcolor="#f8fafc")
    plt.tight_layout()
    plt.savefig(output_path, dpi=200, bbox_inches='tight')
    plt.close()
5. 그래프 형상(Shape) 진단 및 패턴 인식 알고리즘
분석 툴은 생성된 그래프의 왜곡 형상을 계산하여 유저에게 아래의 패턴 진단 리포트를 자동으로 제공한다.

       [역삼각형 / 팽이형]                 [우측 확장 / 날개형]                 [좌측 확장 / 방패형]
   (12시 High / 6시 Narrow)             (2시·4시 축 극대화)               (10시·8시 축 극대화)
  "상급지 소액 레버리지 진입형"           "신축 랜드마크 변모형"              "사업 완결 및 안전형"
상급지 소액 레버리지 진입형 (Top-Heavy / Narrow Bottom):

조건: Score 
12
​
 ≥8.5 AND MinInvestment≤4.0억 원

진단 메세지: "상급지에 위치하면서 초기 자금 부담이 적어 갭투자가 용이한 높은 가성비 구역입니다."

신축 랜드마크 변모형 (Right-Heavy Shape):

조건: Score 
2
​
 ≥8.5 AND Score 
4
​
 ≥8.5

진단 메세지: "완공 후 대단지 스펙, 하이엔드 브랜드, 입지 희소성을 겸비하여 지역 대장주 아파트로 변모할 구역입니다."

사업 완결/안정추구형 (Left-Heavy Shape):

조건: Score 
8
​
 ≥8.5 AND Score 
10
​
 ≥8.0

진단 메세지: "인허가 진행단계가 빠르고 일반분양 비율이 높아 사업 리스크가 매우 적은 안정적인 투자처입니다."

고자본 메이저 구역 (Bottom-Heavy / Large Shape):

조건: Score 
12
​
 ≥8.5 AND MinInvestment≥12.0억 원

진단 메세지: "성동/광진/마포/강남권 메이저 입지로, 높은 초기 자본력이 필요한 최상위 프리미엄 구역입니다."

조합 갈등 경고형 (Atypical Notch at 8 o'clock):

조건: Score 
10
​
 ≥8.0 BUT Score 
8
​
 ≤5.5

진단 메세지: "일반분양 비율 등 사업성은 우수하나, 조합 내부 갈등이나 소송전으로 속도 지연 위험이 존재하는 구역입니다."