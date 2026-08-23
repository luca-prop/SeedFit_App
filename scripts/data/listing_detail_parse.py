#!/usr/bin/env python3
"""Parse listing detail hints from Naver article fields + free-text description.

Extracts: 초투/실투, 프리미엄, 대지지분, 전용/공급면적, 층 — as *hints* for human review.
Never treat parsed values as Golden-ready without approval.
"""

from __future__ import annotations

import re
from typing import Any

EOK_NUM = r"(\d+(?:\.\d+)?)\s*(?:억)?"
MANWON_NUM = r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:만\s*원|만원|만)?"

RE_CHOTU = re.compile(
    r"(?:초\s*투(?:자금)?|초기\s*투자(?:금)?|실\s*투(?:자금)?|실투자금)\s*(?:금액)?\s*[:=\-~.]?\s*(?:약\s*)?",
    re.I,
)
# 갭 = 매매가 − 전세가, i.e. the cash an operator actually needs; treated as a separate hint.
RE_GAP = re.compile(
    r"(?:갭\s*(?:투자)?(?:시)?|갭\s*매수)\s*[:=\-~.]?\s*(?:약\s*)?",
    re.I,
)
# 전세/보증금/월세 as written in sale copy ("전세2억8천", "보증금 3억", "월세 80만").
RE_JEONSE = re.compile(
    r"(?:전\s*세(?:가)?|보증금|기\s*보증금)\s*[:=\-~.]?\s*(?:약\s*)?",
    re.I,
)
RE_WOLSE = re.compile(
    rf"(?:월\s*세)[^0-9]{{0,4}}?\s*(?:약\s*)?(\d+(?:,\d{{3}})*(?:\.\d+)?)\s*(?:만\s*원|만원|만)?",
    re.I,
)
# UI copy often writes "기보증금/월세 9,000/30만원" or "9000/30".
RE_DEPOSIT_RENT_SLASH = re.compile(
    r"(?:기\s*보증금|보증금)?\s*/?\s*(?:월\s*세)?\s*[:=\-]?\s*"
    r"(\d{1,3}(?:,\d{3})+|\d{2,})\s*/\s*(\d+(?:\.\d+)?)\s*(?:만\s*원|만원|만)?",
    re.I,
)
# 현장 표기: 프리미엄 / 프미 / P / 피 + 금액.
# '피'는 단독 음절만 인정 — "피8억", "피 15억", "피10억4천". "커피"·"피부"는 제외.
# P 뒤에 점만 찍는 표기(P.5.44억)도 허용.
RE_PREMIUM = re.compile(
    r"(?:프리미엄|프미|(?<![A-Za-z])P|(?<![가-힣A-Za-z0-9])피(?![가-힣]))\s*[:=\-~.]?\s*(?:약\s*)?",
    re.I,
)

PYEONG_PER_M2 = 0.3025
RE_LAND = re.compile(
    rf"(?:대지지분|대지)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:㎡|m2|평)?",
    re.I,
)
RE_EXCL = re.compile(
    rf"(?:전용(?:면적)?)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:㎡|m2|평)?",
    re.I,
)
RE_SUPPLY = re.compile(
    rf"(?:공급(?:면적)?)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:㎡|m2|평)?",
    re.I,
)


def _to_float(text: str | None) -> float | None:
    if text is None:
        return None
    try:
        return float(str(text).replace(",", "").strip())
    except ValueError:
        return None


def parse_eok_amount(text: str) -> float | None:
    """Parse the first Korean-money span in `text` into 억.

    Handles the field forms that used to drop the 천만 단위:
      3.8억 / 3억8천 / 3억8천만원 / 4억8,900 / 4억6천만원 / 47,567만원
    """
    if not text:
        return None
    s = text.lstrip(" \t:=~-.")
    m_digit = re.search(r"\d", s)
    if not m_digit:
        return None
    s = s[m_digit.start() :]

    m = re.match(
        r"(?P<eok>\d+(?:\.\d+)?)\s*억(?P<rest>.{0,16})?",
        s,
    )
    if m:
        total = float(m.group("eok"))
        total += _eok_fraction(m.group("rest") or "")
        return round(total, 4) if total > 0 else None

    m = re.match(
        r"(?P<man>\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:만\s*원|만원|만)?",
        s,
    )
    if m:
        man = float(m.group("man").replace(",", ""))
        # 41,000 / 47567 / 49000 → 만원. 3.8 already caught as 억.
        if man >= 100:
            return round(man / 10_000, 4)
    return None


def _eok_fraction(rest: str) -> float:
    """Convert the tail after '억' into 억. Empty / non-money → 0."""
    rest = (rest or "").replace(" ", "")
    if not rest:
        return 0.0
    m = re.match(r"(\d+(?:\.\d+)?)\s*천만(?:원)?", rest)
    if m:
        n = float(m.group(1))
        extra = 0.0
        m_baek = re.search(r"(\d+)\s*백", rest)
        if m_baek:
            extra = float(m_baek.group(1)) / 100.0
        return n / 10.0 + extra
    m = re.match(r"(\d+(?:\.\d+)?)\s*천(?:만(?:원)?)?", rest)
    if m:
        n = float(m.group(1))
        extra = 0.0
        m_baek = re.search(r"(\d+)\s*백", rest)
        if m_baek:
            extra = float(m_baek.group(1)) / 100.0
        return n / 10.0 + extra
    m = re.match(r"(\d{1,3}(?:,\d{3})+)", rest)
    if m:
        return float(m.group(1).replace(",", "")) / 10_000
    m = re.match(r"(\d{4,6})\b", rest)
    if m:
        n = float(m.group(1))
        if n >= 1000:
            return n / 10_000  # "4억6970" → 0.697억
    m = re.match(r"(\d+(?:\.\d+)?)\s*(?:만\s*원|만원|만)", rest)
    if m:
        return float(m.group(1)) / 10_000
    return 0.0


def _first_money(pattern: re.Pattern[str], text: str) -> float | None:
    """First keyword hit whose following span actually parses as money."""
    for match in pattern.finditer(text):
        value = parse_eok_amount(text[match.end() :])
        if value is not None:
            return value
    return None


def m2_to_pyeong(value: float | None) -> float | None:
    if value is None:
        return None
    return round(value * PYEONG_PER_M2, 1)


def fmt_area_with_pyeong(value: float | None) -> str:
    """'29.52㎡(8.9평)' — operators read 평, the API speaks ㎡."""
    if value is None:
        return ""
    m2 = f"{value:.2f}".rstrip("0").rstrip(".")
    pyeong = m2_to_pyeong(value)
    if not pyeong:
        return f"{m2}㎡"
    return f"{m2}㎡({pyeong}평)"


def _first_area(*values: Any) -> float | None:
    for v in values:
        n = _to_float(v)
        if n is not None and n > 0:
            return n
    return None


def extract_listing_details(raw: dict[str, Any], *, description: str = "", title: str = "") -> dict[str, Any]:
    """Return structured detail fields for review UI / 매물 sheet."""
    text = " ".join(
        str(x)
        for x in (
            title,
            description,
            raw.get("atclFetrDesc"),
            raw.get("articleFeatureDesc"),
            raw.get("featureDesc"),
            raw.get("tagList"),
        )
        if x
    )

    # Area from structured fields (Naver cluster often uses spc1/spc2 in ㎡)
    exclusive_m2 = _first_area(
        raw.get("spc2"),
        raw.get("exclusiveSpace"),
        raw.get("excluUseAr"),
        raw.get("exclusiveArea"),
        raw.get("area2"),
    )
    supply_m2 = _first_area(
        raw.get("spc1"),
        raw.get("supplySpace"),
        raw.get("supplyArea"),
        raw.get("area1"),
    )
    land_m2 = _first_area(
        raw.get("landArea"),
        raw.get("landSpc"),
        raw.get("plotArea"),
        raw.get("grandSpc"),
    )

    m = RE_EXCL.search(text)
    if exclusive_m2 is None and m:
        exclusive_m2 = _to_float(m.group(1))
    m = RE_SUPPLY.search(text)
    if supply_m2 is None and m:
        supply_m2 = _to_float(m.group(1))
    m = RE_LAND.search(text)
    if land_m2 is None and m:
        land_m2 = _to_float(m.group(1))

    chotu_eok = _first_money(RE_CHOTU, text)
    gap_eok = _first_money(RE_GAP, text)
    premium_eok = _first_money(RE_PREMIUM, text)
    jeonse_eok = _first_money(RE_JEONSE, text)
    wolse_manwon = None

    # Slash form first — otherwise RE_WOLSE greedily eats the deposit side of "9,000/30".
    m_slash = RE_DEPOSIT_RENT_SLASH.search(text)
    if m_slash:
        dep_manwon = _to_float(m_slash.group(1))
        rent_part = _to_float(m_slash.group(2))
        if dep_manwon is not None and jeonse_eok is None:
            jeonse_eok = round(dep_manwon / 10_000, 4)
        if rent_part is not None:
            wolse_manwon = rent_part
    else:
        m_wolse = RE_WOLSE.search(text)
        if m_wolse:
            wolse_manwon = _to_float(m_wolse.group(1))

    floor = (
        raw.get("flrInfo")
        or raw.get("floorInfo")
        or raw.get("floor")
        or ""
    )
    direction = raw.get("direction") or raw.get("directionCdNm") or ""
    confirm_date = raw.get("atclCfmYmd") or raw.get("confirmDate") or raw.get("articleConfirmYmd") or ""

    def fmt_num(n: float | None) -> str:
        if n is None:
            return ""
        text_n = f"{n:.2f}".rstrip("0").rstrip(".")
        return text_n

    return {
        "exclusiveM2": exclusive_m2,
        "supplyM2": supply_m2,
        "landShareM2": land_m2,
        "exclusivePyeong": m2_to_pyeong(exclusive_m2),
        "supplyPyeong": m2_to_pyeong(supply_m2),
        "landSharePyeong": m2_to_pyeong(land_m2),
        "floorInfo": str(floor).strip(),
        "direction": str(direction).strip(),
        "confirmDate": str(confirm_date).strip(),
        "hintChotuEok": chotu_eok,
        "hintGapEok": gap_eok,
        "hintPremiumEok": premium_eok,
        "hintJeonseEok": jeonse_eok,
        "hintWolseManwon": wolse_manwon,
        "exclusiveM2Text": fmt_area_with_pyeong(exclusive_m2),
        "supplyM2Text": fmt_area_with_pyeong(supply_m2),
        "landShareM2Text": fmt_area_with_pyeong(land_m2),
        "hintChotuEokText": fmt_num(chotu_eok),
        "hintGapEokText": fmt_num(gap_eok),
        "hintPremiumEokText": fmt_num(premium_eok),
        "hintJeonseEokText": fmt_num(jeonse_eok),
        "hintWolseManwonText": fmt_num(wolse_manwon),
        "detailSummary": _summary(
            exclusive_m2=exclusive_m2,
            supply_m2=supply_m2,
            land_m2=land_m2,
            floor=str(floor).strip(),
            chotu=chotu_eok,
            gap=gap_eok,
            premium=premium_eok,
            jeonse=jeonse_eok,
            wolse=wolse_manwon,
        ),
    }


def _summary(
    *,
    exclusive_m2: float | None,
    supply_m2: float | None,
    land_m2: float | None,
    floor: str,
    chotu: float | None,
    gap: float | None,
    premium: float | None,
    jeonse: float | None = None,
    wolse: float | None = None,
) -> str:
    parts: list[str] = []
    if chotu is not None:
        parts.append(f"초투힌트 {chotu}억")
    if gap is not None:
        parts.append(f"갭힌트 {gap}억")
    if premium is not None:
        parts.append(f"P힌트 {premium}억")
    if jeonse is not None:
        parts.append(f"전세힌트 {jeonse}억")
    if wolse is not None:
        parts.append(f"월세힌트 {wolse}만")
    if exclusive_m2 is not None:
        parts.append(f"전용 {fmt_area_with_pyeong(exclusive_m2)}")
    if supply_m2 is not None:
        parts.append(f"공급 {fmt_area_with_pyeong(supply_m2)}")
    if land_m2 is not None:
        parts.append(f"대지지분 {fmt_area_with_pyeong(land_m2)}")
    if floor:
        parts.append(f"층 {floor}")
    return " · ".join(parts)

def resolve_deposit_eok(item: dict[str, Any]) -> float:
    """기보증금(억). Priority: structured warrant → hintJeonse → 0.

    Missing deposit is treated as 0 so 예상 초투 falls back to the full ask price.
    """
    for key in ("warrantEok", "depositEok", "hintJeonseEok"):
        value = item.get(key)
        if isinstance(value, (int, float)) and value > 0:
            return float(value)
    return 0.0


def estimate_chotu_eok(price_krw: int | None, deposit_eok: float | None) -> float | None:
    """예상 초투(억) = 매매호가 − 기보증금. deposit missing → 0."""
    if price_krw is None:
        return None
    price_eok = price_krw / 100_000_000
    deposit = float(deposit_eok or 0.0)
    return round(max(price_eok - deposit, 0.0), 4)
