#!/usr/bin/env python3
"""Add/refresh `coverage` column on Golden Sample main tab (CORE/SUB from 현재 단계)."""

from __future__ import annotations

import argparse
import configparser
import json
import sys
from pathlib import Path
from typing import Any

# Reuse derive_coverage from normalize module.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from normalize_golden_samples import derive_coverage, normalize_stage  # noqa: E402

GOLDEN_SHEET_ID = "1YaZjGX53HGNQyAjLp0AIQFGq-j0IWcfPl5WFgUeUfuY"
COVERAGE_HEADER = "coverage"
STAGE_HEADER = "현재 단계"
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
    client_id = conf.get(section, "client_id", fallback="") or None
    client_secret = conf.get(section, "client_secret", fallback="") or None

    creds = Credentials(
        token=token.get("access_token"),
        refresh_token=token.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )
    if not creds.valid:
        if creds.refresh_token:
            creds.refresh(Request())
        else:
            raise SystemExit("rclone token expired and no refresh_token")
    return creds


def col_letter(index_zero_based: int) -> str:
    n = index_zero_based + 1
    letters = ""
    while n:
        n, rem = divmod(n - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


def ensure_coverage_column(worksheet) -> dict[str, Any]:
    """Insert or locate coverage header; fill CORE/SUB from stage for all data rows."""
    values = worksheet.get_all_values()
    if not values:
        raise SystemExit("main worksheet is empty")

    header = values[0]
    try:
        stage_idx = header.index(STAGE_HEADER)
    except ValueError as exc:
        raise SystemExit(f"header missing: {STAGE_HEADER}") from exc

    inserted = False
    if COVERAGE_HEADER in header:
        coverage_idx = header.index(COVERAGE_HEADER)
    else:
        # Place coverage immediately after 현재 단계.
        coverage_idx = stage_idx + 1
        worksheet.insert_cols(coverage_idx + 1)
        worksheet.update_cell(1, coverage_idx + 1, COVERAGE_HEADER)
        inserted = True
        # Refresh after insert.
        values = worksheet.get_all_values()
        header = values[0]
        stage_idx = header.index(STAGE_HEADER)
        coverage_idx = header.index(COVERAGE_HEADER)

    updates: list[dict[str, Any]] = []
    core_n = 0
    sub_n = 0
    for row_number, row in enumerate(values[1:], start=2):
        if not any(cell.strip() for cell in row):
            continue
        stage_raw = row[stage_idx] if stage_idx < len(row) else ""
        stage = normalize_stage(stage_raw.strip() or None)
        coverage = derive_coverage(stage)
        if coverage == "CORE":
            core_n += 1
        else:
            sub_n += 1
        cell = f"{col_letter(coverage_idx)}{row_number}"
        updates.append({"range": cell, "values": [[coverage]]})

    if updates:
        worksheet.batch_update(updates, value_input_option="USER_ENTERED")

    return {
        "tab": worksheet.title,
        "gid": worksheet.id,
        "coverageColumn": col_letter(coverage_idx),
        "insertedColumn": inserted,
        "rowsUpdated": len(updates),
        "core": core_n,
        "sub": sub_n,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sheet-id", default=GOLDEN_SHEET_ID)
    parser.add_argument("--remote", default="gdrive")
    parser.add_argument(
        "--tab",
        default="",
        help="Worksheet title. Default: first sheet (main Golden Sample tab).",
    )
    args = parser.parse_args()

    import gspread

    creds = credentials_from_rclone(args.remote)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(args.sheet_id)
    worksheet = spreadsheet.worksheet(args.tab) if args.tab else spreadsheet.get_worksheet(0)

    result = ensure_coverage_column(worksheet)
    result["spreadsheetId"] = args.sheet_id
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
