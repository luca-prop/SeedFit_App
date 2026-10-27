#!/usr/bin/env python3
"""Blog tables for CORE zones approved on the listing-review board.

Includes a zone only when Golden coverage is CORE and the board marks it
approved (zoneDone or zoneRollup Y). SUB and CORE holds are omitted.
Six budget bands, columns 구역 / 단계 / 초투, each table sorted by 초투 min.
"""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_GOLDEN = ROOT / "data/normalized/golden_samples261027.normalized.json"
DEFAULT_SYNC_URL = "https://seed-fit-app.vercel.app/api/ops/listing-review"
# 검수보드 키와 Golden 행 이름이 다를 때. 초투는 보드 승인값, 단계·CORE는 Golden 행.
BOARD_TO_GOLDEN = {
    "광진구|자양동|자양1동 799(모아타운)": "광진구|자양동|자양1동 779(모아타운)",
    "광진구|자양동|자양동 227-147": "광진구|자양동|자양3동A구역",
}
BANDS = [
    ("1~3억", 0.0, 3.0),
    ("3~5억", 3.0, 5.0),
    ("5~10억", 5.0, 10.0),
    ("10~15억", 10.0, 15.0),
    ("15~20억", 15.0, 20.0),
    ("20억+", 20.0, None),
]


def eok_text(krw: int | None) -> str | None:
    if krw is None:
        return None
    value = round(krw / 100_000_000, 2)
    if abs(value - round(value)) < 1e-9:
        return str(int(round(value)))
    return f"{value:.2f}".rstrip("0").rstrip(".")


def band_for(min_eok: float) -> str:
    for label, lo, hi in BANDS:
        if hi is None:
            if min_eok >= lo:
                return label
            continue
        if lo <= min_eok < hi or (lo == 0 and min_eok < hi):
            return label
    return BANDS[0][0]


def load_sync(path: Path | None, url: str) -> dict:
    if path is not None:
        return json.loads(path.read_text(encoding="utf-8"))
    req = Request(url, headers={"User-Agent": "SeedFitBlog/1.0", "Cache-Control": "no-cache"})
    with urlopen(req, timeout=40) as res:
        return json.loads(res.read().decode("utf-8"))


def approved_keys(state: dict) -> tuple[set[str], set[str]]:
    rollup = state.get("zoneRollup") or {}
    done = state.get("zoneDone") or {}
    keys = set(rollup) | set(done)
    approved, held = set(), set()
    for key in keys:
        if done.get(key) or rollup.get(key) == "Y":
            approved.add(key)
        else:
            held.add(key)
    return approved, held


def proposal_eok(prop: dict) -> tuple[float, str] | None:
    lo = prop.get("예상초투_min")
    hi = prop.get("예상초투_max")
    if lo in (None, ""):
        return None
    lo_num = float(lo)
    hi_text = "" if hi in (None, "") else str(hi).strip()
    lo_text = eok_text(int(round(lo_num * 100_000_000)))
    chotu = f"{lo_text}~{hi_text}억" if hi_text else f"{lo_text}억"
    return lo_num, chotu


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--golden", type=Path, default=DEFAULT_GOLDEN)
    parser.add_argument("--sync", type=Path, help="saved listing-review API JSON")
    parser.add_argument("--sync-url", default=DEFAULT_SYNC_URL)
    parser.add_argument("--stamp", default="261027")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    golden = json.loads(args.golden.read_text(encoding="utf-8"))
    sync = load_sync(args.sync, args.sync_url)
    state = sync.get("state") or sync
    approved, held = approved_keys(state)
    zones = {z["naturalKey"]: z for z in golden["zones"]}

    grouped = {label: [] for label, _, _ in BANDS}
    skipped_sub = []
    skipped_hold = []
    skipped_missing = []
    used_golden = set()
    proposals = state.get("zoneProposal") or {}

    def add_row(zone: dict, min_eok: float, chotu: str, zone_label: str | None = None) -> None:
        grouped[band_for(min_eok)].append(
            {
                "zone": zone_label or f"{zone['district']} {zone['zoneName']}",
                "stage": zone.get("stage") or "",
                "chotu": chotu,
                "sort": min_eok,
            }
        )

    for snap in golden["zoneInvestmentSnapshots"]:
        key = snap["zoneNaturalKey"]
        zone = zones.get(key)
        if not zone:
            continue
        coverage = (zone.get("coverage") or "").upper()
        if key in held or key not in approved:
            if coverage == "CORE" and key in held:
                skipped_hold.append(zone["zoneName"])
            continue
        if coverage != "CORE":
            skipped_sub.append(f"{zone['zoneName']}({coverage or '-'})")
            continue
        lo = snap.get("investmentMinKrw")
        if lo is None:
            skipped_missing.append(zone["zoneName"])
            continue
        hi = eok_text(snap.get("investmentMaxKrw"))
        lo_text = eok_text(lo)
        add_row(zone, lo / 100_000_000, f"{lo_text}~{hi}억" if hi else f"{lo_text}억")
        used_golden.add(key)

    for board_key, golden_key in BOARD_TO_GOLDEN.items():
        if board_key not in approved or golden_key in used_golden:
            continue
        zone = zones.get(golden_key)
        if not zone or (zone.get("coverage") or "").upper() != "CORE":
            skipped_missing.append(board_key)
            continue
        parsed = proposal_eok(proposals.get(board_key) or {})
        if not parsed:
            skipped_missing.append(zone["zoneName"])
            continue
        add_row(zone, parsed[0], parsed[1], f"{zone['district']} {board_key.split('|')[-1]}")
        used_golden.add(golden_key)
    for rows in grouped.values():
        rows.sort(key=lambda row: (row["sort"], row["zone"]))

    out = args.output or (ROOT / "data" / "reports" / f"blog_invest_ranges_{args.stamp}.html")
    total = sum(len(rows) for rows in grouped.values())
    parts = [
        "<!DOCTYPE html>",
        '<html lang="ko"><head><meta charset="utf-8">',
        "<title>투자금 범위별 구역</title>",
        "<style>",
        "body{font-family:'Malgun Gothic',sans-serif;margin:24px;color:#111;}",
        "h1{font-size:22px;} h2{font-size:18px;margin:28px 0 8px;}",
        "p.note{color:#444;font-size:13px;}",
        "table{border-collapse:collapse;width:100%;max-width:720px;margin-bottom:8px;}",
        "th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;font-size:14px;}",
        "th{background:#f4f4f4;} td.num{text-align:right;white-space:nowrap;}",
        "</style></head><body>",
        "<h1>투자금 범위별 구역</h1>",
        "<p class=\"note\">검수보드에서 승인한 CORE만 포함했습니다. SUB와 CORE 보류는 제외했습니다. "
        "초투 최소값 기준이며, 경계값(3억, 5억, 10억, 15억, 20억)은 위쪽 구간에 넣었습니다. "
        "각 표는 초투 최소 오름차순입니다.</p>",
    ]
    for label, _, _ in BANDS:
        rows = grouped[label]
        parts.append(f"<h2>{html.escape(label)} · {len(rows)}곳</h2>")
        parts.append("<table><thead><tr><th>구역</th><th>단계</th><th>초투</th></tr></thead><tbody>")
        if not rows:
            parts.append('<tr><td colspan="3">해당 없음</td></tr>')
        for row in rows:
            parts.append(
                "<tr>"
                f"<td>{html.escape(row['zone'])}</td>"
                f"<td>{html.escape(row['stage'])}</td>"
                f"<td class=\"num\">{html.escape(row['chotu'])}</td>"
                "</tr>"
            )
        parts.append("</tbody></table>")
    parts.append("</body></html>\n")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(parts), encoding="utf-8")
    print(f"wrote {out} zones={total}")
    for label, _, _ in BANDS:
        print(f"  {label} {len(grouped[label])}")
    print("hold", ", ".join(skipped_hold) or "-")
    print("sub", ", ".join(skipped_sub) or "-")
    print("missing", ", ".join(skipped_missing) or "-")


if __name__ == "__main__":
    main()
