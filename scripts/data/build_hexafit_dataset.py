#!/usr/bin/env python3
"""육각형 비교(HexaFit) 화면용 정적 데이터셋 생성.

스캐터 화면(scatterData.ts)과 동일하게, 커밋되는 정적 데이터셋을 만든다.
6축 입력을 SoT에서 머지한다:
  - seed_mvp_data.sql: zones(naturalKey/stage) + 실투자금 min/max
    → DB 시드와 동일한 최신값(성수 1~4 포함).
  - data/reference/dong_benchmark_84.json: Golden 시트1 행정동별 84타입 기축 시세.
    59타입 Naver 시세는 이 화면 가격으로 쓰지 않는다.
  - jaegebal_households json: 공급/조합원/일반분양 세대수 (status=ok 만)

출력: frontend/app/lib/hexafitData.ts
세대수나 실투자금이 없으면 null로 둔다(추정 금지). 급지는 프런트 scoring 모듈이 산출.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEED_SQL = ROOT / "data/seed/seed_mvp_data.sql"
HOUSEHOLDS = ROOT / "data/reports/jaegebal_households_261023.json"
DONG_BENCHMARK = ROOT / "data/reference/dong_benchmark_84.json"
OUT = ROOT / "frontend/app/lib/hexafitData.ts"

EOK = 100_000_000  # 1억 KRW


def _split_tuple(body: str) -> list[str]:
    """최상위 콤마로 분할(따옴표/괄호 내부는 보존)."""
    out, cur, depth, q = [], [], 0, False
    i = 0
    while i < len(body):
        c = body[i]
        if q:
            cur.append(c)
            if c == "'":
                if i + 1 < len(body) and body[i + 1] == "'":
                    cur.append("'")
                    i += 2
                    continue
                q = False
        elif c == "'":
            q = True
            cur.append(c)
        elif c == "(":
            depth += 1
            cur.append(c)
        elif c == ")":
            depth -= 1
            cur.append(c)
        elif c == "," and depth == 0:
            out.append("".join(cur).strip())
            cur = []
        else:
            cur.append(c)
        i += 1
    if cur:
        out.append("".join(cur).strip())
    return out


def _unquote(v: str):
    v = v.strip()
    if v.upper() == "NULL":
        return None
    # strip ::type cast
    v = re.sub(r"::[a-zA-Z_ ]+$", "", v).strip()
    if v.startswith("'") and v.endswith("'"):
        return v[1:-1].replace("''", "'")
    return v


def _rows(table: str, text: str) -> list[list]:
    rows = []
    for m in re.finditer(
        r"INSERT INTO " + table + r"\s*\([^)]*\)\s*VALUES\s*\(", text
    ):
        start = m.end()
        # find matching close paren of the VALUES tuple
        depth, q, i = 1, False, start
        while i < len(text) and depth > 0:
            c = text[i]
            if q:
                if c == "'":
                    if i + 1 < len(text) and text[i + 1] == "'":
                        i += 2
                        continue
                    q = False
            elif c == "'":
                q = True
            elif c == "(":
                depth += 1
            elif c == ")":
                depth -= 1
            i += 1
        body = text[start : i - 1]
        rows.append([_unquote(x) for x in _split_tuple(body)])
    return rows


def _to_billion(krw) -> float | None:
    if krw is None:
        return None
    return round(int(krw) / EOK, 2)


def parse_seed() -> dict[str, dict]:
    text = SEED_SQL.read_text(encoding="utf-8")
    # zones: id, district, dong, zone_name, stage, coverage, ...
    zone_by_id = {}
    for r in _rows("zones", text):
        zid, district, dong, zone_name, stage, coverage = r[0], r[1], r[2], r[3], r[4], r[5]
        nk = f"{district}|{dong}|{zone_name}"
        zone_by_id[zid] = {
            "naturalKey": nk,
            "zoneName": zone_name,
            "district": district,
            "dong": dong,
            "stage": stage,
            "coverage": coverage,
            "minInvestmentBillion": None,
            "maxInvestmentBillion": None,
            "benchmarkName": None,
            "benchmarkPriceBillion": None,
            "_benchPriority": None,
        }
    # investment snapshots: id, zone_id, sale_min, sale_max, inv_min, inv_max, ...
    for r in _rows("zone_investment_snapshots", text):
        z = zone_by_id.get(r[1])
        if z:
            z["minInvestmentBillion"] = _to_billion(r[4])
            z["maxInvestmentBillion"] = _to_billion(r[5])
    # reference apartments: id, name, district, dong, area, price, ...
    apt = {}
    for r in _rows("reference_apartments", text):
        apt[r[0]] = {"name": r[1], "price": _to_billion(r[5])}
    # zone_reference_apartments: id, zone_id, ref_apt_id, priority, reason
    for r in _rows("zone_reference_apartments", text):
        z = zone_by_id.get(r[1])
        a = apt.get(r[2])
        if not z or not a:
            continue
        pr = int(r[3]) if r[3] is not None else 99
        if z["_benchPriority"] is None or pr < z["_benchPriority"]:
            z["_benchPriority"] = pr
            z["benchmarkName"] = a["name"]
            z["benchmarkPriceBillion"] = a["price"]
    return {z["naturalKey"]: z for z in zone_by_id.values()}


def apply_dong_benchmark(zones: dict[str, dict]) -> None:
    """기축 이름·가격을 시트1 84타입으로 덮는다. 없는 동은 59타입 가격을 비운다."""
    doc = json.loads(DONG_BENCHMARK.read_text(encoding="utf-8"))
    by_dong = doc.get("byDong") or {}
    for zone in zones.values():
        hit = by_dong.get(zone["dong"])
        if not hit:
            zone["benchmarkPriceBillion"] = None
            continue
        zone["benchmarkName"] = hit["name"]
        zone["benchmarkPriceBillion"] = hit["priceEok"]


def main() -> None:
    zones = parse_seed()
    apply_dong_benchmark(zones)
    households_doc = json.loads(HOUSEHOLDS.read_text(encoding="utf-8"))
    households = {
        h["zoneNaturalKey"]: h
        for h in households_doc["zones"]
        if h.get("status") == "ok"
    }

    out_rows = []
    missing_invest = []
    for nk, z in zones.items():
        zone_name = z["zoneName"]
        hh = households.get(nk)
        if z["minInvestmentBillion"] is None:
            missing_invest.append(zone_name)

        row = {
            "naturalKey": nk,
            "zoneName": zone_name,
            "district": z["district"],
            "dong": z["dong"],
            "stage": z["stage"],
            "coverage": z.get("coverage"),
            "minInvestmentBillion": z["minInvestmentBillion"],
            "maxInvestmentBillion": z["maxInvestmentBillion"],
            "supplyUnits": hh.get("supplyUnits") if hh else None,
            "memberUnits": hh.get("memberUnits") if hh else None,
            "generalUnits": hh.get("generalSaleUnits") if hh else None,
            "memberEstimated": bool(hh.get("memberEstimated")) if hh else False,
            "benchmarkName": z["benchmarkName"],
            "benchmarkPriceBillion": z["benchmarkPriceBillion"],
        }
        out_rows.append(row)

    scored_hh = sum(1 for r in out_rows if r["supplyUnits"])
    header = (
        "// AUTO-GENERATED by scripts/data/build_hexafit_dataset.py — 직접 수정 금지.\n"
        "// SoT: seed 실투자금 + 시트1 84타입 기축시세 + jaegebal_households(세대수).\n"
        f"// zones={len(out_rows)}, 세대수 보유={scored_hh}, 실투자금 결측={len(missing_invest)}\n\n"
        "export type HexafitZoneInput = {\n"
        "  naturalKey: string;\n"
        "  zoneName: string;\n"
        "  district: string;\n"
        "  dong: string;\n"
        "  stage: string;\n"
        "  coverage: string | null;\n"
        "  minInvestmentBillion: number | null;\n"
        "  maxInvestmentBillion: number | null;\n"
        "  supplyUnits: number | null;\n"
        "  memberUnits: number | null;\n"
        "  generalUnits: number | null;\n"
        "  memberEstimated: boolean;\n"
        "  benchmarkName: string | null;\n"
        "  benchmarkPriceBillion: number | null;\n"
        "};\n\n"
        "export const hexafitZones: HexafitZoneInput[] = "
    )
    body = json.dumps(out_rows, ensure_ascii=False, indent=2)
    OUT.write_text(header + body + ";\n", encoding="utf-8")

    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  zones={len(out_rows)} 세대수보유={scored_hh} 실투자금결측={len(missing_invest)}")
    if missing_invest:
        print("  실투자금 결측:", ", ".join(missing_invest[:10]))


if __name__ == "__main__":
    main()
