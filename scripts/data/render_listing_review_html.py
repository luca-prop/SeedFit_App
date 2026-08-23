#!/usr/bin/env python3
"""Render a district → zone paged HTML review board for zone listings.

Input: zone_listing_candidates_*.json (+ optional golden CSV).
Output: data/reports/listing_review_{YYMMDD}.html
Title: 매물 검수 보드 — YYYY-MM-DD
Tell the user the file:/// URI (same product as listing_review_260806.html).

Navigation is district → zone (one zone at a time) so the page does not scroll
through every listing. Zone / district approval status is stored in localStorage
and shown as 미착수 / 진행중 / 승인완료 chips.
"""

from __future__ import annotations

import argparse
import html
import json
from collections import OrderedDict
from datetime import date
from pathlib import Path
from typing import Any

import sys

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from export_listings_sheet import (
    DROPDOWN_Golden반영,
    DROPDOWN_검수상태,
    DROPDOWN_승인,
    build_sheet_rows,
    build_zone_proposals,
    load_golden_baselines,
    load_json,
    write_zone_proposals_csv,
)

# Tunable Naver-open pacing. Raise OPEN_GAP_MS / lower BURST_LIMIT if blocked;
# lower the gap later if review speed suffers (see ZONE_LISTING_CRAWL_RUNBOOK.md).
OPEN_GAP_MS = 2500
BURST_LIMIT = 25
BURST_WINDOW_MS = 10 * 60 * 1000


def _esc(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def _json_script(obj: Any) -> str:
    """Serialise for a `<script type="application/json">` body.

    A `<script>` body is *raw text*: the parser does not decode entities, so
    `html.escape` here makes `textContent` hand JSON.parse a literal `&quot;` and every
    export dies with `SyntaxError` at position 1. Escaping `<` as `\\u003c` is enough —
    it keeps `</script` from ending the element while staying valid JSON.
    """
    return json.dumps(obj, ensure_ascii=False).replace("<", "\\u003c")


def _options(choices: list[str], selected: str = "") -> str:
    parts = []
    for c in choices:
        label = c if c else "(선택)"
        sel = " selected" if c == selected else ""
        parts.append(f'<option value="{_esc(c)}"{sel}>{_esc(label)}</option>')
    return "\n".join(parts)


def group_by_district_zone(
    rows: list[dict[str, str]],
) -> OrderedDict[str, OrderedDict[str, list[dict[str, str]]]]:
    """district → zoneNaturalKey → listings, preserving first-seen order."""
    tree: OrderedDict[str, OrderedDict[str, list[dict[str, str]]]] = OrderedDict()
    for row in rows:
        district = row.get("행정구") or "(구 미상)"
        key = row.get("zoneNaturalKey") or ""
        tree.setdefault(district, OrderedDict())
        tree[district].setdefault(key, []).append(row)
    return tree


def group_rows(rows: list[dict[str, str]]) -> list[tuple[str, list[dict[str, str]]]]:
    order: list[str] = []
    buckets: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        key = row.get("zoneNaturalKey") or ""
        if key not in buckets:
            buckets[key] = []
            order.append(key)
        buckets[key].append(row)
    return [(k, buckets[k]) for k in order]


def _listing_card(item: dict[str, str]) -> str:
    rid = f"{item.get('zoneNaturalKey')}|{item.get('articleNo')}|{item.get('rank')}"
    flag = item.get("호가_이상플래그") or ""
    inv_flag = item.get("실투대비_이상플래그") or ""
    flag_class = {"OK": "ok", "LOW": "warn", "HIGH": "warn"}.get(flag, "mute")
    inv_class = {"OK": "ok", "LOW": "danger", "HIGH": "danger"}.get(inv_flag, "mute")
    link_kind = item.get("linkKind") or ""
    url = item.get("articleUrl") or ""
    label = item.get("linkLabel") or ("매물 찍어서 열기" if link_kind == "article" else "구역 지도 열기")

    if url and link_kind in {"article", "map"}:
        cls = "open" if link_kind == "article" else "open map"
        extra = "" if link_kind == "article" else '<span class="hint">실매물 번호 없음</span>'
        link_html = (
            f'<button type="button" class="{cls}" data-open="{_esc(url)}">{_esc(label)}</button>'
            f'<button type="button" class="copy" data-copy="{_esc(url)}" title="주소만 복사 — 네이버 요청 없음">링크 복사</button>'
            f"{extra}"
        )
    else:
        link_html = '<span class="hint">링크 없음</span>'

    pip_cell = (item.get("insidePolygon") or "").strip()
    if pip_cell == "Y":
        pip_badge = '<span class="badge ok">구역 안 확인</span>'
    elif pip_cell == "N":
        pip_badge = '<span class="badge danger">구역 밖</span>'
    else:
        pip_badge = '<span class="badge warn">좌표 미공개</span>'

    anomaly_note = ""
    if inv_flag in {"LOW", "HIGH"}:
        anomaly_note = (
            f'<p class="anomaly">⚠ 기존 실투({_esc(item.get("기존_최소실투자금(억)") or "—")}~'
            f'{_esc(item.get("기존_최대실투자금(억)") or "—")}억) 대비 '
            f'호가/초투가 {_esc(inv_flag)} — Golden 승인 보류</p>'
        )

    addr_bits = [item.get("주소"), f"중개사 {item['중개사']}" if item.get("중개사") else ""]
    addr_text = " · ".join(b for b in addr_bits if b)
    addr_html = f'<p class="addr">{_esc(addr_text)}</p>' if addr_text else ""

    return f"""
<article class="listing {'anomaly-card' if inv_flag in {'LOW','HIGH'} else ''}" data-id="{_esc(rid)}" data-zone="{_esc(item.get('zoneNaturalKey') or '')}" data-est-chotu="{_esc(item.get('예상_초투(억)') or '')}" data-ask="{_esc(item.get('호가매매가(억)') or '')}" data-hint-p="{_esc(item.get('설명_프리미엄(억)') or item.get('힌트_프리미엄(억)') or '')}">
  <header>
    <div class="title-row">
      <strong>{_esc(item.get('title') or '(제목 없음)')}</strong>
      <span class="badge">{_esc(item.get('rletTpNm') or '')}</span>
      <span class="badge {flag_class}">호가vs매매 {_esc(flag)}</span>
      <span class="badge {inv_class}">실투대비 {_esc(inv_flag)}</span>
      {pip_badge}
    </div>
    {link_html}
  </header>
  {anomaly_note}
  <dl class="metrics">
    <div><dt>매매 호가</dt><dd>{_esc(item.get('호가매매가(억)') or '—')}억</dd></div>
    <div><dt>기보증금</dt><dd>{_esc(item.get('기보증금(억)') if item.get('기보증금(억)') not in (None, '') else '0')}억</dd></div>
    <div><dt>월세</dt><dd>{_esc(item.get('월세(만)') or '—')}만</dd></div>
    <div><dt>예상 초투</dt><dd>{_esc(item.get('예상_초투(억)') or '—')}억</dd></div>
    <div><dt>힌트 초투</dt><dd>{_esc(item.get('힌트_초투(억)') or '—')}억</dd></div>
    <div><dt>힌트 갭</dt><dd>{_esc(item.get('힌트_갭(억)') or '—')}억</dd></div>
    <div><dt>힌트 P</dt><dd>{_esc(item.get('힌트_프리미엄(억)') or '—')}억</dd></div>
    <div><dt>전세힌트</dt><dd>{_esc(item.get('힌트_전세(억)') or '—')}억</dd></div>
    <div><dt>융자금</dt><dd>{_esc(item.get('융자금(억)') or '—')}억</dd></div>
    <div><dt>입주가능일</dt><dd>{_esc(item.get('입주가능일') or '—')}</dd></div>
    <div><dt>전용</dt><dd>{_esc(item.get('전용') or '—')}</dd></div>
    <div><dt>공급</dt><dd>{_esc(item.get('공급') or '—')}</dd></div>
    <div><dt>대지지분</dt><dd>{_esc(item.get('대지지분') or '—')}</dd></div>
    <div><dt>층/향</dt><dd>{_esc(item.get('층') or '—')} / {_esc(item.get('향') or '—')}</dd></div>
    <div><dt>준공</dt><dd>{_esc(item.get('준공') or '—')}</dd></div>
    <div><dt>기존 실투</dt><dd>{_esc(item.get('기존_최소실투자금(억)') or '—')} ~ {_esc(item.get('기존_최대실투자금(억)') or '—')}억</dd></div>
    <div><dt>기존 매매</dt><dd>{_esc(item.get('기존_매매가') or '—')}</dd></div>
  </dl>
  {addr_html}
  <p class="feature"><span class="field-label">매물 특징</span>{_esc(item.get('매물특징') or item.get('descriptionSnippet') or '—')}</p>
  <p class="desc"><span class="field-label">매물 설명</span>{_esc(item.get('설명전문') or item.get('상세요약') or '—')}</p>
  <div class="approve">
    <label>설명 초투(억)<input data-field="설명_초투(억)" value="{_esc(item.get('설명_초투(억)') or item.get('예상_초투(억)') or '')}" /></label>
    <label>설명 프리미엄(억)<input data-field="설명_프리미엄(억)" value="{_esc(item.get('설명_프리미엄(억)') or '')}" /></label>
    <label>Golden반영<select data-field="Golden반영">{_options(DROPDOWN_Golden반영, item.get('Golden반영') or '')}</select></label>
    <label>검수상태<select data-field="검수상태">{_options(DROPDOWN_검수상태, item.get('검수상태') or 'ok')}</select></label>
    <label>승인<select data-field="승인">{_options(DROPDOWN_승인, item.get('승인') or 'Y')}</select></label>
    <label class="wide">검수메모<input data-field="검수메모" value="{_esc(item.get('검수메모') or '')}" /></label>
  </div>
  <script type="application/json" class="row-json">{_json_script(item)}</script>
</article>
"""


def _zone_proposal_card(prop: dict[str, str]) -> str:
    key = prop.get("zoneNaturalKey") or ""
    anomaly = (prop.get("실투대비_이상") or "").upper()
    anomaly_cls = {"OK": "ok", "LOW": "warn", "HIGH": "danger"}.get(anomaly, "mute")
    return f"""
<aside class="zone-rollup" data-zone-rollup="{_esc(key)}">
  <div class="rollup-label">구역 통합본 (1차 승인 단위)</div>
  <div class="rollup-ranges">
    <div><span>예상 초투 (승인분)</span><strong data-live="chotuRange">{_esc(prop.get('예상초투_범위') or '—')}</strong></div>
    <div><span>P (승인분)</span><strong data-live="pRange">{_esc(prop.get('P_범위') or '—')}</strong></div>
    <div><span>매매가(호가) (승인분)</span><strong data-live="askRange">{_esc(prop.get('매매가_범위') or '—')}</strong></div>
    <div><span>기존 실투</span><strong>{_esc(prop.get('기존_최소실투자금(억)') or '—')}~{_esc(prop.get('기존_최대실투자금(억)') or '—')}억</strong></div>
    <div><span>표본</span><strong data-live="sample">{_esc(prop.get('표본건수') or '0')}건 · 구역안 {_esc(prop.get('polygon안_건수') or '0')}</strong></div>
  </div>
  <p class="rollup-tally" data-live="tally">기본은 매물 전부 포함입니다. 제외할 매물만 미승인하면 위 범위가 바로 바뀝니다.</p>
  <p class="rollup-note">예상 초투 범위 → Golden <b>실투자금</b> 후보. P 범위 → Golden <b>프리미엄</b> 후보.
    매매가 범위는 참고만(G열 자동 반영 없음). 미승인 매물은 통합본에서 빠집니다.</p>
  <div class="rollup-actions">
    <span class="badge {anomaly_cls}">실투대비 {_esc(anomaly or '—')}</span>
    <button type="button" class="primary rollup-approve" data-rollup-approve="{_esc(key)}">통합본 승인</button>
    <button type="button" class="ghost rollup-reject" data-rollup-reject="{_esc(key)}">보류</button>
    <label class="zone-done"><input type="checkbox" data-zone-done="{_esc(key)}" /> 이 구역 검수 완료</label>
  </div>
  <script type="application/json" class="zone-prop-json">{_json_script(prop)}</script>
</aside>
"""


def render_html(
    rows: list[dict[str, str]],
    *,
    title: str,
    source_mode: str = "",
    open_gap_ms: int = OPEN_GAP_MS,
    burst_limit: int = BURST_LIMIT,
    proposals: list[dict[str, str]] | None = None,
) -> str:
    tree = group_by_district_zone(rows)
    proposals = proposals if proposals is not None else build_zone_proposals(rows)
    prop_by_key = {p.get("zoneNaturalKey") or "": p for p in proposals}
    districts = list(tree.keys())
    first_district = districts[0] if districts else ""
    first_zone = ""
    if first_district and tree[first_district]:
        first_zone = next(iter(tree[first_district].keys()))

    is_manual = "manual" in (source_mode or "").lower()
    banner = ""
    if is_manual:
        banner = """
<div class="banner warn-banner">
  <strong>데모/수동 픽스처 데이터입니다.</strong> 라이브 크롤 후 다시 열어 검수하세요.
</div>
"""

    district_nav = []
    zone_panels = []
    listing_panels = []

    for district, zones in tree.items():
        zone_count = len(zones)
        district_nav.append(
            f'<button type="button" class="nav-district" data-district="{_esc(district)}">'
            f'<span class="nav-label">{_esc(district)}</span>'
            f'<span class="nav-meta" data-district-meta="{_esc(district)}">0/{zone_count} 완료</span>'
            f"</button>"
        )
        zone_btns = []
        for key, items in zones.items():
            head = items[0]
            zone_name = head.get("구역명") or key
            prop = prop_by_key.get(key) or {
                "zoneNaturalKey": key,
                "예상초투_범위": "",
                "매매가_범위": "",
                "표본건수": str(len(items)),
                "polygon안_건수": "0",
                "기존_최소실투자금(억)": head.get("기존_최소실투자금(억)") or "",
                "기존_최대실투자금(억)": head.get("기존_최대실투자금(억)") or "",
                "실투대비_이상": "",
            }
            range_label = prop.get("예상초투_범위") or f"{len(items)}건"
            zone_btns.append(
                f'<button type="button" class="nav-zone" data-district="{_esc(district)}" '
                f'data-zone="{_esc(key)}">'
                f'<span class="zone-status" data-zone-status="{_esc(key)}">미착수</span>'
                f'<span class="zone-label">{_esc(zone_name)}</span>'
                f'<span class="zone-count">{_esc(range_label)}</span>'
                f"</button>"
            )
            listing_panels.append(
                f'<section class="zone-page" data-zone-page="{_esc(key)}" hidden>'
                f'<div class="zone-page-head">'
                f'<div><h2>{_esc(zone_name)}</h2>'
                f'<p class="meta">{_esc(district)} · {_esc(head.get("행정동") or "")} · {_esc(key)}</p></div>'
                f"</div>"
                f"{_zone_proposal_card(prop)}"
                f'{"".join(_listing_card(item) for item in items)}'
                f"</section>"
            )
        zone_panels.append(
            f'<div class="zone-list" data-zone-list="{_esc(district)}" hidden>'
            f'{"".join(zone_btns)}</div>'
        )

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{_esc(title)}</title>
  <style>
    :root {{
      --bg: #f3efe6; --ink: #1c1914; --muted: #6a6258; --card: #fffdf8;
      --line: #d9d0c2; --accent: #0f5c4c; --warn: #8a4b12; --ok: #1f6b3a; --danger: #9b1c1c;
      --done: #0f5c4c; --progress: #8a4b12; --idle: #8a8378;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0; font-family: "Pretendard", "Noto Sans KR", sans-serif;
      background: radial-gradient(circle at 10% 0%, #efe2c8 0%, transparent 40%),
                  linear-gradient(180deg, #f7f2e8, var(--bg));
      color: var(--ink); line-height: 1.45;
    }}
    header.app {{
      position: sticky; top: 0; z-index: 8;
      display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem; background: rgba(255,253,248,.94);
      border-bottom: 1px solid var(--line); backdrop-filter: blur(8px);
    }}
    header.app h1 {{ margin: 0; font-size: 1.1rem; }}
    header.app p {{ margin: .15rem 0 0; color: var(--muted); font-size: .88rem; }}
    header.app .actions {{ display: flex; gap: .5rem; flex-wrap: wrap; }}
    button.primary {{
      background: var(--accent); color: white; border: 0; border-radius: 8px;
      padding: .65rem 1rem; font-weight: 600; cursor: pointer;
    }}
    button.ghost {{
      background: transparent; color: var(--ink); border: 1px solid var(--line);
      border-radius: 8px; padding: .55rem .9rem; font-weight: 600; cursor: pointer;
    }}
    .zone-rollup {{
      background: #eef6f3; border: 1px solid #b7d4c8; border-radius: 14px;
      padding: 1rem 1.1rem; margin: 0 0 1rem;
    }}
    .zone-rollup.approved {{ background: #e8f7ee; border-color: #9fd0b0; }}
    .zone-rollup.rejected {{ background: #f7f2ea; border-color: var(--line); }}
    .rollup-label {{ font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); font-weight: 700; }}
    .rollup-ranges {{
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: .7rem; margin: .65rem 0;
    }}
    .rollup-ranges span {{ display: block; color: var(--muted); font-size: .78rem; }}
    .rollup-ranges strong {{ font-size: 1.15rem; }}
    .rollup-note {{ margin: 0 0 .75rem; color: var(--muted); font-size: .85rem; }}
    .rollup-tally {{
      margin: 0 0 .55rem; font-size: .88rem; font-weight: 600; color: var(--ink);
    }}
    .rollup-approve[disabled] {{ opacity: .45; cursor: not-allowed; }}
    .listing.approved {{ box-shadow: inset 3px 0 0 #2f9e62; }}
    .listing.rejected {{ opacity: .72; box-shadow: inset 3px 0 0 #b9b3a8; }}
    .rollup-actions {{ display: flex; flex-wrap: wrap; gap: .55rem; align-items: center; }}
    .layout {{
      display: grid; grid-template-columns: 220px 260px minmax(0, 1fr);
      gap: 0; min-height: calc(100vh - 72px);
    }}
    .mobile-nav-toggle, .mobile-drawer-backdrop {{ display: none; }}
    .sync-bar {{
      display: none; position: sticky; bottom: 0; z-index: 9;
      padding: .65rem .85rem calc(.65rem + env(safe-area-inset-bottom));
      background: rgba(255,253,248,.96); border-top: 1px solid var(--line);
      gap: .45rem; flex-wrap: wrap; backdrop-filter: blur(8px);
    }}
    .sync-bar button, .sync-bar label.file-btn {{
      flex: 1 1 40%; min-height: 44px; font-size: .9rem;
    }}
    label.file-btn {{
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; color: var(--ink); border: 1px solid var(--line);
      border-radius: 8px; padding: .55rem .9rem; font-weight: 600; cursor: pointer;
    }}
    label.file-btn input {{ display: none; }}
    .toast {{
      position: fixed; left: 50%; bottom: 5.5rem; transform: translateX(-50%);
      background: #1c1914; color: #fff; padding: .55rem .9rem; border-radius: 999px;
      font-size: .85rem; z-index: 20; display: none; max-width: 90vw;
    }}
    .toast.show {{ display: block; }}
    @media (max-width: 960px) {{
      header.app {{ padding: .75rem .85rem; align-items: flex-start; }}
      header.app h1 {{ font-size: 1rem; }}
      header.app .actions {{ display: none; }}
      .mobile-nav-toggle {{
        display: inline-flex; align-items: center; justify-content: center;
        min-height: 44px; min-width: 44px; border-radius: 10px;
        border: 1px solid var(--line); background: var(--card); font-weight: 700;
      }}
      .layout {{ grid-template-columns: 1fr; min-height: auto; padding-bottom: 4.5rem; }}
      .rail {{
        position: fixed; top: 0; left: 0; bottom: 0; width: min(86vw, 320px);
        z-index: 12; transform: translateX(-105%); transition: transform .2s ease;
        border-right: 1px solid var(--line); max-height: none; box-shadow: 8px 0 24px rgba(0,0,0,.12);
      }}
      .rail.zone-rail {{ left: auto; right: 0; transform: translateX(105%); box-shadow: -8px 0 24px rgba(0,0,0,.12); }}
      body.nav-open .rail.district-rail,
      body.zones-open .rail.zone-rail {{ transform: translateX(0); }}
      .mobile-drawer-backdrop {{
        display: none; position: fixed; inset: 0; background: rgba(28,25,20,.35); z-index: 11;
      }}
      body.nav-open .mobile-drawer-backdrop,
      body.zones-open .mobile-drawer-backdrop {{ display: block; }}
      main.work {{ padding: .85rem .85rem 1.5rem; }}
      .metrics {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
      .approve {{ grid-template-columns: 1fr 1fr; }}
      .approve input, .approve select, .open, .copy, button.primary, button.ghost {{
        min-height: 44px; font-size: 16px; /* iOS zoom prevent */
      }}
      .rollup-actions {{ flex-direction: column; align-items: stretch; }}
      .rollup-actions button {{ width: 100%; min-height: 44px; }}
      .sync-bar {{ display: flex; }}
      .note {{ font-size: .8rem; }}
    }}
    .rail {{
      background: #faf6ef; border-right: 1px solid var(--line);
      padding: .75rem; overflow: auto;
    }}
    .rail h3 {{
      margin: .2rem .4rem .6rem; font-size: .72rem; letter-spacing: .08em;
      text-transform: uppercase; color: var(--muted);
    }}
    .nav-district, .nav-zone {{
      width: 100%; text-align: left; background: transparent; border: 1px solid transparent;
      border-radius: 10px; padding: .65rem .7rem; margin: 0 0 .35rem; cursor: pointer;
      display: flex; flex-wrap: wrap; gap: .25rem .5rem; align-items: baseline;
      color: var(--ink); font: inherit;
    }}
    .nav-district:hover, .nav-zone:hover, .nav-district.active, .nav-zone.active {{
      background: var(--card); border-color: var(--line);
    }}
    .nav-district.active, .nav-zone.active {{ box-shadow: inset 3px 0 0 var(--accent); }}
    .nav-label, .zone-label {{ font-weight: 700; }}
    .nav-meta, .zone-count {{ color: var(--muted); font-size: .78rem; margin-left: auto; }}
    .zone-status {{
      font-size: .7rem; font-weight: 700; padding: .12rem .4rem; border-radius: 999px;
      border: 1px solid var(--line); color: var(--idle);
    }}
    .zone-status.done {{ color: var(--done); border-color: #b9dcc5; background: #eef8f1; }}
    .zone-status.progress {{ color: var(--progress); border-color: #e6c9a4; background: #fff4e8; }}
    .zone-status.idle {{ color: var(--idle); }}
    .nav-district.done .nav-label::after {{ content: " ✓"; color: var(--done); }}
    main.work {{ padding: 1rem 1.25rem 3rem; overflow: auto; }}
    .banner {{ border-radius: 12px; padding: .9rem 1rem; margin: 0 0 1rem; font-size: .92rem; }}
    .warn-banner {{ background: #fff1e4; border: 1px solid #e6c9a4; color: #6a3b0e; }}
    .note {{ color: var(--muted); font-size: .85rem; margin: 0 0 .75rem; }}
    .zone-page-head {{
      display: flex; justify-content: space-between; gap: 1rem; align-items: center;
      margin: 0 0 1rem; flex-wrap: wrap;
    }}
    .zone-page-head h2 {{ margin: 0; font-size: 1.25rem; }}
    .zone-done {{ font-size: .9rem; font-weight: 600; color: var(--accent); }}
    .listing {{
      background: var(--card); border: 1px solid var(--line); border-radius: 14px;
      padding: 1rem 1.1rem 1.2rem; margin: 0 0 .85rem;
    }}
    .listing.anomaly-card {{ background: #fff7f5; }}
    .feature, .desc {{
      margin: .55rem 0 0; font-size: .92rem; white-space: pre-wrap; word-break: break-word;
    }}
    .feature {{ color: var(--ink); }}
    .desc {{ color: #3a342c; }}
    .field-label {{
      display: inline-block; min-width: 4.5rem; margin-right: .4rem;
      font-size: .72rem; font-weight: 700; letter-spacing: .04em;
      color: var(--muted); text-transform: none;
    }}
    .title-row {{ display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }}
    .badge {{
      font-size: .75rem; padding: .15rem .45rem; border-radius: 999px;
      border: 1px solid var(--line); color: var(--muted);
    }}
    .badge.ok {{ color: var(--ok); border-color: #b9dcc5; background: #eef8f1; }}
    .badge.warn {{ color: var(--warn); border-color: #e6c9a4; background: #fff4e8; }}
    .badge.danger {{ color: var(--danger); border-color: #f0b4b4; background: #fdecec; font-weight: 700; }}
    .open, .copy {{
      background: none; border: 1px solid var(--accent); color: var(--accent);
      font-weight: 600; margin: .35rem .35rem 0 0; padding: .35rem .7rem;
      border-radius: 8px; font-size: .85rem; cursor: pointer;
    }}
    .open.map, .copy {{ border-color: var(--line); color: var(--muted); }}
    .open[disabled] {{ opacity: .5; cursor: progress; }}
    .hint {{ color: var(--muted); font-size: .82rem; margin-left: .5rem; }}
    .anomaly {{
      margin: .55rem 0 0; padding: .55rem .7rem; border-radius: 8px;
      background: #fdecec; color: var(--danger); font-size: .88rem; font-weight: 600;
    }}
    .metrics {{
      display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: .55rem; margin: .85rem 0;
    }}
    .metrics div {{ background: #f7f3ea; border-radius: 10px; padding: .55rem .65rem; }}
    .metrics dt {{ font-size: .72rem; color: var(--muted); }}
    .metrics dd {{ margin: .1rem 0 0; font-weight: 700; }}
    .desc {{
      white-space: pre-wrap; background: #fbf8f1; border-left: 3px solid var(--accent);
      padding: .7rem .85rem; border-radius: 0 10px 10px 0; color: #3a342c; font-size: .92rem;
    }}
    .addr {{ margin: .1rem 0 .5rem; color: var(--muted); font-size: .85rem; }}
    .approve {{
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: .55rem; margin-top: .85rem;
    }}
    .approve label {{ display: flex; flex-direction: column; gap: .25rem; font-size: .78rem; color: var(--muted); }}
    .approve label.wide {{ grid-column: 1 / -1; }}
    .approve input, .approve select {{
      border: 1px solid var(--line); border-radius: 8px; padding: .45rem .55rem;
      font: inherit; color: var(--ink); background: white;
    }}
    #rate-banner {{
      display: none; background: #fdecec; border: 1px solid #f0b4b4; color: var(--danger);
      border-radius: 12px; padding: .8rem 1rem; margin: 0 0 1rem; font-size: .92rem;
    }}
    #rate-banner.show {{ display: block; }}
    .empty {{ color: var(--muted); padding: 2rem 0; }}
  </style>
</head>
<body>
  <header class="app">
    <div>
      <h1>{_esc(title)}</h1>
      <p>구 → 구역 검수 · 승인 JSON으로 폰↔노트북 동기화 · 매매가(G) 자동 반영 없음</p>
    </div>
    <div class="actions">
      <button type="button" class="ghost" id="export-approvals">승인 JSON 내보내기</button>
      <label class="file-btn">승인 JSON 가져오기<input type="file" id="import-approvals" accept="application/json,.json" /></label>
      <button type="button" class="ghost" id="copy-approvals">승인 클립보드</button>
      <button type="button" class="primary" id="download-zones">구역 통합본 CSV</button>
      <button type="button" class="ghost" id="download">매물 상세 CSV</button>
    </div>
    <button type="button" class="mobile-nav-toggle" id="open-districts" aria-label="구 선택">구</button>
    <button type="button" class="mobile-nav-toggle" id="open-zones" aria-label="구역 선택">구역</button>
  </header>
  <div class="mobile-drawer-backdrop" id="drawer-backdrop"></div>
  <div class="layout">
    <aside class="rail district-rail">
      <h3>행정구</h3>
      {''.join(district_nav)}
    </aside>
    <aside class="rail zone-rail">
      <h3>구역</h3>
      {''.join(zone_panels)}
    </aside>
    <main class="work">
      {banner}
      <p class="note"><b>모바일:</b> 검수 후 하단 <b>승인 JSON 저장</b> → 카톡/메일/클라우드로 노트북에 전달 → 노트북에서 <b>가져오기</b> 후 구역 CSV로 apply.
        같은 폰 브라우저는 자동 저장(localStorage)되지만, 기기 간에는 JSON이 필요합니다.</p>
      <p class="note"><b>1차 목표:</b> 구역 통합본은 <b>매물 5건이 모두 포함된 값</b>으로 시작합니다.
        빼야 할 매물만 <b>미승인</b>하면 예상 초투·매매가 범위가 바로 다시 계산됩니다.
        범위가 맞으면 <b>통합본 승인</b> 한 번으로 구역을 확정합니다.
        매매가(G)는 자동 반영하지 않습니다.</p>
      <p class="note">구역당 <b>예상 초투</b>(호가 − 기보증금)가 낮은 상위 5건. 보증 미입력=0 → 순위 뒤로.
        좌표 확인분이 우선. 무결성 확인 후 전면 자동화 예정.</p>
      <p class="note"><b>네이버 차단 예방:</b> 설명·주소·대지지분이 이미 있으면 매물을 열지 마세요.
        열 때는 탭 1개 재사용 + {open_gap_ms/1000:g}초 간격. 주소만 필요하면 <code>링크 복사</code>.</p>
      <div id="rate-banner">
        짧은 시간에 매물을 많이 열었습니다(<span id="open-count">0</span>회).
        몇 분 쉬었다 이어서 검수하세요.
      </div>
      <div id="empty" class="empty" hidden>왼쪽에서 구와 구역을 선택하세요.</div>
      {''.join(listing_panels)}
    </main>
  </div>
  <div class="sync-bar">
    <button type="button" class="primary" id="m-export-approvals">승인 JSON 저장</button>
    <button type="button" class="ghost" id="m-copy-approvals">클립보드 복사</button>
    <label class="file-btn">JSON 가져오기<input type="file" id="m-import-approvals" accept="application/json,.json" /></label>
    <button type="button" class="ghost" id="m-download-zones">구역 CSV</button>
  </div>
  <div class="toast" id="toast"></div>
  <script>
    const OPEN_GAP_MS = {open_gap_ms};
    const BURST_LIMIT = {burst_limit};
    const BURST_WINDOW_MS = {BURST_WINDOW_MS};
    const BOARD_ID = {json.dumps(title, ensure_ascii=False)};
    const STORAGE_KEY = 'seedfit_listing_review_v3::' + BOARD_ID;
    const FIRST_DISTRICT = {json.dumps(first_district, ensure_ascii=False)};
    const FIRST_ZONE = {json.dumps(first_zone, ensure_ascii=False)};

    let lastOpenAt = 0;
    let opens = [];
    let state = loadState();

    function toast(msg) {{
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2200);
    }}
    function closeDrawers() {{
      document.body.classList.remove('nav-open', 'zones-open');
    }}
    document.getElementById('open-districts')?.addEventListener('click', () => {{
      document.body.classList.toggle('nav-open');
      document.body.classList.remove('zones-open');
    }});
    document.getElementById('open-zones')?.addEventListener('click', () => {{
      document.body.classList.toggle('zones-open');
      document.body.classList.remove('nav-open');
    }});
    document.getElementById('drawer-backdrop')?.addEventListener('click', closeDrawers);

    function loadState() {{
      try {{
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
        // migrate v1 if present
        const legacy = localStorage.getItem('seedfit_listing_review_v1');
        return legacy ? JSON.parse(legacy) : {{}};
      }} catch {{ return {{}}; }}
    }}
    function saveState() {{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }}

    function buildApprovalBundle() {{
      return {{
        schema: 'seedfit.listing_approvals.v1',
        boardId: BOARD_ID,
        exportedAt: new Date().toISOString(),
        state,
        zoneProposals: collectZoneProposals(),
        listingRows: collectRows(),
      }};
    }}
    function saveBlob(filename, blob) {{
      // Revoking synchronously after click() cancels large downloads in Chrome.
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {{ a.remove(); URL.revokeObjectURL(url); }}, 10000);
    }}
    function downloadJson(filename, obj) {{
      saveBlob(filename, new Blob([JSON.stringify(obj, null, 2)], {{ type: 'application/json;charset=utf-8' }}));
    }}
    async function copyApprovals() {{
      const text = JSON.stringify(buildApprovalBundle(), null, 2);
      try {{
        await navigator.clipboard.writeText(text);
        toast('승인 JSON 클립보드 복사됨');
      }} catch {{
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove();
        toast('승인 JSON 복사됨');
      }}
      if (navigator.share) {{
        try {{
          await navigator.share({{
            title: 'SeedFit 승인',
            text: '노트북에서 검수보드 → 승인 JSON 가져오기로 반영하세요.',
            files: [new File([text], 'seedfit_listing_approvals.json', {{ type: 'application/json' }})],
          }});
        }} catch {{}}
      }}
    }}
    function applyApprovalBundle(bundle) {{
      if (!bundle || typeof bundle !== 'object') throw new Error('invalid bundle');
      if (bundle.state && typeof bundle.state === 'object') {{
        state = bundle.state;
        saveState();
      }}
      restoreFields();
      Object.entries(state.zoneRollup || {{}}).forEach(([key, decision]) => {{
        const card = document.querySelector(`[data-zone-rollup="${{CSS.escape(key)}}"]`);
        if (card) {{
          card.classList.toggle('approved', decision === 'Y');
          card.classList.toggle('rejected', decision === 'N');
        }}
      }});
      refreshStatuses();
      toast('승인 내역 가져오기 완료');
    }}
    function importApprovalsFromFile(file) {{
      const reader = new FileReader();
      reader.onload = () => {{
        try {{ applyApprovalBundle(JSON.parse(String(reader.result || '{{}}'))); }}
        catch (e) {{ toast('가져오기 실패: JSON 확인'); console.error(e); }}
      }};
      reader.readAsText(file);
    }}
    function wireExportImport(exportId, copyId, importId) {{
      document.getElementById(exportId)?.addEventListener('click', () => {{
        // A silent throw here once made the button look dead for a whole review session.
        try {{
          const bundle = buildApprovalBundle();
          downloadJson('seedfit_listing_approvals.json', bundle);
          toast(`승인 JSON 저장됨 (구역 ${{bundle.zoneProposals.length}} · 매물 ${{bundle.listingRows.length}})`);
        }} catch (e) {{
          console.error(e);
          toast('내보내기 실패: ' + e.message);
        }}
      }});
      document.getElementById(copyId)?.addEventListener('click', () => {{ copyApprovals(); }});
      document.getElementById(importId)?.addEventListener('change', (ev) => {{
        const f = ev.target.files && ev.target.files[0];
        if (f) importApprovalsFromFile(f);
        ev.target.value = '';
      }});
    }}
    wireExportImport('export-approvals', 'copy-approvals', 'import-approvals');
    wireExportImport('m-export-approvals', 'm-copy-approvals', 'm-import-approvals');
    document.getElementById('m-download-zones')?.addEventListener('click', () => {{
      downloadCsv('구역_통합본_승인.csv', collectZoneProposals());
    }});

    function noteOpen() {{
      const now = Date.now();
      opens.push(now);
      opens = opens.filter((t) => now - t < BURST_WINDOW_MS);
      document.getElementById('open-count').textContent = opens.length;
      document.getElementById('rate-banner').classList.toggle('show', opens.length >= BURST_LIMIT);
    }}
    function openPaced(url, btn) {{
      const wait = Math.max(0, OPEN_GAP_MS - (Date.now() - lastOpenAt));
      lastOpenAt = Date.now() + wait;
      if (wait === 0) {{
        window.open(url, 'seedfitNaver', 'noopener');
        noteOpen();
        return;
      }}
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = `${{Math.ceil(wait / 1000)}}초 후 열림…`;
      setTimeout(() => {{
        window.open(url, 'seedfitNaver', 'noopener');
        noteOpen();
        btn.disabled = false;
        btn.textContent = label;
      }}, wait);
    }}

    function parseEok(v) {{
      if (v == null || v === '') return null;
      const n = parseFloat(String(v).replace(/억/g, '').replace(/,/g, '').trim());
      return Number.isFinite(n) ? n : null;
    }}
    function fmtEok(n) {{
      if (n == null || !Number.isFinite(n)) return '';
      return String(Math.round(n * 100) / 100).replace(/[.]0+$/, '').replace(/([.][1-9])0$/, '$1');
    }}
    function fmtRange(vals) {{
      if (!vals.length) return '—';
      const lo = Math.min(...vals);
      const hi = Math.max(...vals);
      const a = fmtEok(lo);
      const b = fmtEok(hi);
      return a === b ? `${{a}}억` : `${{a}}~${{b}}억`;
    }}
    function fieldVal(el, name) {{
      return el.querySelector(`[data-field="${{name}}"]`)?.value || '';
    }}
    function setField(el, name, value) {{
      const input = el.querySelector(`[data-field="${{name}}"]`);
      if (!input) return;
      input.value = value;
      const id = el.getAttribute('data-id');
      state.fields = state.fields || {{}};
      state.fields[id] = state.fields[id] || {{}};
      state.fields[id][name] = value;
    }}
    function listingArts(zoneKey) {{
      return [...document.querySelectorAll(`article.listing[data-zone="${{CSS.escape(zoneKey)}}"]`)];
    }}
    function listingTally(zoneKey) {{
      const arts = listingArts(zoneKey);
      let y = 0, n = 0, empty = 0;
      arts.forEach((el) => {{
        const v = fieldVal(el, '승인');
        if (v === 'N') n += 1;
        else if (v === 'Y') y += 1;
        else empty += 1;
      }});
      const included = y + empty;
      return {{ total: arts.length, y, n, empty, included, ready: arts.length > 0 && included > 0 }};
    }}
    function listingRow(el) {{
      try {{ return JSON.parse(el.querySelector('.row-json').textContent); }}
      catch {{ return {{}}; }}
    }}
    function listingChotu(el) {{
      const row = listingRow(el);
      return parseEok(fieldVal(el, '설명_초투(억)'))
        ?? parseEok(el.getAttribute('data-est-chotu'))
        ?? parseEok(row['예상_초투(억)'])
        ?? parseEok(row['힌트_초투(억)']);
    }}
    function listingAsk(el) {{
      const row = listingRow(el);
      return parseEok(el.getAttribute('data-ask'))
        ?? parseEok(row['호가매매가(억)']);
    }}
    function listingP(el) {{
      const row = listingRow(el);
      return parseEok(fieldVal(el, '설명_프리미엄(억)'))
        ?? parseEok(el.getAttribute('data-hint-p'))
        ?? parseEok(row['설명_프리미엄(억)'])
        ?? parseEok(row['힌트_프리미엄(억)']);
    }}
    function recomputeZoneRollup(zoneKey) {{
      if (!zoneKey) return;
      const arts = listingArts(zoneKey);
      const tally = listingTally(zoneKey);
      const pool = arts.filter((el) => fieldVal(el, '승인') !== 'N');
      const chotus = pool.map(listingChotu).filter((v) => v != null);
      const asks = pool.map(listingAsk).filter((v) => v != null);
      const premiums = pool.map(listingP).filter((v) => v != null);
      const articleNos = pool.map((el) => {{
        try {{ return JSON.parse(el.querySelector('.row-json').textContent).articleNo || ''; }}
        catch {{ return ''; }}
      }}).filter(Boolean);
      const card = document.querySelector(`[data-zone-rollup="${{CSS.escape(zoneKey)}}"]`);
      const live = {{
        예상초투_min: chotus.length ? fmtEok(Math.min(...chotus)) : '',
        예상초투_max: chotus.length ? fmtEok(Math.max(...chotus)) : '',
        예상초투_범위: fmtRange(chotus),
        매매가_min: asks.length ? fmtEok(Math.min(...asks)) : '',
        매매가_max: asks.length ? fmtEok(Math.max(...asks)) : '',
        매매가_범위: fmtRange(asks),
        P_min: premiums.length ? fmtEok(Math.min(...premiums)) : '',
        P_max: premiums.length ? fmtEok(Math.max(...premiums)) : '',
        P_범위: premiums.length ? fmtRange(premiums) : '',
        표본건수: String(pool.length),
        articleNos: articleNos.join('|'),
        승인건수: String(tally.y),
        미승인건수: String(tally.n),
        미정건수: String(tally.empty),
      }};
      state.zoneProposal = state.zoneProposal || {{}};
      state.zoneProposal[zoneKey] = live;
      if (card) {{
        const setLive = (name, text) => {{
          const node = card.querySelector(`[data-live="${{name}}"]`);
          if (node) node.textContent = text;
        }};
        setLive('chotuRange', live.예상초투_범위);
        setLive('pRange', live.P_범위 || '—');
        setLive('askRange', live.매매가_범위);
        setLive('sample', `${{tally.included}}/${{tally.total}}건 포함`);
        const tallyEl = card.querySelector('[data-live="tally"]');
        if (tallyEl) {{
          if (!tally.total) tallyEl.textContent = '매물이 없습니다.';
          else if (!tally.included) tallyEl.textContent = `전원 제외(${{tally.n}}) — 통합본에 넣을 매물이 없습니다. 보류하세요.`;
          else if (tally.n) tallyEl.textContent = `포함 ${{tally.included}} · 제외 ${{tally.n}} — 제외분은 범위에서 빠졌습니다. 통합본 승인 가능.`;
          else tallyEl.textContent = `매물 ${{tally.total}}건 모두 포함. 빼려면 해당 매물을 미승인하세요.`;
        }}
        const approveBtn = card.querySelector('[data-rollup-approve]');
        if (approveBtn) approveBtn.disabled = !tally.ready;
        arts.forEach((el) => {{
          const v = fieldVal(el, '승인');
          el.classList.toggle('approved', v === 'Y');
          el.classList.toggle('rejected', v === 'N');
        }});
      }}
    }}
    function refreshAllZoneRollups() {{
      document.querySelectorAll('[data-zone-rollup]').forEach((el) => {{
        recomputeZoneRollup(el.getAttribute('data-zone-rollup'));
      }});
    }}
    function applyListingApproval(article) {{
      const decision = fieldVal(article, '승인');
      if (decision === 'Y') {{
        if (fieldVal(article, '검수상태') === 'pending' || !fieldVal(article, '검수상태')) {{
          setField(article, '검수상태', 'ok');
        }}
        if (!fieldVal(article, '설명_초투(억)')) {{
          const est = article.getAttribute('data-est-chotu') || '';
          if (est) setField(article, '설명_초투(억)', est);
        }}
      }} else if (decision === 'N') {{
        setField(article, '검수상태', 'reject');
      }}
      const zoneKey = article.getAttribute('data-zone');
      if (state.zoneRollup && state.zoneRollup[zoneKey] === 'Y') {{
        state.zoneRollup[zoneKey] = '';
        state.zoneDone = state.zoneDone || {{}};
        state.zoneDone[zoneKey] = false;
      }}
      recomputeZoneRollup(zoneKey);
    }}

    function zoneStatus(zoneKey) {{
      if (state.zoneDone && state.zoneDone[zoneKey]) return 'done';
      const rollup = state.zoneRollup && state.zoneRollup[zoneKey];
      if (rollup === 'Y') return 'done';
      if (rollup === 'N') return 'progress';
      const tally = listingTally(zoneKey);
      if (tally.ready) return 'progress';
      if (tally.y || tally.n) return 'progress';
      return 'idle';
    }}

    function applyZoneRollup(zoneKey, decision) {{
      const tally = listingTally(zoneKey);
      if (decision === 'Y' && !tally.ready) {{
        toast('매물마다 승인 또는 미승인을 모두 고른 뒤 통합본을 승인하세요.');
        return;
      }}
      state.zoneRollup = state.zoneRollup || {{}};
      state.zoneRollup[zoneKey] = decision;
      const card = document.querySelector(`[data-zone-rollup="${{CSS.escape(zoneKey)}}"]`);
      if (card) {{
        card.classList.toggle('approved', decision === 'Y');
        card.classList.toggle('rejected', decision === 'N');
      }}
      const arts = listingArts(zoneKey);
      arts.forEach((el) => {{
        const listingDecision = fieldVal(el, '승인');
        if (decision === 'Y') {{
          if (listingDecision !== 'Y') return;
          if (!fieldVal(el, '설명_초투(억)')) {{
            const est = el.getAttribute('data-est-chotu') || '';
            if (est) setField(el, '설명_초투(억)', est);
          }}
          setField(el, '검수상태', 'ok');
          setField(el, 'Golden반영', '실투자금만');
        }}
      }});
      if (decision === 'Y') {{
        state.zoneDone = state.zoneDone || {{}};
        state.zoneDone[zoneKey] = true;
      }} else if (decision === 'N') {{
        state.zoneDone = state.zoneDone || {{}};
        state.zoneDone[zoneKey] = false;
      }}
      recomputeZoneRollup(zoneKey);
      saveState();
      refreshStatuses();
    }}

    function refreshStatuses() {{
      document.querySelectorAll('[data-zone-status]').forEach((el) => {{
        const key = el.getAttribute('data-zone-status');
        const st = zoneStatus(key);
        el.className = 'zone-status ' + st;
        el.textContent = st === 'done' ? '승인완료' : (st === 'progress' ? '진행중' : '미착수');
      }});
      document.querySelectorAll('.nav-district').forEach((btn) => {{
        const district = btn.getAttribute('data-district');
        const zones = [...document.querySelectorAll(`.nav-zone[data-district="${{CSS.escape(district)}}"]`)];
        const done = zones.filter((z) => zoneStatus(z.getAttribute('data-zone')) === 'done').length;
        const meta = document.querySelector(`[data-district-meta="${{CSS.escape(district)}}"]`);
        if (meta) meta.textContent = `${{done}}/${{zones.length}} 완료`;
        btn.classList.toggle('done', done === zones.length && zones.length > 0);
      }});
      document.querySelectorAll('[data-zone-done]').forEach((box) => {{
        const key = box.getAttribute('data-zone-done');
        box.checked = !!(state.zoneDone && state.zoneDone[key]);
      }});
    }}

    function showDistrict(district) {{
      document.querySelectorAll('.nav-district').forEach((el) => {{
        el.classList.toggle('active', el.getAttribute('data-district') === district);
      }});
      document.querySelectorAll('.zone-list').forEach((el) => {{
        el.hidden = el.getAttribute('data-zone-list') !== district;
      }});
      state.currentDistrict = district;
      saveState();
      document.body.classList.remove('nav-open');
      document.body.classList.add('zones-open');
      const preferred = state.currentZone;
      const preferredBtn = preferred
        ? document.querySelector(`.nav-zone[data-district="${{CSS.escape(district)}}"][data-zone="${{CSS.escape(preferred)}}"]`)
        : null;
      const first = preferredBtn || document.querySelector(`.nav-zone[data-district="${{CSS.escape(district)}}"]`);
      if (first) showZone(first.getAttribute('data-zone'));
      else showZone('');
    }}

    function showZone(zoneKey) {{
      document.querySelectorAll('.nav-zone').forEach((el) => {{
        el.classList.toggle('active', el.getAttribute('data-zone') === zoneKey);
      }});
      document.querySelectorAll('.zone-page').forEach((el) => {{
        el.hidden = el.getAttribute('data-zone-page') !== zoneKey;
      }});
      document.getElementById('empty').hidden = !!zoneKey;
      state.currentZone = zoneKey;
      saveState();
      closeDrawers();
      refreshStatuses();
      window.scrollTo({{ top: 0, behavior: 'smooth' }});
    }}

    function restoreFields() {{
      if (!state.fields) return;
      document.querySelectorAll('article.listing').forEach((el) => {{
        const id = el.getAttribute('data-id');
        const saved = state.fields[id];
        if (!saved) return;
        el.querySelectorAll('[data-field]').forEach((input) => {{
          const key = input.getAttribute('data-field');
          if (saved[key] !== undefined) input.value = saved[key];
        }});
      }});
    }}
    function seedDefaultApprovals() {{
      document.querySelectorAll('article.listing').forEach((el) => {{
        if (fieldVal(el, '승인')) return;
        setField(el, '승인', 'Y');
        if (!fieldVal(el, '검수상태') || fieldVal(el, '검수상태') === 'pending') {{
          setField(el, '검수상태', 'ok');
        }}
        if (!fieldVal(el, '설명_초투(억)')) {{
          const est = el.getAttribute('data-est-chotu') || listingRow(el)['예상_초투(억)'] || '';
          if (est) setField(el, '설명_초투(억)', est);
        }}
      }});
    }}

    function persistField(el) {{
      const article = el.closest('article.listing');
      if (!article) return;
      const id = article.getAttribute('data-id');
      state.fields = state.fields || {{}};
      state.fields[id] = state.fields[id] || {{}};
      state.fields[id][el.getAttribute('data-field')] = el.value;
      if (el.getAttribute('data-field') === '승인') applyListingApproval(article);
      else recomputeZoneRollup(article.getAttribute('data-zone'));
      saveState();
      refreshStatuses();
    }}

    document.addEventListener('click', (event) => {{
      const dBtn = event.target.closest('.nav-district');
      if (dBtn) {{ showDistrict(dBtn.getAttribute('data-district')); return; }}
      const zBtn = event.target.closest('.nav-zone');
      if (zBtn) {{ showZone(zBtn.getAttribute('data-zone')); return; }}
      const approveBtn = event.target.closest('[data-rollup-approve]');
      if (approveBtn) {{
        if (approveBtn.disabled) {{
          toast('매물마다 승인 또는 미승인을 모두 고른 뒤 통합본을 승인하세요.');
          return;
        }}
        applyZoneRollup(approveBtn.getAttribute('data-rollup-approve'), 'Y');
        return;
      }}
      const rejectBtn = event.target.closest('[data-rollup-reject]');
      if (rejectBtn) {{ applyZoneRollup(rejectBtn.getAttribute('data-rollup-reject'), 'N'); return; }}
      const opener = event.target.closest('[data-open]');
      if (opener) {{ event.preventDefault(); openPaced(opener.getAttribute('data-open'), opener); return; }}
      const copier = event.target.closest('[data-copy]');
      if (copier) {{
        navigator.clipboard.writeText(copier.getAttribute('data-copy'));
        const label = copier.textContent;
        copier.textContent = '복사됨';
        setTimeout(() => {{ copier.textContent = label; }}, 1200);
      }}
    }});
    document.addEventListener('change', (event) => {{
      const done = event.target.closest('[data-zone-done]');
      if (done) {{
        state.zoneDone = state.zoneDone || {{}};
        state.zoneDone[done.getAttribute('data-zone-done')] = !!done.checked;
        saveState();
        refreshStatuses();
        return;
      }}
      if (event.target.matches('[data-field]')) persistField(event.target);
    }});
    document.addEventListener('input', (event) => {{
      if (event.target.matches('[data-field]')) persistField(event.target);
    }});

    function collectRows() {{
      const rows = [];
      document.querySelectorAll('article.listing').forEach((el) => {{
        const jsonEl = el.querySelector('.row-json') || el.querySelector('.row-json');
        const base = JSON.parse(jsonEl.textContent);
        el.querySelectorAll('[data-field]').forEach((input) => {{
          base[input.getAttribute('data-field')] = input.value;
        }});
        if (base['승인'] === 'Y' && !base['승인일']) {{
          base['승인일'] = new Date().toISOString().slice(0, 10);
        }}
        rows.push(base);
      }});
      return rows;
    }}
    function toCsv(rows) {{
      if (!rows.length) return '';
      const cols = Object.keys(rows[0]);
      const esc = (v) => {{
        const s = (v ?? '').toString();
        if (/[",\\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      }};
      return [cols.join(',')].concat(rows.map(r => cols.map(c => esc(r[c])).join(','))).join('\\n');
    }}
    function collectZoneProposals() {{
      const rows = [];
      document.querySelectorAll('[data-zone-rollup]').forEach((el) => {{
        const jsonEl = el.querySelector('.zone-prop-json') || el.querySelector('.zone-prop-json');
        const base = JSON.parse(jsonEl.textContent);
        const key = el.getAttribute('data-zone-rollup');
        const decision = (state.zoneRollup && state.zoneRollup[key]) || '';
        const live = (state.zoneProposal && state.zoneProposal[key]) || {{}};
        if (live.예상초투_범위) base['예상초투_범위'] = live.예상초투_범위;
        if (live.예상초투_min) base['예상초투_min(억)'] = live.예상초투_min;
        if (live.예상초투_max) base['예상초투_max(억)'] = live.예상초투_max;
        if (live.매매가_범위) base['매매가_범위'] = live.매매가_범위;
        if (live.매매가_min) base['매매가_min(억)'] = live.매매가_min;
        if (live.매매가_max) base['매매가_max(억)'] = live.매매가_max;
        if (live.P_범위) base['P_범위'] = live.P_범위;
        if (live.P_min) base['P_min(억)'] = live.P_min;
        if (live.P_max) base['P_max(억)'] = live.P_max;
        if (live.표본건수) base['표본건수'] = live.표본건수;
        if (live.articleNos) base['articleNos'] = live.articleNos;
        base['승인'] = decision;
        base['검수상태'] = decision === 'Y' ? 'ok' : (decision === 'N' ? 'pending' : (base['검수상태'] || 'pending'));
        if (decision === 'Y' && !base['승인일']) {{
          base['승인일'] = new Date().toISOString().slice(0, 10);
        }}
        rows.push(base);
      }});
      return rows;
    }}
    function downloadCsv(filename, rows) {{
      // Excel needs the BOM to read Korean headers from a UTF-8 CSV.
      saveBlob(filename, new Blob(['\\ufeff' + toCsv(rows)], {{ type: 'text/csv;charset=utf-8' }}));
    }}
    document.getElementById('download').addEventListener('click', () => {{
      downloadCsv('매물_review_decisions.csv', collectRows());
    }});
    document.getElementById('download-zones').addEventListener('click', () => {{
      downloadCsv('구역_통합본_승인.csv', collectZoneProposals());
    }});

    restoreFields();
    seedDefaultApprovals();
    refreshAllZoneRollups();
    // restore rollup visual state
    Object.entries(state.zoneRollup || {{}}).forEach(([key, decision]) => {{
      const card = document.querySelector(`[data-zone-rollup="${{CSS.escape(key)}}"]`);
      if (card) {{
        card.classList.toggle('approved', decision === 'Y');
        card.classList.toggle('rejected', decision === 'N');
      }}
    }});
    const startDistrict = state.currentDistrict || FIRST_DISTRICT;
    if (startDistrict) showDistrict(startDistrict);
    if (state.currentZone) showZone(state.currentZone);
    refreshStatuses();
  </script>
</body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Render listing review HTML board.")
    parser.add_argument("--input", type=Path, required=True, help="zone_listing_candidates JSON")
    parser.add_argument("--golden-csv", type=Path, help="Golden CSV for baselines")
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="Max listings per zone on the board (default 5 — cheapest, polygon-confirmed first).",
    )
    parser.add_argument("--output", type=Path)
    parser.add_argument("--open-gap-ms", type=int, default=OPEN_GAP_MS)
    parser.add_argument("--burst-limit", type=int, default=BURST_LIMIT)
    args = parser.parse_args()

    report = load_json(args.input)
    baselines = load_golden_baselines(args.golden_csv)
    rows = build_sheet_rows(report, limit=args.limit, baselines=baselines)
    proposals = build_zone_proposals(rows)
    today = date.today().strftime("%y%m%d")
    out = args.output or Path(f"data/reports/listing_review_{today}.html")
    out.parent.mkdir(parents=True, exist_ok=True)
    prop_csv = out.with_name(f"구역_통합본_{today}.csv")
    write_zone_proposals_csv(proposals, prop_csv)
    from render_zone_rollup_table import render_html as render_rollup_html
    from render_zone_rollup_table import write_xlsx as write_rollup_xlsx

    rollup_html = out.with_name(f"zone_rollup_{today}.html")
    rollup_html.write_text(
        render_rollup_html(proposals, stamp=today, source=prop_csv.name),
        encoding="utf-8",
    )
    (out.with_name(f"구역_통합본_{today}.html")).write_text(rollup_html.read_text(encoding="utf-8"), encoding="utf-8")
    write_rollup_xlsx(proposals, out.with_name(f"zone_rollup_{today}.xlsx"))
    source_mode = str(report.get("sourceMode") or "")
    iso = str(report.get("generatedAt") or "")[:10]
    if len(iso) != 10:
        iso = date.today().isoformat()
    title = f"매물 검수 보드 — {iso}"
    out.write_text(
        render_html(
            rows,
            title=title,
            source_mode=source_mode,
            open_gap_ms=args.open_gap_ms,
            burst_limit=args.burst_limit,
            proposals=proposals,
        ),
        encoding="utf-8",
    )
    districts = len(group_by_district_zone(rows))
    uri = out.resolve().as_uri()
    print(
        f"wrote html={out.as_posix()} districts={districts} "
        f"zones={len(group_rows(rows))} rows={len(rows)} "
        f"proposals={len(proposals)} → {prop_csv.as_posix()} mode={source_mode} limit={args.limit}"
    )
    print(f"매물 검수 보드: {uri}")


if __name__ == "__main__":
    main()
