#!/usr/bin/env python3
"""Fetch 재개발닷컴 district status: top stage (D열) + 진행현황 timeline.

Writes a JSON report. Does not mutate the Google Sheet (use apply_* --write).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))
from jaegebal_stage_lib import (  # noqa: E402
    detect_project_kind,
    develop_id_from_url,
    load_stage_map,
    map_to_seedfit_stage,
    parse_stage_meta_text,
    stages_equivalent,
)

SEOUL = ZoneInfo("Asia/Seoul")
PROGRESS_HEADER = "진행현황"
URL_HEADER = "jaegebal_url"
OVERRIDE_PATH = Path(__file__).resolve().parents[2] / "data" / "reference" / "jaegebal_zone_overrides.json"


def load_overrides(path: Path | None = None) -> dict[str, Any]:
    target = path or OVERRIDE_PATH
    if not target.exists():
        return {}
    payload = json.loads(target.read_text(encoding="utf-8"))
    return dict(payload.get("byNaturalKey") or {})


def override_for_row(row: dict[str, str], overrides: dict[str, Any]) -> dict[str, Any] | None:
    key = zone_key(row)
    if key in overrides:
        return overrides[key]
    # fallback: match by zone name suffix
    zone = (row.get("구역명") or "").strip()
    for k, v in overrides.items():
        if k.endswith("|" + zone) or k.split("|")[-1] == zone:
            return v
    return None


def launch_browser(playwright, *, headed: bool):
    last = None
    for kwargs in (
        {"channel": "chrome", "headless": not headed},
        {"headless": not headed},
    ):
        try:
            return playwright.chromium.launch(**kwargs)
        except Exception as exc:  # noqa: BLE001
            last = exc
    raise SystemExit(f"Playwright launch failed: {last}")


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return [{k: (v or "").strip() for k, v in row.items()} for row in csv.DictReader(file)]


def zone_key(row: dict[str, str]) -> str:
    if row.get("zoneNaturalKey"):
        return row["zoneNaturalKey"]
    return "|".join([row.get("행정구") or "", row.get("행정동") or "", row.get("구역명") or ""])


def parse_progress_text(cell: str | None) -> list[dict[str, str]]:
    """Parse stored cell into [{label, detail}, ...]."""
    if not cell:
        return []
    items: list[dict[str, str]] = []
    for raw in re.split(r"[\n\r]+", cell.strip()):
        line = raw.strip()
        if not line:
            continue
        if "|" in line:
            label, detail = line.split("|", 1)
        elif ":" in line:
            label, detail = line.split(":", 1)
        else:
            parts = line.split(None, 1)
            label, detail = parts[0], (parts[1] if len(parts) > 1 else "")
        items.append({"label": label.strip(), "detail": detail.strip()})
    return items


def format_progress(items: list[dict[str, str]]) -> str:
    return "\n".join(f"{it['label']}|{it['detail']}" for it in items if it.get("label"))


def merge_progress(existing_cell: str | None, scraped: list[dict[str, str]]) -> tuple[str, list[str]]:
    """Keep order of existing labels; update detail if changed; append new labels. Returns (text, new_labels)."""
    old = parse_progress_text(existing_cell)
    by_label = {it["label"]: it["detail"] for it in old}
    order = [it["label"] for it in old]
    newly: list[str] = []
    for it in scraped:
        label = it["label"]
        detail = it.get("detail") or ""
        if not label:
            continue
        if label not in by_label:
            order.append(label)
            by_label[label] = detail
            newly.append(label)
        elif by_label[label] != detail and detail:
            by_label[label] = detail
            newly.append(f"{label}~updated")
    merged = [{"label": lab, "detail": by_label[lab]} for lab in order]
    # also append scraped-only order for brand-new cell
    if not old:
        merged = [it for it in scraped if it.get("label")]
        newly = [it["label"] for it in merged]
    return format_progress(merged), newly


def scrape_progress_steps(page) -> list[dict[str, str]]:
    """Read .progress-steps pairs; keep dated or in-progress only (skip empty future)."""
    try:
        page.get_by_text("진행현황", exact=True).first.click(timeout=3000)
        page.wait_for_timeout(800)
    except Exception:
        pass
    page.wait_for_selector(".progress-steps", timeout=15000)
    pairs = page.evaluate(
        """() => {
          const root = document.querySelector('.progress-steps');
          if (!root) return [];
          const descs = [...root.querySelectorAll('.progress-description')];
          const dates = [...root.querySelectorAll('.progress-date')];
          const out = [];
          const n = Math.max(descs.length, dates.length);
          for (let i = 0; i < n; i++) {
            const label = (descs[i]?.innerText || '').trim();
            const detail = (dates[i]?.innerText || '').trim();
            if (label) out.push({label, detail});
          }
          return out;
        }"""
    )
    kept: list[dict[str, str]] = []
    for it in pairs:
        detail = (it.get("detail") or "").strip()
        if not detail:
            continue  # future empty
        kept.append({"label": it["label"].strip(), "detail": detail})
    return kept


def resolve_url(page, row: dict[str, str], override: dict[str, Any] | None = None) -> str:
    if override and (override.get("url") or "").strip():
        return str(override["url"]).strip()
    url = (row.get("jaegebal_url") or row.get("jaegebalUrl") or "").strip()
    if url:
        return url
    query = (override or {}).get("search") or (row.get("구역명") or row.get("query") or "").strip()
    if not query:
        raise ValueError("no jaegebal_url and no 구역명")
    # strip common suffix for search
    q = re.sub(r"\s*구역\s*$", "", str(query)).strip() or str(query)
    page.goto("https://jaegebal.com/", wait_until="networkidle", timeout=60000)
    inp = page.locator('input[placeholder*="구역"]')
    inp.click()
    inp.fill("")
    inp.type(q, delay=40)
    page.wait_for_selector(".search-result-item", timeout=10000)
    page.locator(".search-result-item").first.click()
    page.wait_for_timeout(1500)
    m = re.search(r"(https://jaegebal\.com/develops/\d+)", page.url)
    if not m:
        raise ValueError(f"search did not land on develop page: {page.url}")
    return m.group(1)


def scrape_zone(
    page,
    row: dict[str, str],
    map_data: dict[str, Any],
    *,
    override: dict[str, Any] | None = None,
) -> dict[str, Any]:
    url = resolve_url(page, row, override)
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_selector(".develop-meta-item--stage", timeout=20000)
    top_raw = page.locator(".develop-meta-item--stage").first.inner_text().strip()
    parsed = parse_stage_meta_text(top_raw)
    badge = ""
    for sel in ("h1", ".develop-title", ".develop-header"):
        loc = page.locator(sel)
        if loc.count():
            badge = loc.first.inner_text().strip()
            if badge:
                break
    if not badge:
        badge = page.title()
    kind = detect_project_kind(badge, map_data)
    zone_name = row.get("구역명") or row.get("구역") or ""
    if kind == "moa" and "모아" not in zone_name:
        kind = "common"
    mapped = map_to_seedfit_stage(parsed.get("label"), project_kind=kind, map_data=map_data)
    progress = scrape_progress_steps(page)
    existing_progress = row.get(PROGRESS_HEADER) or row.get("jaegebal_progress") or ""
    merged_text, newly = merge_progress(existing_progress, progress)
    sheet_stage = row.get("현재 단계") or row.get("현재단계") or ""
    candidate = mapped.get("seedfitStage")
    stage_diff = "unchanged"
    if mapped.get("status") != "ok" or not candidate:
        stage_diff = "blocked"
    elif not stages_equivalent(sheet_stage, candidate):
        stage_diff = "changed"

    return {
        "zoneNaturalKey": zone_key(row),
        "district": row.get("행정구") or "",
        "dong": row.get("행정동") or "",
        "zoneName": row.get("구역명") or "",
        "jaegebalUrl": url,
        "developId": develop_id_from_url(url),
        "pageTitle": page.title(),
        "badgeText": badge[:200],
        "projectKind": kind,
        "forceTrusted": bool(override),
        "overrideNote": (override or {}).get("note"),
        "topStageRaw": top_raw,
        "topStageLabel": parsed.get("label"),
        "topStageDate": parsed.get("date"),
        "sheetStage": sheet_stage,
        "seedfitStageCandidate": candidate,
        "mappedStatus": mapped.get("status"),
        "mappedMessage": mapped.get("message"),
        "stageDiff": stage_diff,
        "progressScraped": progress,
        "progressMerged": merged_text,
        "progressNewLabels": newly,
        "existingProgress": existing_progress,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="CSV with 구역명 and optional jaegebal_url / 현재 단계 / 진행현황")
    parser.add_argument("--zone", help="Single zone name for ad-hoc test, e.g. 사당 17구역")
    parser.add_argument("--url", help="Optional direct develop URL")
    parser.add_argument("--district", default="")
    parser.add_argument("--dong", default="")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--delay-ms", type=int, default=600)
    parser.add_argument("--headed", action="store_true")
    args = parser.parse_args()

    rows: list[dict[str, str]]
    if args.zone:
        rows = [
            {
                "행정구": args.district,
                "행정동": args.dong,
                "구역명": args.zone,
                "jaegebal_url": args.url or "",
                "현재 단계": "",
                PROGRESS_HEADER: "",
            }
        ]
    elif args.input:
        rows = load_rows(args.input)
        if args.limit > 0:
            rows = rows[: args.limit]
    else:
        raise SystemExit("Provide --input CSV or --zone")

    map_data = load_stage_map()
    overrides = load_overrides()
    now = datetime.now(SEOUL)
    stamp = now.strftime("%y%m%d_%H%M")
    out = args.output or Path(f"data/reports/jaegebal_district_status_{stamp}.json")
    out.parent.mkdir(parents=True, exist_ok=True)

    from playwright.sync_api import sync_playwright

    results: list[dict[str, Any]] = []
    summary = {"changed": 0, "unchanged": 0, "blocked": 0, "error": 0, "progressAppended": 0}

    with sync_playwright() as p:
        browser = launch_browser(p, headed=args.headed)
        page = browser.new_page()
        for idx, row in enumerate(rows, start=1):
            key = zone_key(row)
            try:
                ov = override_for_row(row, overrides)
                item = scrape_zone(page, row, map_data, override=ov)
                summary[item["stageDiff"]] = summary.get(item["stageDiff"], 0) + 1
                if item.get("progressNewLabels"):
                    summary["progressAppended"] += 1
                results.append(item)
                print(
                    f"[{idx}/{len(rows)}] {item['stageDiff']} {key} | "
                    f"D:{item.get('sheetStage')!r}->{item.get('seedfitStageCandidate')!r} | "
                    f"top={item.get('topStageRaw')!r} | newProgress={item.get('progressNewLabels')}"
                    + (f" | override={item.get('overrideNote')}" if ov else "")
                )
            except Exception as exc:  # noqa: BLE001
                summary["error"] += 1
                results.append({"zoneNaturalKey": key, "stageDiff": "error", "error": str(exc)})
                print(f"[{idx}/{len(rows)}] error {key}: {exc}")
            if args.delay_ms and idx < len(rows):
                time.sleep(args.delay_ms / 1000.0)
        browser.close()

    payload = {
        "generatedAt": now.isoformat(),
        "summary": summary,
        "zones": results,
    }
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    md = out.with_suffix(".md")
    lines = [f"# district status {now.strftime('%Y-%m-%d %H:%M')}", "", f"summary: `{json.dumps(summary, ensure_ascii=False)}`", ""]
    for z in results:
        lines.append(f"## {z.get('zoneNaturalKey')}")
        lines.append(f"- url: {z.get('jaegebalUrl')}")
        lines.append(f"- top(D): `{z.get('topStageRaw')}` → `{z.get('seedfitStageCandidate')}` ({z.get('stageDiff')})")
        lines.append(f"- progress new: {z.get('progressNewLabels')}")
        lines.append("```")
        lines.append(z.get("progressMerged") or "")
        lines.append("```")
        lines.append("")
    md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"output": out.as_posix(), "markdown": md.as_posix(), "summary": summary}, ensure_ascii=False))
    return 0 if summary.get("error", 0) == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
