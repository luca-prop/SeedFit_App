#!/usr/bin/env python3
"""Regenerate DATA_CURATION_SPEC section 2 zone tables + 레퍼런스 단지 List from golden JSON.

SoT: Golden Sample sheet columns ``비교 기축 아파트`` + ``기축 아파트 시세(억)``.
Owned by /seedfit-golden-sample-update. The 59-type Naver Land set (/seedfit-reference-apt59-crawling) does not update these.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from decimal import Decimal
from pathlib import Path
from typing import Any

EOK_KRW = Decimal("100000000")

SECTION2_MARKER = "## 2. 재개발 구역 마스터 데이터"
REFERENCE_MARKER = "### 🏢 레퍼런스 단지 List"
SECTION3_MARKER = "## 3. 대조군 기축 아파트 데이터"
DISTRICT_MARKER = "### 📍"

TABLE_HEADER = (
    "| 구역명 | 행정동 | 현재 단계 | 예상 실투자금 | P | 자동 매칭 분류(참고) | 특징/호재 | 비교 기축 아파트 (84타입 기준) |"
)
TABLE_SEPARATOR = "| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |"


def fmt_eok_number(krw: int | None) -> str | None:
    if krw is None:
        return None
    value = (Decimal(krw) / EOK_KRW).normalize()
    text = format(value, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def fmt_eok(krw: int | None) -> str | None:
    number = fmt_eok_number(krw)
    return f"{number}억" if number is not None else None


def render_investment(min_krw: int | None, max_krw: int | None) -> str:
    min_text = fmt_eok(min_krw)
    max_text = fmt_eok(max_krw)
    if min_text and max_text:
        return f"약 {min_text} ~ {max_text}"
    if min_text:
        return f"약 {min_text}"
    if max_text:
        return f"약 {max_text}"
    return ""


def render_tier(min_krw: int | None) -> str:
    if min_krw is None:
        return "-"
    eok = Decimal(min_krw) / EOK_KRW
    if eok < 3:
        return "T1"
    if eok < 5:
        return "T2"
    if eok < 10:
        return "T3"
    return "T4"


def render_notes(notes: str | None) -> str:
    if not notes:
        return ""
    return notes.replace("\r\n", "\n").replace("\n", "<br>")


def render_reference_cell(hint: dict[str, Any] | None) -> str:
    if not hint:
        return ""
    name = hint["apartmentName"]
    price = fmt_eok(hint.get("currentPriceKrw"))
    if hint.get("isPresale"):
        if price:
            return f"{name}  (분양권) {price}"
        return f"{name}  (분양권)"
    if price:
        return f"{name} {price}"
    return name


def hints_by_zone(golden: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for hint in golden["referenceApartmentHints"]:
        grouped[hint["zoneNaturalKey"]].append(hint)
    for key in grouped:
        grouped[key].sort(key=lambda item: int(item.get("priority") or 1))
    return grouped


def render_section2(golden: dict[str, Any]) -> str:
    snapshot_by_key = {
        snapshot["zoneNaturalKey"]: snapshot for snapshot in golden["zoneInvestmentSnapshots"]
    }
    zone_hints = hints_by_zone(golden)

    district_order: list[str] = []
    zones_by_district: dict[str, list[dict[str, Any]]] = {}
    for zone in golden["zones"]:
        district = zone["district"]
        if district not in zones_by_district:
            zones_by_district[district] = []
            district_order.append(district)
        zones_by_district[district].append(zone)

    blocks: list[str] = []
    for district in district_order:
        rows: list[str] = []
        for zone in zones_by_district[district]:
            snapshot = snapshot_by_key.get(zone["naturalKey"], {})
            investment = render_investment(
                snapshot.get("investmentMinKrw"), snapshot.get("investmentMaxKrw")
            )
            premium = render_investment(
                snapshot.get("premiumMinKrw"), snapshot.get("premiumMaxKrw")
            )
            tier = render_tier(snapshot.get("investmentMinKrw"))
            notes = render_notes(zone.get("notes"))
            primary = zone_hints.get(zone["naturalKey"], [None])[0]
            reference = render_reference_cell(primary)
            rows.append(
                f"| **{zone['zoneName']}** | {zone.get('dong') or ''} | "
                f"{zone.get('stage') or ''} | {investment} | {premium or '—'} | {tier} | {notes} | {reference} |"
            )
        block = "\n".join([f"{DISTRICT_MARKER} {district}", TABLE_HEADER, TABLE_SEPARATOR, *rows])
        blocks.append(block)

    return "\n\n".join(blocks)


def format_update_date(source_date: str | None) -> str:
    """Convert YYMMDD (or YYYYMMDD) to YYYY.MM.DD."""
    if not source_date:
        return ""
    digits = re.sub(r"\D", "", source_date)
    if len(digits) == 6:
        year = 2000 + int(digits[0:2])
        return f"{year}.{digits[2:4]}.{digits[4:6]}"
    if len(digits) == 8:
        return f"{digits[0:4]}.{digits[4:6]}.{digits[6:8]}"
    return source_date


def build_reference_list_items(golden: dict[str, Any]) -> list[str]:
    zones = {zone["naturalKey"]: zone for zone in golden["zones"]}
    grouped: dict[tuple[str, bool], dict[str, Any]] = {}
    order: list[tuple[str, bool]] = []

    for hint in golden["referenceApartmentHints"]:
        zone = zones.get(hint["zoneNaturalKey"])
        if zone is None:
            continue
        key = (hint["apartmentName"], bool(hint["isPresale"]))
        if key not in grouped:
            grouped[key] = {
                "apartmentName": hint["apartmentName"],
                "isPresale": bool(hint["isPresale"]),
                "prices": set(),
                "dongs_by_district": defaultdict(set),
            }
            order.append(key)
        bucket = grouped[key]
        if hint.get("currentPriceKrw") is not None:
            bucket["prices"].add(int(hint["currentPriceKrw"]))
        bucket["dongs_by_district"][zone["district"]].add(zone.get("dong") or "")

    # Stable order: first-seen in golden zone order (already via hints), then by district label.
    items: list[str] = []
    for index, key in enumerate(order, start=1):
        bucket = grouped[key]
        label_parts: list[str] = []
        for district in sorted(bucket["dongs_by_district"]):
            dongs = sorted(d for d in bucket["dongs_by_district"][district] if d)
            if dongs:
                label_parts.append(f"{district} {'/'.join(dongs)}")
            else:
                label_parts.append(district)
        geo = " / ".join(label_parts)
        prices = sorted(bucket["prices"])
        price_text = fmt_eok_number(prices[0]) if prices else None
        name = bucket["apartmentName"]
        if bucket["isPresale"] and price_text:
            apt = f"{name} ({price_text}억, 분양권)"
        elif price_text:
            apt = f"{name} ({price_text}억)"
        elif bucket["isPresale"]:
            apt = f"{name} (분양권)"
        else:
            apt = name
        items.append(f"{index}. **{geo}:** {apt}")
    return items


def render_reference_list_block(golden: dict[str, Any]) -> str:
    update_date = format_update_date(golden.get("source", {}).get("sourceDate"))
    items = build_reference_list_items(golden)
    lines = [
        "### 🏢 레퍼런스 단지 List (잠재미래가치 비교)",
        "*84타입(34평형) 기준 주요 비교 대상 신축/준신축 기축 단지*",
        f"*최신 업데이트:{update_date}*",
        "",
        "> **SoT 규칙 (Golden Sample → List):** `비교 기축 아파트` + `기축 아파트 시세(억)` 열이 원천이다.",
        "> `/seedfit-golden-sample-update`가 구글 시트(Golden Sample)에서 이 List와 `## 2.` 비교 기축 열을 **함께** 갱신한다.",
        "> 같은 단지가 여러 구역에 쓰이면 행정구·행정동을 묶어 한 줄로 정리한다.",
        "> 59타입 Naver Land 세트(`/seedfit-reference-apt59-crawling`)로는 이 List·비교 기축 열을 갱신하지 않는다. (`## 3.` 대조군만)",
        "",
        *items,
        "",
    ]
    return "\n".join(lines)


def apply_to_spec(spec_text: str, section2: str, reference_list: str) -> str:
    section_start = spec_text.find(SECTION2_MARKER)
    first_district = spec_text.find(DISTRICT_MARKER, section_start)
    reference_start = spec_text.find(REFERENCE_MARKER, first_district)
    section3_start = spec_text.find(SECTION3_MARKER, reference_start)
    if min(section_start, first_district, reference_start, section3_start) < 0:
        raise ValueError("Could not locate section 2 / reference list / section 3 boundaries.")

    # Keep a blank line before section 3.
    return (
        spec_text[:first_district]
        + section2
        + "\n\n"
        + reference_list
        + "\n---\n"
        + spec_text[section3_start:]
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Render DATA_CURATION_SPEC section 2 zone tables and reference list from golden."
    )
    parser.add_argument(
        "--golden",
        default=Path("data/normalized/golden_samples260519.normalized.json"),
        type=Path,
    )
    parser.add_argument("--spec", default=Path("docs/DATA_CURATION_SPEC.v.2.md"), type=Path)
    parser.add_argument("--write", action="store_true", help="Write changes back into the spec file.")
    parser.add_argument(
        "--out",
        type=Path,
        help="Write the rendered preview (UTF-8) to this path instead of stdout.",
    )
    args = parser.parse_args()

    golden = json.loads(args.golden.read_text(encoding="utf-8"))
    spec_text = args.spec.read_text(encoding="utf-8")

    section2 = render_section2(golden)
    reference_list = render_reference_list_block(golden)
    rendered = section2 + "\n\n" + reference_list

    if args.write:
        updated = apply_to_spec(spec_text, section2, reference_list)
        args.spec.write_text(updated, encoding="utf-8")
        print(
            f"wrote section 2 + reference list to {args.spec.as_posix()} "
            f"({len(golden['zones'])} zones, {len(golden['referenceApartmentHints'])} hints)"
        )
    elif args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(rendered + "\n", encoding="utf-8")
        print(f"wrote section 2 preview to {args.out.as_posix()} ({len(golden['zones'])} zones)")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
