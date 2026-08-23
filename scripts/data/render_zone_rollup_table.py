#!/usr/bin/env python3
"""Render the 구역 통합본 (1차 승인 단위) as a double-clickable HTML table + xlsx.

The listing-review board is a working UI. This file is the *handoff artifact*:
초투 / 매매가(호가) / P in one table that opens in Edge/Chrome by double-click
(ASCII filename + complete html/head/body). Also writes a dated archive xlsx
so next month's update can diff 초투·매매가.
"""

from __future__ import annotations

import argparse
import csv
import html
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
COLUMNS = [
    ("행정구", "구"),
    ("행정동", "동"),
    ("구역명", "구역"),
    ("표본건수", "표본"),
    ("예상초투_범위", "초투"),
    ("매매가_범위", "매매가(호가)"),
    ("P_범위", "P"),
    ("기존_최소실투자금(억)", "기존 실투 min"),
    ("기존_최대실투자금(억)", "기존 실투 max"),
    ("기존_매매가", "기존 매매가"),
]


def _cell(row: dict[str, str], key: str) -> str:
    return (row.get(key) or "").strip() or "—"


def render_html(rows: list[dict[str, str]], *, stamp: str, source: str) -> str:
    body_rows = []
    for row in rows:
        tds = []
        for key, _label in COLUMNS:
            value = html.escape(_cell(row, key))
            if key == "구역명":
                value = f"<strong>{value}</strong>"
            tds.append(f"<td>{value}</td>")
        body_rows.append("<tr>" + "".join(tds) + "</tr>")
    header = "".join(f"<th>{html.escape(label)}</th>" for _key, label in COLUMNS)
    iso = f"20{stamp[:2]}-{stamp[2:4]}-{stamp[4:6]}" if len(stamp) == 6 else stamp
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>구역 통합본 (1차 승인 단위) {iso}</title>
  <style>
    body {{ font: 15px/1.45 "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; margin: 24px; color: #111; background: #fff; }}
    h1 {{ font-size: 22px; margin: 0 0 8px; }}
    .note {{ color: #444; max-width: 80rem; margin: 0 0 16px; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #ccc; padding: 7px 8px; text-align: left; white-space: nowrap; }}
    th {{ background: #f3efe4; position: sticky; top: 0; }}
    tr:nth-child(even) {{ background: #fafafa; }}
  </style>
</head>
<body>
  <h1>구역 통합본 (1차 승인 단위) — {html.escape(iso)}</h1>
  <p class="note">
    매물 검수보드에서 승인된 5건(기본: 전부 포함)의 <b>초투 · 매매가(호가) · P</b>.
    탐색기에서 이 파일을 더블클릭하면 브라우저로 열립니다.
    출처: {html.escape(source)}. P는 매물 설명의 프리미엄/프미/P/피 힌트이며, 힌트가 없으면 공란입니다.
  </p>
  <table>
    <thead><tr>{header}</tr></thead>
    <tbody>
      {"".join(body_rows)}
    </tbody>
  </table>
</body>
</html>
"""


def write_xlsx(rows: list[dict[str, str]], path: Path) -> None:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

    wb = Workbook()
    ws = ws_data = wb.active
    ws_data.title = "구역통합본"
    headers = [label for _key, label in COLUMNS] + [
        "예상초투_min",
        "예상초투_max",
        "매매가_min",
        "매매가_max",
        "P_min",
        "P_max",
        "zoneNaturalKey",
    ]
    keys_extra = [
        "예상초투_min(억)",
        "예상초투_max(억)",
        "매매가_min(억)",
        "매매가_max(억)",
        "P_min(억)",
        "P_max(억)",
        "zoneNaturalKey",
    ]
    fill = PatternFill("solid", fgColor="F3EFE4")
    thin = Border(
        left=Side(style="thin", color="CCCCCC"),
        right=Side(style="thin", color="CCCCCC"),
        top=Side(style="thin", color="CCCCCC"),
        bottom=Side(style="thin", color="CCCCCC"),
    )
    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True)
        cell.fill = fill
        cell.alignment = Alignment(horizontal="center")
    for row in rows:
        values = [_cell(row, key) for key, _label in COLUMNS] + [_cell(row, k) for k in keys_extra]
        ws.append(values)
    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=ws.max_column):
        for cell in row:
            cell.border = thin
    ws.auto_filter.ref = ws.dimensions
    ws.freeze_panes = "A2"
    from openpyxl.utils import get_column_letter

    widths = [10, 12, 28, 8, 16, 16, 14, 12, 12, 12, 12, 12, 12, 12, 12, 36]
    for i, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def fmt_sale_cell(lo: str, hi: str) -> str:
    """Golden G열 표기: 자양7은 `17~18`. 단일이면 숫자만."""
    lo, hi = (lo or "").strip(), (hi or "").strip()
    if not lo and not hi:
        return ""
    if not hi or lo == hi:
        return lo or hi
    if not lo:
        return hi
    return f"{lo}~{hi}"


def patches_from_rollup(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    patches: list[dict[str, Any]] = []
    for row in rows:
        key = (row.get("zoneNaturalKey") or "").strip()
        n = int(row.get("표본건수") or 0)
        if not key or n <= 0 or not (row.get("예상초투_min(억)") or "").strip():
            continue
        patch: dict[str, Any] = {
            "naturalKey": key,
            "최소 실투자금(억)": row["예상초투_min(억)"].strip(),
            "최대 실투자금(억)": row["예상초투_max(억)"].strip(),
            "매매가": fmt_sale_cell(row.get("매매가_min(억)") or "", row.get("매매가_max(억)") or ""),
        }
        if (row.get("P_min(억)") or "").strip():
            patch["최소 프리미엄"] = row["P_min(억)"].strip()
        if (row.get("P_max(억)") or "").strip():
            patch["최대 프리미엄"] = row["P_max(억)"].strip()
        patches.append(patch)
    return patches


def snapshot_golden_xlsx(golden_csv: Path, dest: Path) -> None:
    from openpyxl import Workbook

    rows = load_csv(golden_csv)
    if not rows:
        raise SystemExit(f"empty golden csv: {golden_csv}")
    wb = Workbook()
    ws = wb.active
    ws.title = "golden"
    headers = list(rows[0].keys())
    ws.append(headers)
    for row in rows:
        ws.append([row.get(h, "") for h in headers])
    ws.auto_filter.ref = ws.dimensions
    ws.freeze_panes = "A2"
    dest.parent.mkdir(parents=True, exist_ok=True)
    wb.save(dest)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="구역_통합본_YYMMDD.csv")
    parser.add_argument("--stamp", default=date.today().strftime("%y%m%d"))
    parser.add_argument("--golden-csv", type=Path, help="optional: snapshot this Golden CSV to archive xlsx")
    parser.add_argument("--desktop", action="store_true", help="also copy HTML to the user Desktop")
    args = parser.parse_args()

    rows = load_csv(args.input)
    stamp = args.stamp
    reports = ROOT / "data" / "reports"
    archive = ROOT / "data" / "archive" / "golden" / stamp
    archive.mkdir(parents=True, exist_ok=True)

    html_name = f"zone_rollup_{stamp}.html"
    html_body = render_html(rows, stamp=stamp, source=args.input.name)
    for dest in (reports / html_name, archive / html_name, reports / f"구역_통합본_{stamp}.html"):
        dest.write_text(html_body, encoding="utf-8")
        print("html", dest)

    xlsx = archive / f"zone_rollup_{stamp}.xlsx"
    write_xlsx(rows, xlsx)
    reports.joinpath(f"zone_rollup_{stamp}.xlsx").write_bytes(xlsx.read_bytes())
    print("xlsx", xlsx)

    patch_path = reports / f"golden_invest_p_patches_{stamp}.json"
    import json

    patches = patches_from_rollup(rows)
    patch_path.write_text(json.dumps(patches, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"patches {len(patches)} → {patch_path}")

    if args.golden_csv and args.golden_csv.exists():
        snap = archive / f"golden_samples_{stamp}.xlsx"
        snapshot_golden_xlsx(args.golden_csv, snap)
        print("golden snapshot", snap)

    if args.desktop:
        desktop = Path.home() / "Desktop" / html_name
        desktop.write_text(html_body, encoding="utf-8")
        print("desktop", desktop)


if __name__ == "__main__":
    main()
