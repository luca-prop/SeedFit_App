# Golden 월별 스냅샷

SoT는 Google 시트다. 이 폴더는 **그날 반영분을 고정**해서 다음달 초투·매매가 증감을 비교하기 위한 아카이브다.

```
data/archive/golden/
  zone_rollup.xlsx             # 최신 통합본 (초투min 정렬, 숫자 min/max)
  zone_rollup.html
  golden_samples.xlsx           # 최신 Golden 시트 스냅샷
  YYMMDD/
    golden_samples_YYMMDD.xlsx
    zone_rollup_YYMMDD.xlsx     # 1차 승인 구역 통합본
    zone_rollup_YYMMDD.html
```

통합본 열: 구 · 동 · 구역 · **현재 단계** · 표본 · 초투min/max · 매매min/max · Pmin/max.
행 정렬: **초투min 오름차순**.

비교:

```
python scripts/data/compare_golden_archives.py --before 260823 --after 260923
```
