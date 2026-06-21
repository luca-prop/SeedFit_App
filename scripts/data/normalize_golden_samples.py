#!/usr/bin/env python3
"""Normalize SeedFit golden sample CSV into MVP upsert payload JSON."""

from __future__ import annotations

import argparse
import csv
import json
import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

EOK_KRW = Decimal("100000000")

STAGE_CORRECTIONS = {
    "연변 부여": "연번 부여",
}

ALLOWED_STAGES = {
    "관리처분인가",
    "사업시행인가",
    "사업시행자 지정",
    "시공사선정",
    "시공사 선정",
    "조합설립인가",
    "추진위 승인",
    "추진위설립",
    "정비구역지정",
    "정비구역 지정",
    "신속통합기획 확정",
    "신속통합기획 완료",
    "신속통합기획 대상지 선정",
    "(모아)통합심의통과",
    "(모아)관리계획고시",
    "(모아)관리계획수립",
    "(모아)대상지 선정",
    "연번 부여",
    "추진준비",
}


@dataclass
class WarningItem:
    row: int
    code: str
    message: str
    zoneNaturalKey: str | None = None


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"[ \t]+", " ", value.strip())
    return cleaned or None


def natural_key(district: str | None, dong: str | None, zone_name: str | None) -> str:
    return "|".join([district or "", dong or "", zone_name or ""])


def source_date_from_filename(path: Path) -> str:
    match = re.search(r"(\d{2})(\d{2})(\d{2})", path.name)
    if not match:
        raise ValueError(f"Cannot infer source date from filename: {path.name}")
    yy, mm, dd = match.groups()
    return f"20{yy}-{mm}-{dd}"


def normalize_stage(value: str | None) -> str | None:
    if value is None:
        return None
    return STAGE_CORRECTIONS.get(value, value)


def derive_project_type(zone_name: str | None, stage: str | None) -> str:
    haystack = f"{zone_name or ''} {stage or ''}"
    if "재건축" in haystack:
        return "reconstruction"
    if "모아" in haystack:
        return "moa_town"
    return "redevelopment"


def parse_eok_to_krw(value: str | None) -> int | None:
    if value is None:
        return None
    normalized = (
        value.replace(",", "")
        .replace("약", "")
        .replace("억원", "")
        .replace("억", "")
        .strip()
    )
    if not normalized:
        return None
    try:
        return int(Decimal(normalized) * EOK_KRW)
    except InvalidOperation as exc:
        raise ValueError(f"Invalid eok money value: {value}") from exc


def parse_eok_range(value: str | None) -> tuple[int | None, int | None]:
    if value is None:
        return None, None
    normalized = value.strip()
    if not normalized:
        return None, None
    parts = re.split(r"\s*[~～-]\s*", normalized, maxsplit=1)
    if len(parts) == 1:
        parsed = parse_eok_to_krw(parts[0])
        return parsed, parsed
    return parse_eok_to_krw(parts[0]), parse_eok_to_krw(parts[1])


def split_reference_apartments(value: str | None) -> list[str]:
    if value is None:
        return []
    parts = [clean_text(part) for part in re.split(r"\s*/\s*", value)]
    return [part for part in parts if part]


def parse_reference_hint(raw_name: str, fallback_price_krw: int | None, part_count: int) -> dict[str, Any]:
    embedded_price_match = re.search(r"(\d+(?:\.\d+)?)\s*억", raw_name)
    embedded_price_krw = parse_eok_to_krw(embedded_price_match.group(1)) if embedded_price_match else None
    is_presale = "분양권" in raw_name
    apartment_name = re.sub(r"\d+(?:\.\d+)?\s*억", "", raw_name)
    apartment_name = apartment_name.replace("(분양권)", "").replace("분양권", "")
    apartment_name = clean_text(apartment_name)
    price_krw = embedded_price_krw or (fallback_price_krw if part_count == 1 else None)
    return {
        "apartmentName": apartment_name,
        "currentPriceKrw": price_krw,
        "embeddedPriceKrw": embedded_price_krw,
        "isPresale": is_presale,
        "rawValue": raw_name,
    }


def normalize(input_path: Path, output_path: Path) -> dict[str, Any]:
    source_date = source_date_from_filename(input_path)
    zones_by_key: dict[str, dict[str, Any]] = {}
    snapshots: list[dict[str, Any]] = []
    reference_hints: list[dict[str, Any]] = []
    warnings: list[WarningItem] = []

    with input_path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for row_index, row in enumerate(reader, start=2):
            district = clean_text(row.get("행정구"))
            dong = clean_text(row.get("행정동"))
            zone_name = clean_text(row.get("구역명"))
            stage = normalize_stage(clean_text(row.get("현재 단계")))
            notes = clean_text(row.get("특징/호재"))
            zone_key = natural_key(district, dong, zone_name)

            if not district or not dong or not zone_name:
                warnings.append(WarningItem(row_index, "missing_zone_key", "district, dong, or zone_name is missing", zone_key))
                continue

            if not stage:
                warnings.append(WarningItem(row_index, "missing_stage", "stage is missing", zone_key))
            elif stage not in ALLOWED_STAGES:
                warnings.append(WarningItem(row_index, "unknown_stage", f"unknown stage: {stage}", zone_key))

            if zone_key in zones_by_key:
                warnings.append(WarningItem(row_index, "duplicate_zone", "duplicate district + dong + zone_name", zone_key))

            zones_by_key[zone_key] = {
                "naturalKey": zone_key,
                "district": district,
                "dong": dong,
                "zoneName": zone_name,
                "stage": stage,
                "projectType": derive_project_type(zone_name, stage),
                "notes": notes,
            }

            try:
                sale_min_krw, sale_max_krw = parse_eok_range(clean_text(row.get("매매가")))
                investment_min_krw = parse_eok_to_krw(clean_text(row.get("최소 실투자금(억)")))
                investment_max_krw = parse_eok_to_krw(clean_text(row.get("최대 실투자금(억)")))
                reference_price_krw = parse_eok_to_krw(clean_text(row.get("기축 아파트 시세(억)")))
            except ValueError as exc:
                warnings.append(WarningItem(row_index, "money_parse_error", str(exc), zone_key))
                continue

            if investment_min_krw is not None and investment_max_krw is not None and investment_min_krw > investment_max_krw:
                warnings.append(WarningItem(row_index, "investment_range_inverted", "investment_min_krw is greater than investment_max_krw", zone_key))

            snapshots.append(
                {
                    "zoneNaturalKey": zone_key,
                    "salePriceMinKrw": sale_min_krw,
                    "salePriceMaxKrw": sale_max_krw,
                    "investmentMinKrw": investment_min_krw,
                    "investmentMaxKrw": investment_max_krw,
                    "sourceFile": input_path.name,
                    "sourceDate": source_date,
                }
            )

            raw_reference = clean_text(row.get("비교 기축 아파트"))
            reference_parts = split_reference_apartments(raw_reference)
            parsed_hints = [parse_reference_hint(part, reference_price_krw, len(reference_parts)) for part in reference_parts]
            all_references_have_prices = bool(parsed_hints) and all(hint["embeddedPriceKrw"] is not None for hint in parsed_hints)

            if reference_price_krw is not None and not reference_parts:
                warnings.append(WarningItem(row_index, "reference_price_without_name", "reference price exists without apartment name", zone_key))
            if reference_parts and reference_price_krw is None:
                warnings.append(WarningItem(row_index, "reference_name_without_price", "reference apartment exists without shared price", zone_key))
            if len(reference_parts) > 1 and reference_price_krw is not None and not all_references_have_prices:
                warnings.append(WarningItem(row_index, "ambiguous_reference_price", "shared reference price cannot be safely assigned to multiple apartments", zone_key))

            for priority, hint in enumerate(parsed_hints, start=1):
                if hint["apartmentName"] is None:
                    warnings.append(WarningItem(row_index, "reference_name_parse_error", "reference apartment name parsed empty", zone_key))
                    continue
                if (
                    hint["embeddedPriceKrw"] is not None
                    and reference_price_krw is not None
                    and hint["embeddedPriceKrw"] != reference_price_krw
                    and len(reference_parts) == 1
                ):
                    warnings.append(
                        WarningItem(
                            row_index,
                            "reference_price_mismatch",
                            "embedded reference price differs from shared reference price column",
                            zone_key,
                        )
                    )
                reference_hints.append(
                    {
                        "zoneNaturalKey": zone_key,
                        "priority": priority,
                        "reason": "golden sample comparison target",
                        **hint,
                    }
                )

    warnings_payload = [warning.__dict__ for warning in warnings]
    payload = {
        "source": {
            "file": str(input_path.as_posix()),
            "sourceDate": source_date,
        },
        "zones": list(zones_by_key.values()),
        "zoneInvestmentSnapshots": snapshots,
        "referenceApartmentHints": reference_hints,
        "summary": {
            "rowCount": len(snapshots),
            "zoneCount": len(zones_by_key),
            "eligibleForReverseFilter": sum(1 for item in snapshots if item["investmentMinKrw"] is not None),
                "withoutCurrentListing": sum(1 for item in snapshots if item["investmentMinKrw"] is None),
            "referenceHintCount": len(reference_hints),
            "warningCount": len(warnings_payload),
            "warnings": warnings_payload,
        },
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize SeedFit golden sample CSV.")
    parser.add_argument("--input", default="docs/golden_samples260519.csv.csv", type=Path)
    parser.add_argument("--output", default="data/normalized/golden_samples260519.normalized.json", type=Path)
    args = parser.parse_args()

    payload = normalize(args.input, args.output)
    summary = payload["summary"]
    print(
        "normalized "
        f"rows={summary['rowCount']} "
        f"zones={summary['zoneCount']} "
        f"eligible={summary['eligibleForReverseFilter']} "
        f"referenceHints={summary['referenceHintCount']} "
        f"warnings={summary['warningCount']} "
        f"output={args.output.as_posix()}"
    )


if __name__ == "__main__":
    main()
