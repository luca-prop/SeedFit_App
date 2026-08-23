# Cursor Skill 매뉴얼 — 데이터 큐레이션 · 블로그

> **문서 목적:** SeedFit 운영에 쓰는 Cursor 스킬의 **언제/무엇/입출력/정지점**을 한곳에서 고른다.  
> 절차 상세·명령 전문은 각 `SKILL.md`가 SoT다. 이 문서는 **라우팅·계약 요약**이다.  
> **작성일:** 2026-08-02 · **스킬명 갱신:** 2026-08-03 (`/redevelopment`→`/seedfit-golden-sample-update`, `/reference`→`/seedfit-reference-apt59-crawling`)

| 스킬 | 트리거 | 도메인 | SoT 파일 |
|---|---|---|---|
| `/seedfit-golden-sample-update` | Golden Sample 구역·84타입 레퍼런스 → 스펙 SoT | 앱 큐레이션 스펙 | `~/.cursor/skills/seedfit-golden-sample-update/SKILL.md` |
| `/seedfit-reference-apt59-crawling` | naver_P1/P2 59타입 시세 → 스펙 §3 | 앱 큐레이션 스펙 | `~/.cursor/skills/seedfit-reference-apt59-crawling/SKILL.md` |
| `/seedfit-district-status-update` | 재개발닷컴 → **Golden Sample 시트** (단계·coverage·진행현황·url) | Golden 시트 (스펙은 후속) | `~/.cursor/skills/seedfit-district-status-update/SKILL.md` |
| `/seedfit-district-villas-update` | 네이버 빌라 크롤 → 검수보드 JSON → Golden+스펙 → 아카이브 → Supabase·Vercel prod | 매물·실투자금·배포 | `.cursor/skills/seedfit-district-villas-update/SKILL.md` |
| `/blog-redev` | 재개발 구역 포스팅 틀/초안 | 디카이브 블로그 | `~/.cursor/skills/blog-redev/SKILL.md` |
| `/blog-apt-price-update` | 아파트 시세트래킹 post 1~4 | 디카이브 블로그 | `~/.cursor/skills/blog-apt-price-update/SKILL.md` |

공통: 위 스킬 모두 `disable-model-invocation: true` — **채팅에서 `/스킬명`으로 명시 호출**한다.

**이름 변경 메모**

| 구 이름 | 신 이름 |
|---|---|
| `/redevelopment` | `/seedfit-golden-sample-update` |
| `/reference` | `/seedfit-reference-apt59-crawling` |

---

## 0. 한눈에 고르기

```
무엇을 바꾸고 싶은가?
│
├─ 앱 DATA_CURATION_SPEC (SeedFit SoT)
│   ├─ 빌라 매물 크롤·검수 JSON → Golden·스펙·아카이브·Production
│   │     → /seedfit-district-villas-update
│   ├─ Golden Sheet 구역·실투자금·단계·84타입 비교기축/List
│   │     → /seedfit-golden-sample-update (빌라 승인 반영 후에도 이 절차를 villas 스킬이 호출)
│   ├─ Naver Land 59타입 대조군(## 3) 시세 (구역 비교용)
│   │     → /seedfit-reference-apt59-crawling
│   └─ 재개발닷컴 현재 단계·진행현황 → Golden 시트까지
│         → /seedfit-district-status-update (CORE+SUB. 단계 변경은 사용자 승인. DoD=시트 --write)
│         → SUB→CORE면 /seedfit-district-villas-update (폴리곤·검수보드→Production)
│         → (이어서) golden-sample-update 로 스펙 ##2 반영
│
└─ 블로그 콘텐츠
    ├─ 특정 재개발 구역 분석 글(고시·매물 기반)            → /blog-redev
    └─ 시세트래킹 사진 post 1~4 HTML 표                     → /blog-apt-price-update
```

| 상황 | 쓸 스킬 | 쓰지 말 것 |
|---|---|---|
| Golden Sample 시트 수동 큐레이션 후 스펙·앱 반영 | `/seedfit-golden-sample-update` | `/seedfit-reference-apt59-crawling`으로 List/비교기축 덮기 |
| 59타입 단지 시세 크롤 → 구역 비교 대조군(§3) | `/seedfit-reference-apt59-crawling` | `/seedfit-golden-sample-update`로 §3 갱신 |
| 길음5·수택2 같은 **구역 분석** 초안 | `/blog-redev` | `/blog-apt-price-update` |
| 강남3구·억대별 **시세트래킹** 표 | `/blog-apt-price-update` | `/blog-redev` |
| 권장 앱 데이터 순서 | golden-sample-update → apt59-crawling | 역순으로 List/§3 혼동 |
| 네이버 구역 매물 크롤 후 실투자금 | **`매물` 탭 검수·승인** 후만 Golden C 반영 (§5.1.2) | 호가/크롤값을 G·C에 직기입 |

**타입 구분 (앱 큐레이션 핵심):**

| 타입 | 원천 | 반영 위치 | 소유 스킬 |
|---|---|---|---|
| **84타입** 레퍼런스 | Golden Sheet `비교 기축` + `기축 시세` | `## 2.` 비교 기축 열 + `### 🏢 레퍼런스 단지 List` | `/seedfit-golden-sample-update` |
| **59타입** 대조군 | Naver Land XLSX 2개 세트 (`naver_P1`/`naver_p2`) | `## 3.` Comparison Assets만 | `/seedfit-reference-apt59-crawling` |

---

## 1. `/seedfit-golden-sample-update` — Golden Sample → 스펙 SoT

### 목적 (언제)

Golden Sample 구글 시트에서 **구역정보·레퍼런스 기축단지**를 수동 업데이트한 뒤, SoT `docs/DATA_CURATION_SPEC.v.2.md`에 올려 SeedFit에 반영할 때.

갱신 대상:

- `## 2.` 구역 표(실투자금·단계·티어 등)
- `비교 기축 아파트 (84타입 기준)` 열
- `### 🏢 레퍼런스 단지 List`

### INPUT

| 항목 | 내용 |
|---|---|
| 원천 | [Golden Sample 시트](https://docs.google.com/spreadsheets/d/1YaZjGX53HGNQyAjLp0AIQFGq-j0IWcfPl5WFgUeUfuY/) |
| 전제 | `rclone` remote `gdrive:` 인증됨 |
| 작업 cwd | `SeedFit_app_mvp/` (`$env:PYTHONUTF8="1"`) |
| 스펙 대상 | `docs/DATA_CURATION_SPEC.v.2.md` |

수동 CSV 다운로드/업로드는 하지 않는다. Drive에서 rclone/스크립트로 export.

### OUTPUT

| 산출 | 경로·형태 |
|---|---|
| CSV export | `docs/golden_samples{YYMMDD}.csv.csv` |
| 정규화 JSON | `data/normalized/golden_samples{YYMMDD}.normalized.json` |
| 미리보기 | `data/reports/section2_preview.md` |
| 최종 반영 | 스펙 `### 📍` ~ `## 3.` 직전 교체 (`--write`) |

### 흐름 · 정지점

1. rclone 확인 → 시트 CSV export  
2. normalize → warning(`unknown_stage`, `money_parse_error`, `duplicate_zone` 등) 있으면 **시트 수정 후 재시작**  
3. validate → Golden 자체 error면 수정 후 재실행  
4. section2 미리보기 → **사용자 확인 후** `--write`  
5. 미리보기 파일 삭제  

**Fallback:** rclone 실패 시 사용자가 CSV를 `docs/`에 넣고 정규화 단계부터.

### 소유 / 금지

- 소유: 구역 행 + 84타입 비교 기축 열 + 레퍼런스 List  
- 금지: 59타입 Naver 세트로 List·비교 기축 열 갱신  
- §3 대조군은 이 스킬 범위 밖

### 부가 파이프라인: 재개발닷컴 → Golden Sample

`/seedfit-district-status-update` — **CORE+SUB 전부**. **DoD는 Golden Sample 시트 `--write`까지**. **현재 단계 변경은 사용자 승인 후 `--apply-stage-changes`.**

1. `fetch_jaegebal_district_status.py` (CSV 배치; CORE+SUB. 모아 등은 `jaegebal_zone_overrides.json`)  
2. 리포트 검수 (오매칭·`(모아)*` 오부착 skip). `stageDiff=changed`는 채팅에 올리고 승인  
3. `apply_jaegebal_district_status.py --write` → 진행현황·url. 단계는 `--apply-stage-changes`  
4. SUB→CORE면 `/seedfit-district-villas-update --zone-keys` (폴리곤·검수보드→Production)  
5. (스킬 밖) `/seedfit-golden-sample-update` → 스펙 `## 2.`  

매핑: `data/reference/jaegebal_stage_map.json`. 미매핑(`blocked`)은 자동 반영하지 않음.

---

## 2. `/seedfit-reference-apt59-crawling` — 59타입 시세 크롤 → §3 대조군

### 목적 (언제)

`naver_P1.py` / `naver_p2.py`로 **59타입 단지 시세**를 갱신하고, 재개발 구역과 비교하는 대조군으로 스펙 `## 3.` Comparison Assets(3.1/3.2)·파이프라인 메타에 반영할 때.

**스펙 반영 여부:** 예 — `DATA_CURATION_SPEC.v.2.md`의 `## 3.`만 갱신한다 (`## 2.` 구역·84타입 List는 건드리지 않음).

사람 검수(엑셀) 없이 Stage 2로 가지 않는다.

### INPUT

| 항목 | 내용 |
|---|---|
| 크롤러 | `docs/DATA_CURATION_자동화/naver_P1.py`, `naver_p2.py` |
| 의존성 | `httpx`, `openpyxl`, `playwright` + Chromium |
| 작업 cwd | `SeedFit_app_mvp/` (`$env:PYTHONUTF8="1"`) |
| Stage 2 계약 | XLSX **항상 2개 1세트**로 `REQUIRED_SOURCE_FILES`·문서 2곳 동시 갱신 |

### OUTPUT

| 단계 | 산출 |
|---|---|
| Stage 1 | `Naver_Land_{MMDD}_{HHMM}.xlsx` × 2 → `docs/` 이동 |
| Stage 1 정지 | 사용자 엑셀 검수 (`매물없음`·이상치) — **「이상 없음」 전 중단** |
| Stage 2 | `data/normalized/naver_land_{MMDD}.normalized.json` |
| Stage 2 | `docs/MVP_COMPARISON_ASSETS_PIPELINE260627.md` 메타 갱신 |
| Stage 2 | 스펙 `## 3.` 재계산 (`section3_preview.md` → `--write`) |

`매물없음` 등으로 미매칭 단지는 **기존 최저가 유지** + warning.

### 소유 / 금지

- 소유: `## 3.`만  
- 금지: 레퍼런스 List, `## 2.` 84타입 비교 기축 열, 구역 행(실투자금/단계)  
- 산출값을 앱 DB에 직접 쓰지 않음 (MVP-031)

### 권장 순서

앱 스펙을 둘 다 갱신할 때: **`/seedfit-golden-sample-update` → `/seedfit-reference-apt59-crawling`**.

---

## 3. `/blog-redev` — 재개발 구역 블로그 틀/초안

### 목적 (언제)

고시문·기사·메모·매물을 받아 **구역 분석 포스팅**의 제목 후보·본문 초안·표(HTML)를 만든다.  
없는 숫자는 채우지 않는다. 입지/호재는 **붙여 넣은 자료만** 사용(무단 웹 검색 금지).

시세트래킹 post 1~4는 이 스킬이 아니다 → `/blog-apt-price-update`.

### INPUT

| 항목 | 필수 | 비고 |
|---|---|---|
| 구역명 (행정동/구) | O | |
| 고시문/공문 전문 | 권장 | 뼈대 1순위. 감평 로직(공시 연도·보정률) |
| 기사·카톡·메모 | 선택 | 변동 수치·최신 진행 (날짜 있으면 우선순위 판단) |
| 매물 1건+ (양식) | 4절 사실상 요구 | 없으면 4절 공란 + 양식 재요청 |
| 비교 기축·시세 | 선택 | **4절 안**에서만 (독립 대섹션 금지) |

링크만 주고 본문 없으면 붙여넣기를 요청한다.

### OUTPUT (한 번에)

1. **제목 후보 3개** (`{구역} 재개발 분석 - {훅}`)  
2. **본문 초안** — 인사 → 인트로 → 한줄 결론+페르소나 → 고정 4절 → 마무리  
   - 섹션: `1. 구역 정보` / `2. 재개발 진행 상황` / `3. 조합원 분양가·감평` / `4. 매물 분석`  
   - 표: Markdown + 클린 HTML (`style`/`class` 없음) — 권장 `blog-redev/output/{구역}_tables.html`  
   - 각 대섹션 아래 `■ 디카이브 메모` 빈칸 (에이전트가 대신 쓰지 않음)  
3. **미확인 체크리스트** — `[입력 필요]` · 출처 충돌 · 사람 온기 자리

### 흐름 · 정지점

1. 입력 수집(부족 시 양식 제시)  
2. **자료 우선순위 확인 질문** (뼈대 vs 최신 후보) — 답 받기 전 숫자 덮어쓰기 금지  
3. 팩트 표 정리 → 사용자 수정 반영  
4. 초안·표·체크리스트 산출  

### 참조 (스킬 폴더)

- `references/post-pattern.md`, `blog-tables.md`, `source-priority.md`  
- `references/samples.md` + `samples/` (수택2·전농8·장위14·마천3)

### 금지 요약

숫자 창작 · 이미지 표만 제공 · 비교기축 독립 대섹션 · 무단 입지 보강 · 우선순위 확인 없이 기사로 고시 덮기 · 매물 양식 없이 4절 “완성처럼” 채우기.

---

## 4. `/blog-apt-price-update` — 아파트 시세트래킹 갱신

### 목적 (언제)

사진 시트(registry) 기준 단지의 네이버 호가(+선택 국토부 실거래)를 모아, 디카이브 **시세트래킹 post 1~4** 클린 HTML 표를 갱신한다.

### INPUT

| 항목 | 내용 |
|---|---|
| SoT 멤버십 | `docs/DATA_CURATION_자동화/post_registry.json` |
| 작업 cwd | `SeedFit_app_mvp/docs/DATA_CURATION_자동화` |
| 크롤러 | `naver_P1.py`, `naver_p2.py`, `g3naver_p1style.py` |
| (선택) 실거래 | `MOLIT_API_KEY`(`frontend/.env.local`), `molit_apt_exact.py` allowlist |
| 단지 변경 시 | registry 수정 → `sync_targets_from_registry.py` → (국토부명/마스터) |

### OUTPUT

| Post | 크롤러 | 표 구성 | 가격대 라벨 |
|---|---|---|---|
| 1 | `g3naver_p1style.py` | 2 (서초·강남 / 송파) | 강남3구 |
| 2 | `naver_P1.py` | 4 | 예: 17~28억 (라벨만 수정 가능) |
| 3 | `naver_p2.py` 상단 | 3 | 예: 13~17억 |
| 4 | `naver_p2.py` 하단 | 3 | 예: 7~12억 |

HTML 출력 디렉터리: `~/.cursor/skills/blog-redev/output`  
중간 산출: `Naver_Land_*.xlsx`, `Naver_Land_G3_*.xlsx`, (선택) `molit_trades_blog_*.json`

### 핵심 규칙 (멤버십)

1. 호가/실거래/전고점 없다고 **행 삭제 금지**  
2. 가격대 변동 시 **제목/라벨만** 수정 — 호가로 단지 재분류·제외 금지  
3. 호가 없음 → 셀 `매물없음` 또는 `—`, 행 유지  
4. 빈 행(표 분할)은 사진/registry 기준 — 호가로 재정렬·재분할 금지  

상세: `blog-apt-price-update/references/membership-rules.md`, `sise-tables.md`.

### 금지 요약

사진 단지 제외 · post 간 재분류 · 숫자 창작 · 호가 기준 순서 재정렬 · 열 순서 임의 변경 · 구역 재개발 초안을 이 스킬로 작성.

---

## 5. 도메인 맵 · 관련 문서

```
[앱 큐레이션]
  Golden Sheet ──/seedfit-golden-sample-update──► DATA_CURATION_SPEC ##2 + 레퍼런스 List (84)
       └─ SeedFit 반영 (스펙 SoT)
  Naver 59세트 ──/seedfit-reference-apt59-crawling──► DATA_CURATION_SPEC ##3 (대조군, 구역 비교용)
       │
       └─ 상세 절차·파이프라인: MVP_COMPARISON_ASSETS_PIPELINE260627.md
          운영 맥락: DATA_MANAGEMENT_PLAN.md

[블로그]
  고시·매물 ──/blog-redev──────────► 구역 분석 초안 + tables.html
  registry  ──/blog-apt-price-update► 시세트래킹 post1~4 HTML
```

| 문서 | 역할 |
|---|---|
| `docs/DATA_CURATION_SPEC.v.2.md` | 구역·레퍼런스·대조군 스펙 SoT |
| `docs/DATA_MANAGEMENT_PLAN.md` | 데이터 운영 전략 (`/seedfit-golden-sample-update` 언급) |
| `docs/MVP_COMPARISON_ASSETS_PIPELINE260627.md` | 대조군 파이프라인·파일 세트 기록 |
| `docs/DATA_CURATION_자동화/` | 네이버·국토부·블로그 HTML 스크립트 |

---

## 6. 호출 체크리스트 (운영자)

```
앱 데이터 주간 갱신
- [ ] Golden Sheet 구역·레퍼런스 기축 큐레이션 완료
- [ ] /seedfit-golden-sample-update (미리보기 확인 → write) → DATA_CURATION_SPEC.v.2 ##2
- [ ] /seedfit-reference-apt59-crawling Stage1 크롤(naver_P1/p2) → 엑셀 검수 「이상 없음」
- [ ] /seedfit-reference-apt59-crawling Stage2 → DATA_CURATION_SPEC.v.2 ##3

구역 블로그 1편
- [ ] /blog-redev 양식 입력 → 우선순위 확인 → 초안
- [ ] 사람 온기(디카이브 메모) + HTML 이관

시세트래킹 갱신
- [ ] (단지 변경 시) post_registry → sync
- [ ] /blog-apt-price-update 크롤 → (선택 MOLIT) → HTML
- [ ] registry 대비 행 수·호가없음 행 유지 확인
```

---

## 7. 스킬 파일 위치 (로컬)

```
C:\Users\82104\.cursor\skills\
  seedfit-golden-sample-update\SKILL.md   ← 구 redevelopment
  seedfit-reference-apt59-crawling\SKILL.md ← 구 reference
  seedfit-district-status-update\SKILL.md
  blog-redev\SKILL.md
  blog-redev\references\...
  blog-redev\output\          ← 구역 표·시세트래킹 HTML 권장 출력
  blog-apt-price-update\SKILL.md
  blog-apt-price-update\references\...

워크스페이스 사본:
  SeedFit-project-root/.cursor/skills/seedfit-golden-sample-update/
  SeedFit-project-root/.cursor/skills/seedfit-reference-apt59-crawling/
```

절차가 바뀌면 **해당 `SKILL.md`를 먼저 고치고**, 이 매뉴얼의 INPUT/OUTPUT·소유권 표만 맞춰 갱신한다.
