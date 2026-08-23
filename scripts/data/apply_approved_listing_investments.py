#!/usr/bin/env python3
"""Apply *approved* 매물-tab rows to Golden Sample investment columns only.

Hard rules:
  - Never copy crawl 호가매매가 → Golden 매매가(G) automatically.
  - Only rows with 승인=Y AND 검수상태=ok AND 설명_초투(억) filled.
  - Default is dry-run; --write required to patch CSV (sheet push is separate/manual).

Zone aggregation: among approved rows for a zone, min/max of 설명_초투(억)
become proposed 최소/최대 실투자금. Operator can still edit Golden by hand.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any

_SCRIPT_DIR = Path(__file__).resolve().parent
import sys

if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from normalize_golden_samples import clean_text, parse_eok_to_krw

EOK_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)\s*$")


def load_review_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def parse_chotu_eok(raw: str | None) -> float | None:
    text = clean_text(raw)
    if not text:
        return None
    # allow "약 3.2" / "3.2억"
    text = text.replace("약", "").replace("억", "").replace(",", "").strip()
    m = EOK_RE.match(text)
    if not m:
        try:
            return float(text)
        except ValueError:
            return None
    return float(m.group(1))


def chotu_anomaly(
    chotu_eok: float,
    baseline_min: str,
    baseline_max: str,
    *,
    soft_pct: float = 0.20,
) -> str:
    lo = parse_eok_to_krw(baseline_min)
    hi = parse_eok_to_krw(baseline_max)
    if lo is None and hi is None:
        return "NO_BASELINE"
    if lo is None:
        lo = hi
    if hi is None:
        hi = lo
    assert lo is not None and hi is not None
    val = int(chotu_eok * 100_000_000)
    soft_lo = int(lo * (1 - soft_pct))
    soft_hi = int(hi * (1 + soft_pct))
    if soft_lo <= val <= soft_hi:
        return "OK"
    if val < soft_lo:
        return "LOW"
    return "HIGH"


def is_zone_proposal_csv(rows: list[dict[str, str]]) -> bool:
    if not rows:
        return False
    keys = set(rows[0].keys())
    return "예상초투_min(억)" in keys and "예상초투_max(억)" in keys


def collect_approved_zone_proposals(
    rows: list[dict[str, str]],
    *,
    approve_pending: bool = False,
) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    """Zone-rollup CSV: 승인=Y → 예상초투 min/max → Golden 실투자금 (+ P)."""
    skipped: list[dict[str, Any]] = []
    proposals: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = clean_text(row.get("zoneNaturalKey")) or ""
        approved = (clean_text(row.get("승인")) or "").upper()
        status = (clean_text(row.get("검수상태")) or "").lower()
        if approved != "Y":
            if approve_pending and not approved and status in {"", "pending", "ok", "통과", "pass"}:
                approved = "Y"
            else:
                skipped.append({"zoneNaturalKey": key, "reason": "not_approved"})
                continue
        if status and status not in {"ok", "통과", "pass", "pending"}:
            # pending allowed only if operator set 승인=Y on rollup download before status sync
            skipped.append({"zoneNaturalKey": key, "reason": f"검수상태={status}"})
            continue
        lo = parse_chotu_eok(row.get("예상초투_min(억)"))
        hi = parse_chotu_eok(row.get("예상초투_max(억)"))
        if lo is None and hi is None:
            skipped.append({"zoneNaturalKey": key, "reason": "missing_예상초투_범위"})
            continue
        if lo is None:
            lo = hi
        if hi is None:
            hi = lo
        assert lo is not None and hi is not None
        if lo > hi:
            lo, hi = hi, lo
        flag_lo = chotu_anomaly(
            lo,
            row.get("기존_최소실투자금(억)") or "",
            row.get("기존_최대실투자금(억)") or "",
        )
        flag_hi = chotu_anomaly(
            hi,
            row.get("기존_최소실투자금(억)") or "",
            row.get("기존_최대실투자금(억)") or "",
        )
        arts = [a for a in (row.get("articleNos") or "").split("|") if a]
        proposals[key] = {
            "zoneNaturalKey": key,
            "district": row.get("행정구"),
            "dong": row.get("행정동"),
            "zoneName": row.get("구역명"),
            "investmentMinEok": lo,
            "investmentMaxEok": hi,
            "premiumMinEok": parse_chotu_eok(row.get("P_min(억)")),
            "premiumMaxEok": parse_chotu_eok(row.get("P_max(억)")),
            "askMinEok": parse_chotu_eok(row.get("매매가_min(억)")),
            "askMaxEok": parse_chotu_eok(row.get("매매가_max(억)")),
            "approvedCount": int(row.get("표본건수") or len(arts) or 1),
            "articleNos": arts,
            "chotuFlags": [flag_lo, flag_hi],
            "hasAnomaly": any(f in {"HIGH", "LOW"} for f in (flag_lo, flag_hi)),
            "baselineMin": row.get("기존_최소실투자금(억)"),
            "baselineMax": row.get("기존_최대실투자금(억)"),
            "source": "zone_rollup",
        }
    return proposals, skipped


def collect_approved(
    rows: list[dict[str, str]],
    *,
    approve_pending: bool = False,
) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    """Return (by_zone proposals, rejected/skipped audit)."""
    if is_zone_proposal_csv(rows):
        return collect_approved_zone_proposals(rows, approve_pending=approve_pending)

    skipped: list[dict[str, Any]] = []
    approved_vals: dict[str, list[tuple[float, dict[str, str]]]] = defaultdict(list)

    for row in rows:
        key = clean_text(row.get("zoneNaturalKey")) or ""
        status = (clean_text(row.get("검수상태")) or "").lower()
        approved = (clean_text(row.get("승인")) or "").upper()
        chotu = parse_chotu_eok(row.get("설명_초투(억)"))
        if approved != "Y":
            skipped.append({"zoneNaturalKey": key, "reason": "not_approved", "articleNo": row.get("articleNo")})
            continue
        if status not in {"ok", "통과", "pass"}:
            skipped.append({"zoneNaturalKey": key, "reason": f"검수상태={status or 'empty'}", "articleNo": row.get("articleNo")})
            continue
        if chotu is None:
            skipped.append({"zoneNaturalKey": key, "reason": "missing_설명_초투", "articleNo": row.get("articleNo")})
            continue
        flag = chotu_anomaly(
            chotu,
            row.get("기존_최소실투자금(억)") or row.get("기준_최소실투자금(억)") or "",
            row.get("기존_최대실투자금(억)") or row.get("기준_최대실투자금(억)") or "",
        )
        approved_vals[key].append((chotu, {**row, "_chotuFlag": flag}))

    proposals: dict[str, dict[str, Any]] = {}
    for key, items in approved_vals.items():
        values = [v for v, _ in items]
        flags = [r["_chotuFlag"] for _, r in items]
        # Block auto-apply if any approved row is HIGH/LOW unless --allow-anomaly
        proposals[key] = {
            "zoneNaturalKey": key,
            "district": items[0][1].get("행정구"),
            "dong": items[0][1].get("행정동"),
            "zoneName": items[0][1].get("구역명"),
            "investmentMinEok": min(values),
            "investmentMaxEok": max(values),
            "approvedCount": len(items),
            "articleNos": [r.get("articleNo") for _, r in items],
            "chotuFlags": flags,
            "hasAnomaly": any(f in {"HIGH", "LOW"} for f in flags),
            "baselineMin": items[0][1].get("기존_최소실투자금(억)") or items[0][1].get("기준_최소실투자금(억)"),
            "baselineMax": items[0][1].get("기존_최대실투자금(억)") or items[0][1].get("기준_최대실투자금(억)"),
            "source": "listing_rows",
        }
    return proposals, skipped


def format_eok(value: float) -> str:
    text = f"{value:.2f}".rstrip("0").rstrip(".")
    return text


def apply_to_golden_csv(
    golden_path: Path,
    proposals: dict[str, dict[str, Any]],
    *,
    write: bool,
    allow_anomaly: bool,
) -> dict[str, Any]:
    with golden_path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    changed: list[dict[str, Any]] = []
    blocked: list[dict[str, Any]] = []
    for row in rows:
        district = clean_text(row.get("행정구")) or ""
        dong = clean_text(row.get("행정동")) or ""
        zone = clean_text(row.get("구역명")) or ""
        key = f"{district}|{dong}|{zone}"
        prop = proposals.get(key)
        if not prop:
            continue
        if prop["hasAnomaly"] and not allow_anomaly:
            blocked.append({**prop, "reason": "anomaly_vs_baseline — re-check or pass --allow-anomaly"})
            continue
        before_min = clean_text(row.get("최소 실투자금(억)"))
        before_max = clean_text(row.get("최대 실투자금(억)"))
        before_pmin = clean_text(row.get("최소 프리미엄"))
        before_pmax = clean_text(row.get("최대 프리미엄"))
        after_min = format_eok(prop["investmentMinEok"])
        after_max = format_eok(prop["investmentMaxEok"])
        pmin = prop.get("premiumMinEok")
        pmax = prop.get("premiumMaxEok")
        after_pmin = format_eok(pmin) if pmin is not None else before_pmin
        after_pmax = format_eok(pmax) if pmax is not None else before_pmax
        if write:
            row["최소 실투자금(억)"] = after_min
            row["최대 실투자금(억)"] = after_max
            if pmin is not None and "최소 프리미엄" in row:
                row["최소 프리미엄"] = after_pmin
            if pmax is not None and "최대 프리미엄" in row:
                row["최대 프리미엄"] = after_pmax
            # Explicitly do NOT touch 매매가
        changed.append(
            {
                "zoneNaturalKey": key,
                "before": {"min": before_min, "max": before_max, "pMin": before_pmin, "pMax": before_pmax},
                "after": {"min": after_min, "max": after_max, "pMin": after_pmin, "pMax": after_pmax},
                "approvedCount": prop["approvedCount"],
                "articleNos": prop["articleNos"],
                "chotuFlags": prop["chotuFlags"],
            }
        )

    result = {
        "generatedAt": date.today().isoformat(),
        "goldenCsv": golden_path.as_posix(),
        "write": write,
        "changedCount": len(changed),
        "blockedCount": len(blocked),
        "changed": changed,
        "blocked": blocked,
        "note": "매매가(G) never auto-updated from crawl 호가. P is applied only when the rollup has a hint.",
    }

    if write and changed:
        out = golden_path.with_name(golden_path.stem + f"_invest_applied_{date.today().strftime('%y%m%d')}.csv")
        # Prefer writing sidecar then operator uploads; also optional overwrite with --in-place
        with out.open("w", encoding="utf-8-sig", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        result["outputCsv"] = out.as_posix()
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply approved 매물 rows → Golden 실투자금 only.")
    parser.add_argument("--input", type=Path, required=True, help="Reviewed 매물_sheet CSV (승인 filled).")
    parser.add_argument("--golden-csv", type=Path, required=True, help="Golden Sample CSV to propose patches against.")
    parser.add_argument("--write", action="store_true", help="Write sidecar CSV with investment updates.")
    parser.add_argument(
        "--allow-anomaly",
        action="store_true",
        help="Allow apply when 설명_초투 is HIGH/LOW vs baseline (±20%%).",
    )
    parser.add_argument(
        "--approve-pending",
        action="store_true",
        help="Treat zone-rollup rows with empty 승인 as Y (board 1차 승인 단위 일괄 반영).",
    )
    parser.add_argument("--output-report", type=Path, help="JSON report path.")
    args = parser.parse_args()

    rows = load_review_rows(args.input)
    proposals, skipped = collect_approved(rows, approve_pending=args.approve_pending)
    result = apply_to_golden_csv(
        args.golden_csv,
        proposals,
        write=args.write,
        allow_anomaly=args.allow_anomaly,
    )
    result["proposalCount"] = len(proposals)
    result["skippedCount"] = len(skipped)
    result["skippedSample"] = skipped[:20]

    today = date.today().strftime("%y%m%d")
    out_report = args.output_report or Path(f"data/reports/listing_invest_apply_{today}.json")
    out_report.parent.mkdir(parents=True, exist_ok=True)
    out_report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    mode = "WRITE" if args.write else "DRY-RUN"
    print(
        f"[{mode}] proposals={len(proposals)} changed={result['changedCount']} "
        f"blocked={result['blockedCount']} skipped={len(skipped)} report={out_report.as_posix()}"
    )
    if args.write and result.get("outputCsv"):
        print(f"wrote sidecar {result['outputCsv']} — upload/paste 실투자금 only; do not bulk-overwrite formulas")
    if not args.write:
        print("Re-run with --write after reviewing DRY-RUN report.")


if __name__ == "__main__":
    main()
