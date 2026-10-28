#!/usr/bin/env python3
"""검수 보드 승인 JSON → frontend/lib/hexafit/attributes.ts"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "frontend/lib/hexafit/attributes.ts"

BOOLS = (
    "highEndBrand",
    "hardwareSpec",
    "newTownPlan",
    "stationArea",
    "doubleStation",
    "hanRiverTransit",
    "gtxAccess",
    "parkWaterfront",
    "mallAdjacent",
    "hospitalAdjacent",
    "schoolOnSite",
)


def compact(flags: dict) -> dict:
    keep = {}
    han = flags.get("viewHan") or flags.get("view")
    if han in ("hanRiverFull", "hanRiverPartial", "hanRiverBelt"):
        keep["viewHan"] = han
    park = flags.get("viewPark")
    if park in ("parkMajor", "parkRiver"):
        keep["viewPark"] = park
    elif flags.get("view") in ("parkMajor", "parkRiver") and "viewHan" not in keep:
        keep["viewPark"] = flags["view"]
    if flags.get("highEndBrand") is True:
        keep["highEndBrand"] = True
    elif flags.get("hardwareSpec") is True:
        keep["hardwareSpec"] = True
    elif flags.get("contractorStandard") is True:
        keep["contractorStandard"] = True
    school = flags.get("schoolDistrict")
    if school in ("core", "wide"):
        keep["schoolDistrict"] = school
    for k in BOOLS:
        if k in ("highEndBrand", "hardwareSpec", "contractorStandard"):
            continue
        if flags.get(k) is True:
            keep[k] = True
    return keep


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("json_path")
    args = p.parse_args()
    rows = json.loads(Path(args.json_path).read_text(encoding="utf-8"))
    hex_text = (ROOT / "frontend/app/lib/hexafitData.ts").read_text(encoding="utf-8")
    core_keys = set()
    for block in re.findall(r"\{[^{}]+\}", hex_text):
        key_m = re.search(r'"naturalKey": "([^"]+)"', block)
        cov_m = re.search(r'"coverage": "(CORE|SUB)"', block)
        if key_m and cov_m and cov_m.group(1) == "CORE":
            core_keys.add(key_m.group(1))
    mapping = {}
    skipped = 0
    skipped_sub = 0
    for row in rows:
        if row.get("approved") is not True:
            skipped += 1
            continue
        if row.get("naturalKey") not in core_keys:
            skipped_sub += 1
            continue
        flags = compact(row.get("flags") or {})
        if flags:
            mapping[row["naturalKey"]] = flags
    print(f"core approved kept={len(mapping)} skipped_unapproved={skipped} skipped_not_core={skipped_sub}")
    body = json.dumps(mapping, ensure_ascii=False, indent=2)
    OUT.write_text(
        """import type { ZoneAttributes } from "./scoring";

/**
 * 2시·4시 운영자 확정 플래그. naturalKey 기준.
 * 검수 보드에서 승인된 값만 넣는다. 비어 있으면 2시=6+급지, 4시=세대수만.
 */
export const HEXAFIT_ATTRIBUTES: Record<string, ZoneAttributes> = """
        + body
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {len(mapping)} zones -> {OUT}")


if __name__ == "__main__":
    main()
