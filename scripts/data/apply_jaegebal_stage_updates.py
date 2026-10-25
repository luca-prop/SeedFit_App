#!/usr/bin/env python3
"""Apply jaegebal stage diff to Golden Sample: update `현재 단계` + highlight changed cells.

Default is dry-run. Pass --write to mutate the spreadsheet.
"""

from __future__ import annotations

import argparse
import configparser
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))
from jaegebal_stage_lib import stages_equivalent  # noqa: E402
from normalize_golden_samples import (  # noqa: E402
    derive_coverage,
    moa_stage_on_non_moa_zone,
    normalize_stage,
    progress_marks_stage_in_progress,
)

GOLDEN_SHEET_ID = "1YaZjGX53HGNQyAjLp0AIQFGq-j0IWcfPl5WFgUeUfuY"
STAGE_HEADER = "현재 단계"
COVERAGE_HEADER = "coverage"
URL_HEADER = "jaegebal_url"
CHECKED_HEADER = "jaegebal_checked_at"
SOURCE_DATE_HEADER = "jaegebal_stage_date"
UPDATED_HEADER = "stage_updated_at"
STAMP_HEADER = "입력 일시"
SEOUL = ZoneInfo("Asia/Seoul")

# Soft amber fill + deep red text — visible but not alarmist.
HIGHLIGHT_BG = {"red": 1.0, "green": 0.95, "blue": 0.7}
HIGHLIGHT_FG = {"red": 0.72, "green": 0.11, "blue": 0.11}
CLEAR_BG = {"red": 1.0, "green": 1.0, "blue": 1.0}
CLEAR_FG = {"red": 0.0, "green": 0.0, "blue": 0.0}

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def rclone_config_path() -> Path:
    candidates = [
        Path.home() / "AppData" / "Roaming" / "rclone" / "rclone.conf",
        Path.home() / ".config" / "rclone" / "rclone.conf",
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError("rclone.conf not found")


def credentials_from_rclone(remote: str = "gdrive"):
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    conf = configparser.ConfigParser()
    conf.read(rclone_config_path(), encoding="utf-8")
    section = remote if conf.has_section(remote) else f"rclone_{remote}"
    if not conf.has_section(section):
        matches = [s for s in conf.sections() if s == remote or s.endswith(remote)]
        if not matches:
            raise SystemExit(f"rclone remote section not found: {remote}")
        section = matches[0]

    token_raw = conf.get(section, "token", fallback="").strip()
    if not token_raw:
        raise SystemExit(f"rclone remote {section} has no token")
    token = json.loads(token_raw)
    creds = Credentials(
        token=token.get("access_token"),
        refresh_token=token.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=conf.get(section, "client_id", fallback="") or None,
        client_secret=conf.get(section, "client_secret", fallback="") or None,
        scopes=SCOPES,
    )
    if not creds.valid:
        if creds.refresh_token:
            creds.refresh(Request())
        else:
            raise SystemExit("rclone token expired and no refresh_token")
    return creds


def ensure_headers(worksheet, headers: list[str], required_extra: list[str]) -> dict[str, int]:
    """Return 0-based index map; insert missing helper columns at end."""
    values = worksheet.get_all_values()
    if not values:
        raise SystemExit("worksheet empty")
    header = list(values[0])
    changed = False
    for name in required_extra:
        if name not in header:
            header.append(name)
            changed = True
    if changed:
        worksheet.update("A1", [header], value_input_option="USER_ENTERED")
        values = worksheet.get_all_values()
        header = values[0]
    index = {name: i for i, name in enumerate(header)}
    for need in [STAGE_HEADER, "행정구", "행정동", "구역명"]:
        if need not in index:
            raise SystemExit(f"missing required header: {need}")
    return index


def natural_key_from_row(row: list[str], index: dict[str, int]) -> str:
    def cell(name: str) -> str:
        i = index.get(name)
        if i is None or i >= len(row):
            return ""
        return (row[i] or "").strip()

    return "|".join([cell("행정구"), cell("행정동"), cell("구역명")])


def a1(col_zero: int, row_one: int) -> str:
    n = col_zero + 1
    letters = ""
    while n:
        n, rem = divmod(n - 1, 26)
        letters = chr(65 + rem) + letters
    return f"{letters}{row_one}"


def format_requests(
    sheet_id: int,
    cells: list[tuple[int, int]],
    *,
    highlight: bool,
) -> list[dict[str, Any]]:
    """cells = list of (row_0based, col_0based)."""
    reqs: list[dict[str, Any]] = []
    bg = HIGHLIGHT_BG if highlight else CLEAR_BG
    fg = HIGHLIGHT_FG if highlight else CLEAR_FG
    bold = highlight
    for row0, col0 in cells:
        reqs.append(
            {
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": row0,
                        "endRowIndex": row0 + 1,
                        "startColumnIndex": col0,
                        "endColumnIndex": col0 + 1,
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": bg,
                            "textFormat": {
                                "foregroundColor": fg,
                                "bold": bold,
                            },
                        }
                    },
                    "fields": "userEnteredFormat.backgroundColor,userEnteredFormat.textFormat.foregroundColor,userEnteredFormat.textFormat.bold",
                }
            }
        )
    return reqs


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--diff", type=Path, required=True, help="jaegebal_stage_diff_*.json from fetch")
    parser.add_argument("--sheet-id", default=GOLDEN_SHEET_ID)
    parser.add_argument("--remote", default="gdrive")
    parser.add_argument("--tab", default="", help="Main Golden tab title (default: first sheet)")
    parser.add_argument(
        "--write",
        action="store_true",
        help="Apply updates. Without this flag, print planned changes only.",
    )
    parser.add_argument(
        "--include-unchanged-checkstamp",
        action="store_true",
        help="Also stamp jaegebal_checked_at for unchanged rows that were crawled.",
    )
    parser.add_argument(
        "--clear-stale-highlights",
        action="store_true",
        help="Clear highlight on stage cells that are not in this changed set.",
    )
    parser.add_argument(
        "--update-coverage",
        action="store_true",
        help="Refresh coverage from new stage when coverage column exists.",
    )
    args = parser.parse_args()

    payload = json.loads(args.diff.read_text(encoding="utf-8"))
    zones = list(payload.get("zones") or [])
    changed = [z for z in zones if z.get("diff") == "changed" and z.get("seedfitStageCandidate")]
    unchanged = [z for z in zones if z.get("diff") == "unchanged"]

    plan = {
        "diffFile": args.diff.as_posix(),
        "changedCount": len(changed),
        "unchangedCount": len(unchanged),
        "write": bool(args.write),
        "changes": [
            {
                "zoneNaturalKey": z.get("zoneNaturalKey"),
                "from": z.get("sheetStage"),
                "to": z.get("seedfitStageCandidate"),
                "jaegebal": z.get("jaegebalStageRaw"),
                "url": z.get("jaegebalUrl"),
            }
            for z in changed
        ],
    }
    print(json.dumps(plan, ensure_ascii=False, indent=2))
    if not args.write:
        print("dry-run only; re-run with --write after review")
        return 0
    if not changed and not args.include_unchanged_checkstamp and not args.clear_stale_highlights:
        print("nothing to write")
        return 0

    import gspread

    creds = credentials_from_rclone(args.remote)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(args.sheet_id)
    worksheet = spreadsheet.worksheet(args.tab) if args.tab else spreadsheet.get_worksheet(0)

    extra_cols = [URL_HEADER, SOURCE_DATE_HEADER, CHECKED_HEADER, UPDATED_HEADER]
    index = ensure_headers(worksheet, [], extra_cols)
    values = worksheet.get_all_values()
    header = values[0]
    index = {name: i for i, name in enumerate(header)}

    by_key = {z["zoneNaturalKey"]: z for z in zones if z.get("zoneNaturalKey")}
    now = datetime.now(SEOUL)
    stamp = now.strftime("%Y-%m-%d %H:%M:%S")
    day = now.strftime("%Y-%m-%d")

    value_updates: list[dict[str, Any]] = []
    highlight_cells: list[tuple[int, int]] = []
    clear_cells: list[tuple[int, int]] = []
    applied = 0
    stamped_check = 0

    stage_col = index[STAGE_HEADER]
    for row_number, row in enumerate(values[1:], start=2):
        if not any((c or "").strip() for c in row):
            continue
        key = natural_key_from_row(row, index)
        z = by_key.get(key)
        if not z:
            if args.clear_stale_highlights:
                clear_cells.append((row_number - 1, stage_col))
            continue

        def set_cell(col_name: str, value: str) -> None:
            col = index.get(col_name)
            if col is None:
                return
            value_updates.append({"range": a1(col, row_number), "values": [[value]]})

        if z.get("diff") == "changed" and z.get("seedfitStageCandidate"):
            new_stage = normalize_stage(z["seedfitStageCandidate"]) or z["seedfitStageCandidate"]
            old = (row[stage_col] if stage_col < len(row) else "").strip()
            zone_name = (z.get("zoneName") or "").strip()
            progress = ""
            if "진행현황" in index:
                progress_col = index["진행현황"]
                progress = row[progress_col] if progress_col < len(row) else ""
            blocked = moa_stage_on_non_moa_zone(zone_name, new_stage) or progress_marks_stage_in_progress(
                new_stage, progress
            )
            if not blocked and not stages_equivalent(old, new_stage):
                value_updates.append({"range": a1(stage_col, row_number), "values": [[new_stage]]})
                highlight_cells.append((row_number - 1, stage_col))
                set_cell(UPDATED_HEADER, day)
                if STAMP_HEADER in index:
                    set_cell(STAMP_HEADER, stamp)
                if args.update_coverage and COVERAGE_HEADER in index:
                    set_cell(COVERAGE_HEADER, derive_coverage(new_stage, progress=progress))
                applied += 1
            if z.get("jaegebalUrl"):
                set_cell(URL_HEADER, z["jaegebalUrl"])
            if z.get("jaegebalStageDate"):
                set_cell(SOURCE_DATE_HEADER, str(z["jaegebalStageDate"]).replace(".", "-"))
            set_cell(CHECKED_HEADER, day)
        elif z.get("diff") == "unchanged":
            if args.clear_stale_highlights:
                clear_cells.append((row_number - 1, stage_col))
            if args.include_unchanged_checkstamp:
                set_cell(CHECKED_HEADER, day)
                if z.get("jaegebalUrl"):
                    set_cell(URL_HEADER, z["jaegebalUrl"])
                if z.get("jaegebalStageDate"):
                    set_cell(SOURCE_DATE_HEADER, str(z["jaegebalStageDate"]).replace(".", "-"))
                stamped_check += 1
        elif args.clear_stale_highlights:
            clear_cells.append((row_number - 1, stage_col))

    if value_updates:
        worksheet.batch_update(value_updates, value_input_option="USER_ENTERED")

    format_reqs = format_requests(worksheet.id, highlight_cells, highlight=True)
    if args.clear_stale_highlights and clear_cells:
        # Avoid clearing cells we just highlighted.
        highlight_set = set(highlight_cells)
        format_reqs.extend(
            format_requests(
                worksheet.id,
                [c for c in clear_cells if c not in highlight_set],
                highlight=False,
            )
        )
    if format_reqs:
        spreadsheet.batch_update({"requests": format_reqs})

    result = {
        "tab": worksheet.title,
        "appliedStageUpdates": applied,
        "checkedStamps": stamped_check,
        "highlightedCells": len(highlight_cells),
        "clearedHighlights": len(clear_cells) if args.clear_stale_highlights else 0,
        "valueUpdateCells": len(value_updates),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
