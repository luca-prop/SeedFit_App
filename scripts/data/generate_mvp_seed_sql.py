#!/usr/bin/env python3
"""Generate idempotent Supabase seed/upsert SQL from normalized MVP JSON payloads."""

from __future__ import annotations

import argparse
import json
import re
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

NAMESPACE = uuid.UUID("b1be6f42-2a3a-47b0-8bfb-4b65a8a5f5ed")
DEFAULT_GOLDEN_PATH = Path("data/normalized/golden_samples260519.normalized.json")
DEFAULT_NAVER_PATH = Path("data/normalized/naver_land_0503.normalized.json")
DEFAULT_OUTPUT_PATH = Path("data/seed/seed_mvp_data.sql")
DEFAULT_POLICY_DATE = "2026-06-21"
FUTURE_VALUE_REFERENCE_REASON = "future value reference benchmark"


@dataclass
class ReferenceRecord:
    id: str
    apartment_name: str
    district: str | None
    dong: str | None
    area_m2: float | None
    current_price_krw: int | None
    is_presale: bool
    source_file: str
    source_captured_at: str | None


def deterministic_uuid(kind: str, natural_key: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"{kind}:{natural_key}"))


def sql_string(value: Any) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_bool(value: bool) -> str:
    return "TRUE" if value else "FALSE"


def sql_number(value: Any) -> str:
    return "NULL" if value is None else str(value)


def sql_timestamp(value: str | None) -> str:
    return "NULL" if value is None else f"{sql_string(value)}::timestamptz"


def sql_date(value: str) -> str:
    return f"{sql_string(value)}::date"


def normalize_reference_name(value: str) -> str:
    return re.sub(r"\s+", "", value.strip())


def reference_key(apartment_name: str, area_m2: float | None, is_presale: bool) -> str:
    area_key = "none" if area_m2 is None else str(area_m2)
    return f"{normalize_reference_name(apartment_name)}|{area_key}|{is_presale}"


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_reference_records(golden: dict[str, Any], naver: dict[str, Any]) -> tuple[dict[str, ReferenceRecord], dict[tuple[str, bool], str], list[str]]:
    records: dict[str, ReferenceRecord] = {}
    name_lookup: dict[tuple[str, bool], str] = {}
    warnings: list[str] = []

    for item in naver["referenceApartments"]:
        key = reference_key(item["apartmentName"], item.get("areaM2"), item["isPresale"])
        record_id = deterministic_uuid("reference_apartment", key)
        record = ReferenceRecord(
            id=record_id,
            apartment_name=normalize_reference_name(item["apartmentName"]),
            district=item.get("district"),
            dong=item.get("dong"),
            area_m2=item.get("areaM2"),
            current_price_krw=item.get("currentPriceKrw"),
            is_presale=item["isPresale"],
            source_file=",".join(item.get("sourceFiles") or []),
            source_captured_at=item.get("sourceCapturedAt"),
        )
        records[key] = record
        lookup_key = (record.apartment_name, record.is_presale)
        if lookup_key in name_lookup:
            warnings.append(f"ambiguous_naver_reference:{lookup_key[0]}:{lookup_key[1]}")
        else:
            name_lookup[lookup_key] = key

    for hint in golden["referenceApartmentHints"]:
        apartment_name = normalize_reference_name(hint["apartmentName"])
        is_presale = bool(hint["isPresale"])
        lookup_key = (apartment_name, is_presale)
        if lookup_key in name_lookup:
            continue

        key = reference_key(apartment_name, None, is_presale)
        if key in records:
            continue

        record_id = deterministic_uuid("reference_apartment", key)
        records[key] = ReferenceRecord(
            id=record_id,
            apartment_name=apartment_name,
            district=None,
            dong=None,
            area_m2=None,
            current_price_krw=hint.get("currentPriceKrw"),
            is_presale=is_presale,
            source_file=golden["source"]["file"].split("/")[-1],
            source_captured_at=f"{golden['source']['sourceDate']}T00:00:00+09:00",
        )
        name_lookup[lookup_key] = key

    return records, name_lookup, warnings


def append_header(lines: list[str], golden: dict[str, Any], naver: dict[str, Any], warnings: list[str]) -> None:
    lines.extend(
        [
            "-- SeedFit MVP seed/upsert SQL",
            "-- Generated from normalized JSON payloads.",
            f"-- Golden source: {golden['source']['file']} ({golden['source']['sourceDate']})",
            f"-- Naver sources: {', '.join(naver['source']['files'])}",
            f"-- Warnings: {len(warnings)}",
            "BEGIN;",
            "",
        ]
    )
    for warning in warnings:
        lines.append(f"-- WARNING: {warning}")
    if warnings:
        lines.append("")


def append_ltv_policies(lines: list[str], policy_date: str) -> None:
    policies = [
        ("T1", 100000000, 300000000),
        ("T2", 300000000, 500000000),
        ("T3", 500000000, 1000000000),
        ("T4", 1000000000, None),
    ]
    lines.extend(
        [
            "-- ltv_policies",
            f"DELETE FROM ltv_policies WHERE effective_from = {sql_date(policy_date)};",
        ]
    )
    for tier_name, cash_min, cash_max in policies:
        lines.append(
            "INSERT INTO ltv_policies (id, tier_name, cash_min_krw, cash_max_krw, ltv_ratio, dsr_note, effective_from, effective_to, is_active) "
            f"VALUES ({sql_string(deterministic_uuid('ltv_policy', f'{tier_name}|{policy_date}'))}::uuid, "
            f"{sql_string(tier_name)}, {cash_min}, {sql_number(cash_max)}, NULL, "
            f"{sql_string('MVP cash tier only; LTV ratio not yet verified')}, {sql_date(policy_date)}, NULL, TRUE);"
        )
    lines.append("")


def append_zones(lines: list[str], golden: dict[str, Any]) -> dict[str, str]:
    zone_ids: dict[str, str] = {}
    lines.append("-- zones")
    for zone in golden["zones"]:
        zone_id = deterministic_uuid("zone", zone["naturalKey"])
        zone_ids[zone["naturalKey"]] = zone_id
        lines.append(
            "INSERT INTO zones (id, district, dong, zone_name, stage, coverage, project_type, notes, created_at, updated_at) "
            f"VALUES ({sql_string(zone_id)}::uuid, {sql_string(zone['district'])}, {sql_string(zone['dong'])}, "
            f"{sql_string(zone['zoneName'])}, {sql_string(zone['stage'])}, {sql_string(zone.get('coverage'))}, "
            f"{sql_string(zone.get('projectType'))}, "
            f"{sql_string(zone.get('notes'))}, now(), now()) "
            "ON CONFLICT (district, dong, zone_name) DO UPDATE SET "
            "stage = EXCLUDED.stage, coverage = EXCLUDED.coverage, project_type = EXCLUDED.project_type, "
            "notes = EXCLUDED.notes, updated_at = now();"
        )
    lines.append("")
    return zone_ids


def append_investment_snapshots(lines: list[str], golden: dict[str, Any], zone_ids: dict[str, str]) -> None:
    source_file = golden["source"]["file"].split("/")[-1]
    source_date = golden["source"]["sourceDate"]
    lines.extend(
        [
            "-- zone_investment_snapshots",
            f"DELETE FROM zone_investment_snapshots WHERE source_file = {sql_string(source_file)} AND source_date = {sql_date(source_date)};",
        ]
    )
    for snapshot in golden["zoneInvestmentSnapshots"]:
        zone_id = zone_ids[snapshot["zoneNaturalKey"]]
        snapshot_key = f"{snapshot['zoneNaturalKey']}|{source_file}|{source_date}"
        lines.append(
            "INSERT INTO zone_investment_snapshots "
            "(id, zone_id, sale_price_min_krw, sale_price_max_krw, investment_min_krw, investment_max_krw, source_file, source_date, created_at) "
            f"VALUES ({sql_string(deterministic_uuid('zone_investment_snapshot', snapshot_key))}::uuid, "
            f"{sql_string(zone_id)}::uuid, {sql_number(snapshot.get('salePriceMinKrw'))}, {sql_number(snapshot.get('salePriceMaxKrw'))}, "
            f"{sql_number(snapshot.get('investmentMinKrw'))}, {sql_number(snapshot.get('investmentMaxKrw'))}, "
            f"{sql_string(source_file)}, {sql_date(source_date)}, now());"
        )
    lines.append("")


def append_reference_apartments(lines: list[str], records: dict[str, ReferenceRecord]) -> None:
    lines.append("-- reference_apartments")
    for record in sorted(records.values(), key=lambda item: (item.apartment_name, item.area_m2 or 0, item.is_presale)):
        lines.append(
            "INSERT INTO reference_apartments "
            "(id, apartment_name, district, dong, area_m2, current_price_krw, is_presale, source_file, source_captured_at, updated_at) "
            f"VALUES ({sql_string(record.id)}::uuid, {sql_string(record.apartment_name)}, {sql_string(record.district)}, {sql_string(record.dong)}, "
            f"{sql_number(record.area_m2)}, {sql_number(record.current_price_krw)}, {sql_bool(record.is_presale)}, "
            f"{sql_string(record.source_file)}, {sql_timestamp(record.source_captured_at)}, now()) "
            "ON CONFLICT (id) DO UPDATE SET "
            "apartment_name = EXCLUDED.apartment_name, area_m2 = EXCLUDED.area_m2, is_presale = EXCLUDED.is_presale, "
            "district = EXCLUDED.district, dong = EXCLUDED.dong, current_price_krw = EXCLUDED.current_price_krw, "
            "source_file = EXCLUDED.source_file, source_captured_at = EXCLUDED.source_captured_at, updated_at = now();"
        )
    lines.append("")


def append_zone_reference_links(
    lines: list[str],
    golden: dict[str, Any],
    zone_ids: dict[str, str],
    records: dict[str, ReferenceRecord],
    name_lookup: dict[tuple[str, bool], str],
) -> list[str]:
    warnings: list[str] = []
    lines.append("-- zone_reference_apartments")
    seen_links: set[tuple[str, str]] = set()
    for hint in golden["referenceApartmentHints"]:
        zone_id = zone_ids[hint["zoneNaturalKey"]]
        lookup_key = (normalize_reference_name(hint["apartmentName"]), bool(hint["isPresale"]))
        reference_key_value = name_lookup.get(lookup_key)
        if reference_key_value is None:
            warnings.append(f"missing_reference_link:{hint['zoneNaturalKey']}:{lookup_key[0]}:{lookup_key[1]}")
            continue
        reference_id = records[reference_key_value].id
        link_key = (zone_id, reference_id)
        if link_key in seen_links:
            continue
        seen_links.add(link_key)
        lines.append(
            "INSERT INTO zone_reference_apartments (id, zone_id, reference_apartment_id, priority, reason) "
            f"VALUES ({sql_string(deterministic_uuid('zone_reference_apartment', f'{zone_id}|{reference_id}'))}::uuid, "
            f"{sql_string(zone_id)}::uuid, {sql_string(reference_id)}::uuid, {int(hint['priority'])}, "
            f"{sql_string(FUTURE_VALUE_REFERENCE_REASON)}) "
            "ON CONFLICT (zone_id, reference_apartment_id) DO UPDATE SET priority = EXCLUDED.priority, reason = EXCLUDED.reason;"
        )
    lines.append("")
    return warnings


def generate_sql(golden_path: Path, naver_path: Path, output_path: Path, policy_date: str) -> dict[str, Any]:
    golden = load_json(golden_path)
    naver = load_json(naver_path)
    records, name_lookup, reference_warnings = build_reference_records(golden, naver)

    lines: list[str] = []
    append_header(lines, golden, naver, reference_warnings)
    append_ltv_policies(lines, policy_date)
    zone_ids = append_zones(lines, golden)
    append_investment_snapshots(lines, golden, zone_ids)
    append_reference_apartments(lines, records)
    link_warnings = append_zone_reference_links(lines, golden, zone_ids, records, name_lookup)
    for warning in link_warnings:
        lines.insert(6, f"-- WARNING: {warning}")
    lines.extend(["COMMIT;", ""])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")

    return {
        "zones": len(golden["zones"]),
        "investmentSnapshots": len(golden["zoneInvestmentSnapshots"]),
        "referenceApartments": len(records),
        "zoneReferenceHints": len(golden["referenceApartmentHints"]),
        "warnings": len(reference_warnings) + len(link_warnings),
        "output": output_path.as_posix(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SeedFit MVP Supabase seed/upsert SQL.")
    parser.add_argument("--golden", default=DEFAULT_GOLDEN_PATH, type=Path)
    parser.add_argument("--naver", default=DEFAULT_NAVER_PATH, type=Path)
    parser.add_argument("--output", default=DEFAULT_OUTPUT_PATH, type=Path)
    parser.add_argument("--policy-date", default=DEFAULT_POLICY_DATE)
    args = parser.parse_args()

    summary = generate_sql(args.golden, args.naver, args.output, args.policy_date)
    print(
        "generated "
        f"zones={summary['zones']} "
        f"snapshots={summary['investmentSnapshots']} "
        f"referenceApartments={summary['referenceApartments']} "
        f"zoneReferenceHints={summary['zoneReferenceHints']} "
        f"warnings={summary['warnings']} "
        f"output={summary['output']}"
    )


if __name__ == "__main__":
    main()
