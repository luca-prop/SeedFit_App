# Golden 월별 스냅샷

SoT는 Google 시트다. 이 폴더는 **그날 반영분을 고정**해서 다음달 초투·매매가 증감을 비교하기 위한 아카이브다.

```
data/archive/golden/YYMMDD/
  golden_samples_YYMMDD.xlsx   # 시트 전체 스냅샷
  zone_rollup_YYMMDD.xlsx      # 1차 승인 구역 통합본 (초투·매매가·P)
  zone_rollup_YYMMDD.html       # 같은 표, 탐색기 더블클릭 → 브라우저
```

비교:

```
python scripts/data/compare_golden_archives.py --before 260823 --after 260923
```
