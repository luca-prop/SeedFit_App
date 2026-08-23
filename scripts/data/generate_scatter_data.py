#!/usr/bin/env python3
"""Rebuild frontend/app/lib/scatterData.ts from the current Golden SoT."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GOLDEN = ROOT / "data/normalized/golden_samples260823.normalized.json"
OUT = ROOT / "frontend/app/lib/scatterData.ts"


def map_stage(stage: str) -> float:
    s = stage.replace(" ", "")
    if any(k in s for k in ("관리처분",)):
        return 6.1
    if any(k in s for k in ("사업시행인가",)):
        return 5.1
    if any(k in s for k in ("시공사", "건축심의")):
        return 4.1
    if any(k in s for k in ("조합설립",)):
        return 3.1
    if any(k in s for k in ("사업시행자지정",)):
        return 3.0
    if any(k in s for k in ("추진위",)):
        return 2.2
    if any(k in s for k in ("구역지정", "관리계획고시")):
        return 2.1
    if any(k in s for k in ("통합심의",)):
        return 1.2
    return 1.0


def map_tier(min_krw: int) -> str:
    eok = min_krw / 100_000_000
    if eok < 3:
        return "T1"
    if eok < 5:
        return "T2"
    if eok < 10:
        return "T3"
    return "T4"


def to_eok(krw: int | None) -> float:
    if krw is None:
        return 0.0
    value = krw / 100_000_000
    return round(value, 4) if abs(value - round(value, 2)) > 1e-9 else round(value, 2)


def main() -> None:
    raw = json.loads(GOLDEN.read_text(encoding="utf-8"))
    zone_by_key = {z["naturalKey"]: z for z in raw["zones"]}
    rows: list[dict] = []
    for snap in raw["zoneInvestmentSnapshots"]:
        zone = zone_by_key.get(snap["zoneNaturalKey"])
        if not zone or snap.get("investmentMinKrw") is None:
            continue
        lo = to_eok(snap["investmentMinKrw"])
        hi = to_eok(snap.get("investmentMaxKrw") or snap["investmentMinKrw"])
        rows.append(
            {
                "id": zone["zoneName"],
                "name": zone["zoneName"],
                "district": zone["district"],
                "tier": map_tier(snap["investmentMinKrw"]),
                "stage": map_stage(zone["stage"]),
                "stageStr": zone["stage"],
                "coverage": zone.get("coverage") or "CORE",
                "investmentMin": lo,
                "investmentMax": hi,
            }
        )
    rows.sort(key=lambda r: (r["district"], r["name"]))
    OUT.write_text(
        "export const scatterData = "
        + json.dumps(rows, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT.relative_to(ROOT)} n={len(rows)}")


if __name__ == "__main__":
    main()
