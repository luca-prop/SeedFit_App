#!/usr/bin/env python3
"""Build a '매물' review spreadsheet tab: staging only — never Golden C/G auto-write.

Reads zone_listing_candidates_*.json (+ optional golden CSV baseline),
writes CSV (and optional Google Sheet tab) for human 초투/실투자금 review.

Flow:
  crawl → 매물 탭 → 사람 검수(기존 실투자금 범위 대조) → 승인=Y → apply script → Golden
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import date
from pathlib import Path
from typing import Any

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from normalize_golden_samples import clean_text, parse_eok_range, parse_eok_to_krw
from listing_detail_parse import fmt_area_with_pyeong

DEFAULT_SHEET_ID = "1YaZjGX53HGNQyAjLp0AIQFGq-j0IWcfPl5WFgUeUfuY"
TAB_NAME = "매물"

# Staging / review columns. Crawl ask price is NEVER treated as 실투자금.
SHEET_COLUMNS = [
    "행정구",
    "행정동",
    "구역명",
    "zoneNaturalKey",
    "rank",
    # --- crawl reference (호가 · 면적 · 힌트) ---
    "호가매매가(억)",
    "priceKrw",
    "기보증금(억)",
    "월세(만)",
    "예상_초투(억)",
    "힌트_초투(억)",
    "힌트_갭(억)",
    "힌트_프리미엄(억)",
    "힌트_전세(억)",
    "힌트_월세(만)",
    "융자금(억)",
    "입주가능일",
    "전용",
    "공급",
    "대지지분",
    "층",
    "향",
    "확인일",
    "상세요약",
    "title",
    "articleNo",
    "articleUrl",
    "linkKind",
    "linkLabel",
    "rletTpNm",
    "주소",
    "준공",
    "용도지역",
    "중개사",
    "mentions_zone",
    "mentions_redev",
    "matchScore",
    "matchedPhrases",
    "매물특징",
    "descriptionSnippet",
    "설명전문",
    "insidePolygon",
    # --- Golden baseline ---
    "기존_매매가",
    "기존_최소실투자금(억)",
    "기존_최대실투자금(억)",
    "기존_최소프리미엄",
    "기존_최대프리미엄",
    "호가_이상플래그",
    "실투대비_이상플래그",
    # --- human review ---
    "설명_초투(억)",
    "설명_프리미엄(억)",
    "Golden반영",
    "검수메모",
    "검수상태",
    "승인",
    "승인일",
    "generatedAt",
    "sourceMode",
]

# Dropdown values for Google Sheet data validation
DROPDOWN_검수상태 = ["pending", "ok", "reject"]
DROPDOWN_승인 = ["", "Y", "N"]
DROPDOWN_Golden반영 = [
    "",
    "실투자금만",
    "실투자금+프리미엄",
    "보류",
    "제외",
]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def krw_to_eok(price_krw: int | None) -> str:
    if price_krw is None:
        return ""
    eok = price_krw / 100_000_000
    text = f"{eok:.2f}".rstrip("0").rstrip(".")
    return text


def fmt_eok_hint(value: Any) -> str:
    if not isinstance(value, (int, float)):
        return ""
    text = f"{float(value):.2f}".rstrip("0").rstrip(".")
    return text


def fmt_area(value: Any) -> str:
    """Areas are shown as ㎡ with 평 in parentheses — operators price in 평."""
    if not isinstance(value, (int, float)):
        return ""
    return fmt_area_with_pyeong(float(value))


def _upsert_query_param(url: str, **params: str) -> str:
    from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    for key, value in params.items():
        if value:
            query[key] = value
        elif key in query:
            del query[key]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def article_url(
    article_no: str | None,
    *,
    map_url: str = "",
    lat: Any = None,
    lon: Any = None,
    z: Any = None,
) -> str:
    """Prefer new.land houses deep-link: …/houses?ms=…&a=…&b=A1&e=RETAIL&articleNo=…

    Real numeric articleNo → pin that listing on the zone map URL.
    Fake/demo IDs → zone map only (no bogus article deep-link).
    """
    no = str(article_no or "").strip()
    map_url = str(map_url or "").strip()

    if no.isdigit():
        # Centre on the listing's own coordinates when we have them: the map view only pins
        # articleNo if that listing is inside the current viewport.
        try:
            if lat is not None and lon is not None:
                zoom = int(z) if z is not None else 17
                return (
                    "https://new.land.naver.com/houses?"
                    f"ms={float(lat)},{float(lon)},{zoom}&a=DDDGG:VL&b=A1&e=RETAIL&articleNo={no}"
                )
        except (TypeError, ValueError):
            pass
        if map_url and "new.land.naver.com/houses" in map_url:
            return _upsert_query_param(map_url, articleNo=no)
        return f"https://fin.land.naver.com/articles/{no}"

    if map_url and "new.land.naver.com/houses" in map_url:
        # strip stale articleNo from zone seed URL when listing has no real id
        return _upsert_query_param(map_url, articleNo="")

    if map_url:
        return map_url
    try:
        if lat is not None and lon is not None:
            zoom = int(z) if z is not None else 16
            return (
                "https://new.land.naver.com/houses?"
                f"ms={float(lat)},{float(lon)},{zoom}&a=DDDGG:VL&b=A1&e=RETAIL"
            )
    except (TypeError, ValueError):
        pass
    return ""


def anomaly_flag_vs_investment(
    price_krw: int | None,
    hint_chotu_eok: Any,
    baseline: dict[str, Any] | None,
    *,
    soft_pct: float = 0.20,
) -> str:
    """Compare crawl 호가 or 초투힌트 against Golden 기존 실투자금 — primary sanity check."""
    if not baseline:
        return "NO_BASELINE"
    lo = baseline.get("investmentMinKrw")
    hi = baseline.get("investmentMaxKrw")
    if lo is None and hi is None:
        return "NO_BASELINE"
    if lo is None:
        lo = hi
    if hi is None:
        hi = lo
    assert lo is not None and hi is not None
    soft_lo = int(lo * (1 - soft_pct))
    soft_hi = int(hi * (1 + soft_pct))

    candidates: list[tuple[str, int]] = []
    if isinstance(hint_chotu_eok, (int, float)):
        candidates.append(("chotu", int(float(hint_chotu_eok) * 100_000_000)))
    if price_krw is not None:
        candidates.append(("ask", price_krw))
    if not candidates:
        return "NO_PRICE"

    # Worst flag wins (HIGH/LOW over OK)
    worst = "OK"
    for _, val in candidates:
        if val < soft_lo:
            worst = "LOW"
        elif val > soft_hi and worst != "LOW":
            worst = "HIGH"
    return worst


def load_golden_baselines(path: Path | None) -> dict[str, dict[str, Any]]:
    """zoneNaturalKey → sale/investment baseline from Golden CSV."""
    if path is None or not path.exists():
        return {}
    out: dict[str, dict[str, Any]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            district = clean_text(row.get("행정구")) or ""
            dong = clean_text(row.get("행정동")) or ""
            zone = clean_text(row.get("구역명")) or ""
            if not (district and dong and zone):
                continue
            key = f"{district}|{dong}|{zone}"
            try:
                sale_min, sale_max = parse_eok_range(clean_text(row.get("매매가")))
                inv_min = parse_eok_to_krw(clean_text(row.get("최소 실투자금(억)")))
                inv_max = parse_eok_to_krw(clean_text(row.get("최대 실투자금(억)")))
            except ValueError:
                sale_min = sale_max = inv_min = inv_max = None
            out[key] = {
                "saleText": clean_text(row.get("매매가")) or "",
                "saleMinKrw": sale_min,
                "saleMaxKrw": sale_max,
                "investmentMinKrw": inv_min,
                "investmentMaxKrw": inv_max,
                "investmentMinEok": clean_text(row.get("최소 실투자금(억)")) or "",
                "investmentMaxEok": clean_text(row.get("최대 실투자금(억)")) or "",
                "premiumMin": clean_text(row.get("최소 프리미엄")) or "",
                "premiumMax": clean_text(row.get("최대 프리미엄")) or "",
                "stage": clean_text(row.get("현재 단계")) or "",
            }
    return out


def anomaly_flag_for_ask(
    price_krw: int | None,
    baseline: dict[str, Any] | None,
    *,
    soft_pct: float = 0.20,
) -> str:
    """Compare crawl 호가 against Golden 매매가 range (not 실투자금).

    호가 ≠ 실투자금. Flag is only a review hint.
    """
    if price_krw is None or not baseline:
        return "NO_BASELINE" if not baseline else "NO_PRICE"
    lo = baseline.get("saleMinKrw")
    hi = baseline.get("saleMaxKrw")
    # Fall back to investment band *rough* sanity only when sale missing
    if lo is None and hi is None:
        lo = baseline.get("investmentMinKrw")
        hi = baseline.get("investmentMaxKrw")
        if lo is None and hi is None:
            return "NO_BASELINE"
        # 초투 대비 호가가 훨씬 크면 정상일 수 있음 — soft band only
    if lo is None:
        lo = hi
    if hi is None:
        hi = lo
    assert lo is not None and hi is not None
    soft_lo = int(lo * (1 - soft_pct))
    soft_hi = int(hi * (1 + soft_pct))
    if soft_lo <= price_krw <= soft_hi:
        return "OK"
    if price_krw < soft_lo:
        return "LOW"
    return "HIGH"


def select_top_cheapest(listings: list[dict[str, Any]], limit: int = 5) -> list[dict[str, Any]]:
    """Lowest 예상 초투 first among *zone-credible* rows.

    When the crawl ran with polygons, many cheap 동(dong) listings have no coordinates
    (insidePolygon=None). Those are NOT confirmed inside the zone — e.g. 북아현 2~3억
    rows that polluted the board. Eligibility:
      - insidePolygon=True  → keep
      - insidePolygon=None and mentions_zone → keep (좌표 숨김이지만 구역명 명시)
      - insidePolygon=False → drop from top-N
      - no PIP signal on any row → fall back to mention-preferring sort

    Within eligible: 구역명 언급 → 구역 안 → 예상 초투 낮은 순.
    """
    from listing_detail_parse import estimate_chotu_eok, resolve_deposit_eok

    def mentions(item: dict[str, Any]) -> bool:
        return bool((item.get("flags") or {}).get("mentions_zone"))

    has_pip_signal = any(i.get("insidePolygon") is True for i in listings) or any(
        i.get("insidePolygon") is False for i in listings
    )

    eligible: list[dict[str, Any]] = []
    for item in listings:
        pip = item.get("insidePolygon")
        if has_pip_signal:
            if pip is True:
                eligible.append(item)
            elif pip is None and mentions(item):
                eligible.append(item)
            # drop: outside, or no-coord without zone-name
        else:
            eligible.append(item)

    pool = eligible if eligible else list(listings)

    priced: list[dict[str, Any]] = []
    unpriced: list[dict[str, Any]] = []
    for item in pool:
        if not isinstance(item.get("priceKrw"), int):
            unpriced.append(item)
            continue
        if item.get("estimatedChotuEok") is None:
            deposit = resolve_deposit_eok(item)
            item["depositEok"] = deposit
            item["estimatedChotuEok"] = estimate_chotu_eok(item["priceKrw"], deposit)
        priced.append(item)

    # 폴리곤 안이든 구역명 언급이든 위에서 이미 *자격*을 통과했다. 순위는 값으로만 매긴다.
    # 좌표 확인분을 앞세우던 시절, 금호21구역은 폴리곤 안 5건으로 자리가 차서
    # 구역명을 명시한 13억 매물이 15억 뒤로 밀려났다. 동가일 때만 좌표 확인분을 앞세운다.
    priced.sort(
        key=lambda x: (
            float(x.get("estimatedChotuEok") if x.get("estimatedChotuEok") is not None else 1e18),
            x["priceKrw"],
            x.get("insidePolygon") is not True,
        )
    )
    unpriced.sort(key=lambda x: (x.get("insidePolygon") is not True, not mentions(x)))
    return (priced + unpriced)[:limit]


select_top_cheapest = select_top_cheapest


def build_sheet_rows(
    report: dict[str, Any],
    *,
    limit: int = 5,
    baselines: dict[str, dict[str, Any]] | None = None,
) -> list[dict[str, str]]:
    generated_at = str(report.get("generatedAt") or date.today().isoformat())
    source_mode = str(report.get("sourceMode") or "")
    baselines = baselines or {}
    rows: list[dict[str, str]] = []

    for block in report.get("zones") or []:
        district = str(block.get("district") or "")
        dong = str(block.get("dong") or "")
        zone_name = str(block.get("zoneName") or "")
        natural_key = str(block.get("naturalKey") or "")
        baseline = baselines.get(natural_key)
        geo = block.get("geo") or {}
        map_url = str(geo.get("naverMapUrl") or "")
        top = select_top_cheapest(block.get("listings") or [], limit=limit)
        for rank, item in enumerate(top, start=1):
            flags = item.get("flags") or {}
            phrases = flags.get("matchedPhrases") or []
            price_krw = item.get("priceKrw") if isinstance(item.get("priceKrw"), int) else None
            pip = item.get("insidePolygon")
            if pip is True:
                pip_cell = "Y"
            elif pip is False:
                pip_cell = "N"
            else:
                pip_cell = ""
            hint_chotu = item.get("hintChotuEok")
            hint_prem = item.get("hintPremiumEok")
            url = str(item.get("articleUrl") or "").strip() or article_url(
                str(item.get("articleNo") or ""),
                map_url=map_url,
                lat=item.get("lat") or geo.get("lat"),
                lon=item.get("lon") or geo.get("lon"),
                z=17 if item.get("lat") else geo.get("z"),
            )
            link_kind = "article" if str(item.get("articleNo") or "").isdigit() else ("map" if url else "none")
            if link_kind == "article":
                link_label = "매물 찍어서 열기"
            elif link_kind == "map":
                link_label = "구역 지도 열기"
            else:
                link_label = ""
            rows.append(
                {
                    "행정구": district,
                    "행정동": dong,
                    "구역명": zone_name,
                    "zoneNaturalKey": natural_key,
                    "rank": str(rank),
                    "호가매매가(억)": krw_to_eok(price_krw),
                    "priceKrw": str(price_krw or ""),
                    "기보증금(억)": fmt_eok_hint(
                        item.get("warrantEok")
                        or item.get("depositEok")
                        or item.get("hintJeonseEok")
                        or 0
                    ),
                    "월세(만)": fmt_eok_hint(item.get("rentManwon") or item.get("hintWolseManwon")),
                    "예상_초투(억)": fmt_eok_hint(item.get("estimatedChotuEok")),
                    "힌트_초투(억)": fmt_eok_hint(hint_chotu),
                    "힌트_갭(억)": fmt_eok_hint(item.get("hintGapEok")),
                    "힌트_프리미엄(억)": fmt_eok_hint(hint_prem),
                    "힌트_전세(억)": fmt_eok_hint(item.get("hintJeonseEok")),
                    "힌트_월세(만)": fmt_eok_hint(item.get("hintWolseManwon")),
                    "융자금(억)": fmt_eok_hint(item.get("financeEok")),
                    "입주가능일": str(item.get("moveInText") or ""),
                    "전용": fmt_area(item.get("exclusiveM2")),
                    "공급": fmt_area(item.get("supplyM2")),
                    "대지지분": fmt_area(item.get("landShareM2")),
                    "층": str(item.get("floorInfo") or ""),
                    "향": str(item.get("direction") or ""),
                    "확인일": str(item.get("confirmDate") or ""),
                    "상세요약": str(item.get("detailSummary") or ""),
                    "title": str(item.get("title") or ""),
                    "articleNo": str(item.get("articleNo") or ""),
                    "articleUrl": url,
                    "linkKind": link_kind,
                    "linkLabel": link_label,
                    "rletTpNm": str(item.get("rletTpNm") or ""),
                    "주소": str(item.get("address") or ""),
                    "준공": str(item.get("useApprovalYmd") or ""),
                    "용도지역": str(item.get("zoningName") or ""),
                    "중개사": str(item.get("realtorName") or ""),
                    "mentions_zone": "Y" if flags.get("mentions_zone") else "",
                    "mentions_redev": "Y" if flags.get("mentions_redev") else "",
                    "matchScore": str(item.get("matchScore") or 0),
                    "matchedPhrases": ", ".join(str(p) for p in phrases),
                    "매물특징": str(
                        item.get("featureDescription") or item.get("descriptionSnippet") or ""
                    ),
                    "descriptionSnippet": str(item.get("descriptionSnippet") or ""),
                    "설명전문": str(item.get("descriptionFull") or ""),
                    "insidePolygon": pip_cell,
                    "현재 단계": (baseline or {}).get("stage", ""),
                    "기존_매매가": (baseline or {}).get("saleText", ""),
                    "기존_최소실투자금(억)": (baseline or {}).get("investmentMinEok", ""),
                    "기존_최대실투자금(억)": (baseline or {}).get("investmentMaxEok", ""),
                    "기존_최소프리미엄": (baseline or {}).get("premiumMin", ""),
                    "기존_최대프리미엄": (baseline or {}).get("premiumMax", ""),
                    "호가_이상플래그": anomaly_flag_for_ask(price_krw, baseline),
                    "실투대비_이상플래그": anomaly_flag_vs_investment(price_krw, hint_chotu, baseline),
                    "설명_초투(억)": fmt_eok_hint(hint_chotu),
                    "설명_프리미엄(억)": fmt_eok_hint(hint_prem),
                    "Golden반영": "",
                    "검수메모": "",
                    "검수상태": "pending",
                    "승인": "",
                    "승인일": "",
                    "generatedAt": generated_at,
                    "sourceMode": source_mode,
                }
            )
    return rows


def write_csv(rows: list[dict[str, str]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=SHEET_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


ZONE_PROPOSAL_COLUMNS = [
    "행정구",
    "행정동",
    "구역명",
    "현재 단계",
    "zoneNaturalKey",
    "표본건수",
    "예상초투_min(억)",
    "예상초투_max(억)",
    "예상초투_범위",
    "P_min(억)",
    "P_max(억)",
    "P_범위",
    "매매가_min(억)",
    "매매가_max(억)",
    "매매가_범위",
    "기존_최소실투자금(억)",
    "기존_최대실투자금(억)",
    "기존_최소프리미엄",
    "기존_최대프리미엄",
    "기존_매매가",
    "실투대비_이상",
    "polygon안_건수",
    "articleNos",
    "승인",
    "검수상태",
    "검수메모",
    "승인일",
    "generatedAt",
    "sourceMode",
    "note",
]


def _parse_eok_cell(raw: str | None) -> float | None:
    text = clean_text(raw)
    if not text:
        return None
    text = text.replace("억", "").replace(",", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def _fmt_range(lo: float | None, hi: float | None) -> str:
    if lo is None and hi is None:
        return ""
    if lo is None:
        lo = hi
    if hi is None:
        hi = lo
    assert lo is not None and hi is not None
    a = fmt_eok_hint(lo)
    b = fmt_eok_hint(hi)
    if a == b:
        return f"{a}억"
    return f"{a}~{b}억"


def build_zone_proposals(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    """Roll top-N listing rows into per-zone 예상초투/매매가 ranges for one-tap approve.

    1차 목표: 운영자가 구역 통합본(범위)만 승인.
    매매가 범위는 참고·검수용 — Golden G 자동 반영 금지.
    예상초투 범위 → 승인 후 실투자금 min/max 후보.
    P(프리미엄) 범위는 매물 설명의 P/피/프리미엄 힌트(+설명_프리미엄) min/max.
    힌트가 한 건도 없으면 비워 둔다 — 없는 값을 0으로 만들지 않는다.
    """
    order: list[str] = []
    buckets: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        key = row.get("zoneNaturalKey") or ""
        if key not in buckets:
            buckets[key] = []
            order.append(key)
        buckets[key].append(row)

    proposals: list[dict[str, str]] = []
    for key in order:
        items = buckets[key]
        head = items[0]
        chotus = [
            v
            for v in (
                _parse_eok_cell(r.get("설명_초투(억)"))
                or _parse_eok_cell(r.get("힌트_초투(억)"))
                or _parse_eok_cell(r.get("예상_초투(억)"))
                for r in items
            )
            if v is not None
        ]
        asks = [v for v in (_parse_eok_cell(r.get("호가매매가(억)")) for r in items) if v is not None]
        premiums = [
            v
            for v in (
                _parse_eok_cell(r.get("설명_프리미엄(억)")) or _parse_eok_cell(r.get("힌트_프리미엄(억)"))
                for r in items
            )
            if v is not None
        ]
        pip_n = sum(1 for r in items if (r.get("insidePolygon") or "").upper() == "Y")
        flags = {(r.get("실투대비_이상플래그") or "").upper() for r in items}
        anomaly = "HIGH" if "HIGH" in flags else ("LOW" if "LOW" in flags else ("OK" if "OK" in flags else ""))
        chotu_lo = min(chotus) if chotus else None
        chotu_hi = max(chotus) if chotus else None
        ask_lo = min(asks) if asks else None
        ask_hi = max(asks) if asks else None
        p_lo = min(premiums) if premiums else None
        p_hi = max(premiums) if premiums else None
        proposals.append(
            {
                "행정구": head.get("행정구") or "",
                "행정동": head.get("행정동") or "",
                "구역명": head.get("구역명") or "",
                "현재 단계": head.get("현재 단계") or "",
                "zoneNaturalKey": key,
                "표본건수": str(len(items)),
                "예상초투_min(억)": fmt_eok_hint(chotu_lo) if chotu_lo is not None else "",
                "예상초투_max(억)": fmt_eok_hint(chotu_hi) if chotu_hi is not None else "",
                "예상초투_범위": _fmt_range(chotu_lo, chotu_hi),
                "P_min(억)": fmt_eok_hint(p_lo) if p_lo is not None else "",
                "P_max(억)": fmt_eok_hint(p_hi) if p_hi is not None else "",
                "P_범위": _fmt_range(p_lo, p_hi) if premiums else "",
                "매매가_min(억)": fmt_eok_hint(ask_lo) if ask_lo is not None else "",
                "매매가_max(억)": fmt_eok_hint(ask_hi) if ask_hi is not None else "",
                "매매가_범위": _fmt_range(ask_lo, ask_hi),
                "기존_최소실투자금(억)": head.get("기존_최소실투자금(억)") or "",
                "기존_최대실투자금(억)": head.get("기존_최대실투자금(억)") or "",
                "기존_최소프리미엄": head.get("기존_최소프리미엄") or "",
                "기존_최대프리미엄": head.get("기존_최대프리미엄") or "",
                "기존_매매가": head.get("기존_매매가") or "",
                "실투대비_이상": anomaly,
                "polygon안_건수": str(pip_n),
                "articleNos": "|".join(r.get("articleNo") or "" for r in items if r.get("articleNo")),
                "승인": "",
                "검수상태": "pending",
                "검수메모": "",
                "승인일": "",
                "generatedAt": head.get("generatedAt") or "",
                "sourceMode": head.get("sourceMode") or "",
                "note": "매매가_범위는 참고만 — Golden 매매가(G) 자동 반영 금지. 예상초투→실투자금, P→프리미엄 후보.",
            }
        )
    return proposals


def write_zone_proposals_csv(proposals: list[dict[str, str]], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=ZONE_PROPOSAL_COLUMNS)
        writer.writeheader()
        writer.writerows(proposals)


def push_google_sheet(
    rows: list[dict[str, str]],
    *,
    spreadsheet_id: str,
    tab_name: str = TAB_NAME,
) -> str:
    """Create/replace tab `매물` via gspread. Raises if gspread/auth unavailable."""
    try:
        import gspread
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError as exc:
        raise SystemExit(
            "gspread/google-auth not installed. "
            "pip install gspread google-auth google-auth-oauthlib google-api-python-client\n"
            f"CSV was still written; import it manually as sheet '{tab_name}'.\n"
            f"detail: {exc}"
        ) from exc

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds_path = Path.home() / ".config" / "seedfit" / "google_sheets_token.json"
    client_secret = Path.home() / ".config" / "seedfit" / "client_secret.json"
    creds: Credentials | None = None

    if creds_path.exists():
        creds = Credentials.from_authorized_user_file(str(creds_path), scopes)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        creds_path.write_text(creds.to_json(), encoding="utf-8")
    if not creds or not creds.valid:
        if not client_secret.exists():
            raise SystemExit(
                f"Missing OAuth client secret at {client_secret}. "
                f"CSV is ready for manual import as tab '{tab_name}'. "
                "Place Google Desktop OAuth client_secret.json there, re-run with --push."
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(client_secret), scopes)
        creds = flow.run_local_server(port=0)
        creds_path.parent.mkdir(parents=True, exist_ok=True)
        creds_path.write_text(creds.to_json(), encoding="utf-8")

    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(spreadsheet_id)

    try:
        worksheet = spreadsheet.worksheet(tab_name)
        spreadsheet.del_worksheet(worksheet)
    except gspread.WorksheetNotFound:
        pass

    values = [SHEET_COLUMNS] + [[row.get(col, "") for col in SHEET_COLUMNS] for row in rows]
    rows_n = max(len(values), 2)
    cols_n = len(SHEET_COLUMNS)
    worksheet = spreadsheet.add_worksheet(title=tab_name, rows=rows_n, cols=cols_n)
    worksheet.update(values, value_input_option="USER_ENTERED")
    _apply_dropdowns(worksheet, len(rows))
    return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/#gid={worksheet.id}"


def _col_letter(idx0: int) -> str:
    """0-based index → A1 column letters."""
    n = idx0 + 1
    letters = ""
    while n:
        n, rem = divmod(n - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


def _apply_dropdowns(worksheet: Any, data_rows: int) -> None:
    """Attach list validation for 검수상태 / 승인 / Golden반영."""
    if data_rows <= 0:
        return
    try:
        from googleapiclient.discovery import build
    except ImportError:
        return

    col_index = {name: i for i, name in enumerate(SHEET_COLUMNS)}
    end_row = data_rows + 1  # header is row 1
    requests = []
    for col_name, choices in (
        ("검수상태", DROPDOWN_검수상태),
        ("승인", [c for c in DROPDOWN_승인 if c != ""]),
        ("Golden반영", [c for c in DROPDOWN_Golden반영 if c != ""]),
    ):
        if col_name not in col_index:
            continue
        idx = col_index[col_name]
        requests.append(
            {
                "setDataValidation": {
                    "range": {
                        "sheetId": worksheet.id,
                        "startRowIndex": 1,
                        "endRowIndex": end_row,
                        "startColumnIndex": idx,
                        "endColumnIndex": idx + 1,
                    },
                    "rule": {
                        "condition": {
                            "type": "ONE_OF_LIST",
                            "values": [{"userEnteredValue": v} for v in choices],
                        },
                        "showCustomUi": True,
                        "strict": False,
                    },
                }
            }
        )
    if not requests:
        return
    # gspread worksheet has spreadsheet attribute
    try:
        worksheet.spreadsheet.batch_update({"requests": requests})
    except Exception as exc:
        print(f"warn: dropdown validation skipped: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export listings to staging '매물' tab (review/approve before Golden)."
    )
    parser.add_argument(
        "--input",
        type=Path,
        required=True,
        help="zone_listing_candidates_*.json from fetch_zone_listing_candidates.",
    )
    parser.add_argument(
        "--golden-csv",
        type=Path,
        help="Golden Sample CSV for 기존 매매가/실투자금 columns (anomaly anchor).",
    )
    parser.add_argument("--limit", type=int, default=5, help="Max listings per zone (default 5).")
    parser.add_argument(
        "--output",
        type=Path,
        help="CSV path (default: data/reports/매물_sheet_{YYMMDD}.csv).",
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Create/replace Google Sheet tab '매물' (needs gspread + OAuth under ~/.config/seedfit/).",
    )
    parser.add_argument("--sheet-id", default=DEFAULT_SHEET_ID)
    parser.add_argument("--tab-name", default=TAB_NAME)
    args = parser.parse_args()

    report = load_json(args.input)
    baselines = load_golden_baselines(args.golden_csv)
    rows = build_sheet_rows(report, limit=args.limit, baselines=baselines)
    proposals = build_zone_proposals(rows)
    today = date.today().strftime("%y%m%d")
    out = args.output or Path(f"data/reports/매물_sheet_{today}.csv")
    write_csv(rows, out)
    prop_out = out.with_name(out.stem.replace("매물_sheet", "구역_통합본") + ".csv")
    if "매물_sheet" not in out.stem:
        prop_out = out.with_name(f"구역_통합본_{today}.csv")
    write_zone_proposals_csv(proposals, prop_out)
    print(
        f"wrote rows={len(rows)} baselines={len(baselines)} csv={out.as_posix()} "
        f"zone_proposals={len(proposals)} → {prop_out.as_posix()} "
        "(staging only — do not treat 호가 as 실투자금)"
    )

    if args.push:
        url = push_google_sheet(rows, spreadsheet_id=args.sheet_id, tab_name=args.tab_name)
        print(f"pushed tab={args.tab_name} {url}")
    else:
        print(
            f"Import tip: Google Sheet → File → Import → Upload {out.name} → "
            f"Insert new sheet(s) / replace tab named '{args.tab_name}'. "
            "Fill 설명_초투(억) + 검수상태=ok + 승인=Y, then "
            "python scripts/data/apply_approved_listing_investments.py --input …"
        )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
