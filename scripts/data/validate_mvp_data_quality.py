#!/usr/bin/env python3
"""Generate MVP data quality reports from normalized payloads and seed SQL."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

DEFAULT_GOLDEN_PATH = Path("data/normalized/golden_samples260519.normalized.json")
DEFAULT_NAVER_PATH = Path("data/normalized/naver_land_0503.normalized.json")
DEFAULT_SEED_SQL_PATH = Path("data/seed/seed_mvp_data.sql")
DEFAULT_JSON_OUTPUT_PATH = Path("data/reports/mvp_data_quality_report.json")
DEFAULT_MARKDOWN_OUTPUT_PATH = Path("docs/MVP_DATA_QUALITY_REPORT260621.md")
PRICE_SPREAD_THRESHOLD = 0.2

ALLOWED_STAGES = {
    "관리처분인가",
    "사업시행인가",
    "사업시행자 지정",
    "시공사선정",
    "시공사 선정",
    "건축심의",
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
    "대상지철회",
}


@dataclass(frozen=True)
class Finding:
    code: str
    severity: str
    message: str
    count: int
    items: list[dict[str, Any]]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def ratio_spread(min_value: int | None, max_value: int | None) -> float | None:
    if min_value is None or max_value is None or min_value <= 0:
        return None
    return (max_value - min_value) / min_value


def duplicate_items(values: list[str]) -> list[dict[str, Any]]:
    counts = Counter(values)
    return [{"naturalKey": key, "count": count} for key, count in sorted(counts.items()) if count > 1]


def inspect_seed_sql(path: Path) -> dict[str, int]:
    sql = path.read_text(encoding="utf-8")
    return {
        "zones": sql.count("INSERT INTO zones"),
        "zoneInvestmentSnapshots": sql.count("INSERT INTO zone_investment_snapshots"),
        "referenceApartments": sql.count("INSERT INTO reference_apartments"),
        "zoneReferenceApartments": sql.count("INSERT INTO zone_reference_apartments"),
        "ltvPolicies": sql.count("INSERT INTO ltv_policies"),
        "futureValueReferenceReasons": sql.count("future value reference benchmark"),
        "legacyComparisonReasons": sql.count("golden sample comparison target"),
        "commitStatements": sql.count("COMMIT;"),
    }


def find_missing_investment_min(golden: dict[str, Any]) -> Finding:
    items = [
        {
            "zoneNaturalKey": snapshot["zoneNaturalKey"],
            "sourceFile": snapshot["sourceFile"],
            "sourceDate": snapshot["sourceDate"],
        }
        for snapshot in golden["zoneInvestmentSnapshots"]
        if snapshot.get("investmentMinKrw") is None
    ]
    return Finding(
        code="missing_investment_min",
        severity="info",
        message="실투자금이 비어 있어 Reverse Filter 대상에서는 제외되지만, 현재 매물 없음 상태로 관리합니다.",
        count=len(items),
        items=items,
    )


def find_inverted_ranges(golden: dict[str, Any]) -> Finding:
    items: list[dict[str, Any]] = []
    for snapshot in golden["zoneInvestmentSnapshots"]:
        for prefix, min_key, max_key in [
            ("sale_price", "salePriceMinKrw", "salePriceMaxKrw"),
            ("investment", "investmentMinKrw", "investmentMaxKrw"),
        ]:
            min_value = snapshot.get(min_key)
            max_value = snapshot.get(max_key)
            if min_value is not None and max_value is not None and min_value > max_value:
                items.append(
                    {
                        "zoneNaturalKey": snapshot["zoneNaturalKey"],
                        "rangeType": prefix,
                        "minKrw": min_value,
                        "maxKrw": max_value,
                    }
                )
    return Finding(
        code="inverted_min_max",
        severity="error",
        message="min 값이 max 값보다 큰 항목입니다. 앱 매칭 전에 수정이 필요합니다.",
        count=len(items),
        items=items,
    )


def find_duplicate_zones(golden: dict[str, Any]) -> Finding:
    items = duplicate_items([zone["naturalKey"] for zone in golden["zones"]])
    return Finding(
        code="duplicate_zone",
        severity="error",
        message="행정구 + 행정동 + 구역명 natural key가 중복된 구역입니다.",
        count=len(items),
        items=items,
    )


def find_unknown_stages(golden: dict[str, Any]) -> Finding:
    items = [
        {"zoneNaturalKey": zone["naturalKey"], "stage": zone.get("stage")}
        for zone in golden["zones"]
        if zone.get("stage") not in ALLOWED_STAGES
    ]
    return Finding(
        code="unknown_stage",
        severity="error",
        message="허용 stage 목록에 없는 단계 값입니다.",
        count=len(items),
        items=items,
    )


def find_large_price_spreads(golden: dict[str, Any], naver: dict[str, Any]) -> Finding:
    items: list[dict[str, Any]] = []
    for snapshot in golden["zoneInvestmentSnapshots"]:
        for range_type, min_key, max_key in [
            ("zone_sale_price_range", "salePriceMinKrw", "salePriceMaxKrw"),
            ("zone_investment_range", "investmentMinKrw", "investmentMaxKrw"),
        ]:
            spread = ratio_spread(snapshot.get(min_key), snapshot.get(max_key))
            if spread is not None and spread >= PRICE_SPREAD_THRESHOLD:
                items.append(
                    {
                        "type": range_type,
                        "naturalKey": snapshot["zoneNaturalKey"],
                        "minKrw": snapshot.get(min_key),
                        "maxKrw": snapshot.get(max_key),
                        "spreadRatio": round(spread, 4),
                    }
                )

    for apartment in naver["referenceApartments"]:
        spread = ratio_spread(apartment.get("priceMinKrw"), apartment.get("priceMaxKrw"))
        if spread is not None and spread >= PRICE_SPREAD_THRESHOLD:
            items.append(
                {
                    "type": "naver_reference_listing_price_range",
                    "naturalKey": apartment["naturalKey"],
                    "apartmentName": apartment["apartmentName"],
                    "minKrw": apartment.get("priceMinKrw"),
                    "maxKrw": apartment.get("priceMaxKrw"),
                    "spreadRatio": round(spread, 4),
                }
            )

    return Finding(
        code="price_spread_over_20_percent",
        severity="warning",
        message="단일 source의 min/max 가격 범위가 20% 이상 벌어진 항목입니다. 시계열 변동률은 sourceDate가 추가된 뒤 별도 산정합니다.",
        count=len(items),
        items=items,
    )


def find_reference_link_mismatches(golden: dict[str, Any], seed_counts: dict[str, int]) -> Finding:
    hint_count = len(golden["referenceApartmentHints"])
    link_count = seed_counts["zoneReferenceApartments"]
    items = [] if hint_count == link_count else [{"referenceHintCount": hint_count, "seedLinkCount": link_count}]
    return Finding(
        code="reference_link_count_mismatch",
        severity="error",
        message="Golden future-value reference hint 수와 seed SQL의 zone-reference link 수가 다릅니다.",
        count=len(items),
        items=items,
    )


def find_seed_count_mismatches(golden: dict[str, Any], naver: dict[str, Any], seed_counts: dict[str, int]) -> Finding:
    expected = {
        "zones": len(golden["zones"]),
        "zoneInvestmentSnapshots": len(golden["zoneInvestmentSnapshots"]),
        # Naver reference apartments plus Golden fallback complexes not present in Naver.
        "zoneReferenceApartments": len(golden["referenceApartmentHints"]),
        "ltvPolicies": 4,
    }
    items = [
        {"name": name, "expected": expected_count, "actual": seed_counts[name]}
        for name, expected_count in expected.items()
        if seed_counts[name] != expected_count
    ]
    if seed_counts["referenceApartments"] < naver["summary"]["referenceApartmentCount"]:
        items.append(
            {
                "name": "referenceApartments",
                "expectedAtLeast": naver["summary"]["referenceApartmentCount"],
                "actual": seed_counts["referenceApartments"],
            }
        )
    return Finding(
        code="seed_count_mismatch",
        severity="error",
        message="정규화 payload 기준 기대 건수와 seed SQL INSERT 건수가 다릅니다.",
        count=len(items),
        items=items,
    )


def summarize_status(findings: list[Finding]) -> str:
    if any(finding.severity == "error" and finding.count > 0 for finding in findings):
        return "fail"
    if any(finding.severity == "warning" and finding.count > 0 for finding in findings):
        return "review"
    return "pass"


def build_report(golden_path: Path, naver_path: Path, seed_sql_path: Path) -> dict[str, Any]:
    golden = load_json(golden_path)
    naver = load_json(naver_path)
    seed_counts = inspect_seed_sql(seed_sql_path)
    findings = [
        find_missing_investment_min(golden),
        find_inverted_ranges(golden),
        find_duplicate_zones(golden),
        find_unknown_stages(golden),
        find_large_price_spreads(golden, naver),
        find_reference_link_mismatches(golden, seed_counts),
        find_seed_count_mismatches(golden, naver, seed_counts),
        Finding(
            code="golden_normalization_warnings",
            severity="warning",
            message="Golden Sample normalization warning count.",
            count=golden["summary"]["warningCount"],
            items=golden["summary"]["warnings"],
        ),
        Finding(
            code="naver_normalization_warnings",
            severity="warning",
            message="Naver Land normalization warning count.",
            count=naver["summary"]["warningCount"],
            items=naver["summary"]["warnings"],
        ),
        Finding(
            code="low_floor_fallback_reference",
            severity="info",
            message="중고층 이상 매물이 없어 저층 기준가로 fallback된 레퍼런스 단지입니다.",
            count=naver["summary"]["lowFloorFallbackCount"],
            items=naver["lowFloorFallbackApartments"],
        ),
    ]
    return {
        "status": summarize_status(findings),
        "sources": {
            "golden": golden["source"],
            "naver": naver["source"],
            "seedSql": seed_sql_path.as_posix(),
        },
        "summary": {
            "goldenRows": golden["summary"]["rowCount"],
            "zones": golden["summary"]["zoneCount"],
            "eligibleForReverseFilter": golden["summary"]["eligibleForReverseFilter"],
            "withoutCurrentListing": golden["summary"]["withoutCurrentListing"],
            "referenceHints": golden["summary"]["referenceHintCount"],
            "naverListings": naver["summary"]["listingCount"],
            "naverReferenceApartments": naver["summary"]["referenceApartmentCount"],
            "seedCounts": seed_counts,
        },
        "findings": [finding.__dict__ for finding in findings],
        "notes": [
            "reference_apartments는 동일 예산 기축 대조군이 아니라 구역별 미래가치 레퍼런스 단지입니다.",
            "DATA_CURATION_SPEC.v.2.md section 3의 LTV 기반 동일 예산 기축 대조군은 MVP-008 검증 대상 데이터에 아직 포함되지 않습니다.",
            "20% 이상 가격 변동은 현재 단일 source min/max range spread로 산정했습니다. sourceDate가 누적되면 시계열 변동률 검증으로 확장해야 합니다.",
            "현재 리포트는 정규화 payload와 seed SQL 산출물 기준 검증입니다. Supabase 실제 row count는 별도 DB client 검증 또는 Dashboard 확인으로 보완합니다.",
        ],
    }


def write_markdown(report: dict[str, Any], output_path: Path) -> None:
    lines = [
        "# SeedFit MVP Data Quality Report 260621",
        "",
        "## 1. Purpose",
        "",
        "This document completes `MVP-008: 데이터 품질 검증 리포트 작성`.",
        "",
        "The report validates normalized Golden Sample data, Naver Land reference evidence, and the generated seed SQL artifact before DB-dependent runtime checks.",
        "",
        "## 2. Overall Status",
        "",
        f"- Status: `{report['status']}`",
        f"- Golden rows: `{report['summary']['goldenRows']}`",
        f"- Zones: `{report['summary']['zones']}`",
        f"- Reverse Filter eligible zones: `{report['summary']['eligibleForReverseFilter']}`",
        f"- Zones without current listing/investment amount: `{report['summary']['withoutCurrentListing']}`",
        f"- Future-value reference hints: `{report['summary']['referenceHints']}`",
        f"- Naver listing evidence rows: `{report['summary']['naverListings']}`",
        f"- Naver reference apartments: `{report['summary']['naverReferenceApartments']}`",
        "",
        "## 3. Seed SQL Counts",
        "",
    ]
    for name, count in report["summary"]["seedCounts"].items():
        lines.append(f"- `{name}`: `{count}`")

    lines.extend(["", "## 4. Findings", ""])
    for finding in report["findings"]:
        lines.extend(
            [
                f"### `{finding['code']}`",
                "",
                f"- Severity: `{finding['severity']}`",
                f"- Count: `{finding['count']}`",
                f"- Meaning: {finding['message']}",
                "",
            ]
        )
        for item in finding["items"][:20]:
            lines.append(f"- `{json.dumps(item, ensure_ascii=False)}`")
        if len(finding["items"]) > 20:
            lines.append(f"- ... and {len(finding['items']) - 20} more")
        lines.append("")

    lines.extend(["## 5. Notes", ""])
    for note in report["notes"]:
        lines.append(f"- {note}")
    lines.append("")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate SeedFit MVP data quality.")
    parser.add_argument("--golden", default=DEFAULT_GOLDEN_PATH, type=Path)
    parser.add_argument("--naver", default=DEFAULT_NAVER_PATH, type=Path)
    parser.add_argument("--seed-sql", default=DEFAULT_SEED_SQL_PATH, type=Path)
    parser.add_argument("--json-output", default=DEFAULT_JSON_OUTPUT_PATH, type=Path)
    parser.add_argument("--markdown-output", default=DEFAULT_MARKDOWN_OUTPUT_PATH, type=Path)
    args = parser.parse_args()

    report = build_report(args.golden, args.naver, args.seed_sql)
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(report, args.markdown_output)

    print(
        "validated "
        f"status={report['status']} "
        f"findings={len(report['findings'])} "
        f"json={args.json_output.as_posix()} "
        f"markdown={args.markdown_output.as_posix()}"
    )


if __name__ == "__main__":
    main()
