#!/usr/bin/env python3
"""재개발닷컴 진행단계 파싱·SeedFit 단계 매핑 공용 로직."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

MAP_PATH = Path(__file__).resolve().parents[2] / "data" / "reference" / "jaegebal_stage_map.json"

STAGE_DATE_RE = re.compile(
    r"^(?P<label>.+?)\s*\((?P<date>\d{4}\.\d{2}\.\d{2})\)\s*$"
)
URL_ID_RE = re.compile(r"jaegebal\.com/develops/(\d+)", re.I)


def load_stage_map(path: Path | None = None) -> dict[str, Any]:
    target = path or MAP_PATH
    return json.loads(target.read_text(encoding="utf-8"))


def compact_label(value: str) -> str:
    return re.sub(r"\s+", "", value or "")


def parse_stage_meta_text(raw: str) -> dict[str, str | None]:
    """Parse DOM text like '대상지선정 (2026.05.07)'."""
    text = (raw or "").strip()
    match = STAGE_DATE_RE.match(text)
    if match:
        return {
            "raw": text,
            "label": match.group("label").strip(),
            "date": match.group("date"),
        }
    return {"raw": text or None, "label": text or None, "date": None}


def develop_id_from_url(url: str) -> str | None:
    match = URL_ID_RE.search(url or "")
    return match.group(1) if match else None


def detect_project_kind(badge_text: str | None, map_data: dict[str, Any] | None = None) -> str:
    data = map_data or load_stage_map()
    hay = compact_label(badge_text or "")
    keywords = data.get("project_kind_keywords") or {}
    for kind in ("moa", "rebuild", "sintong"):
        for word in keywords.get(kind) or []:
            if compact_label(word) in hay:
                return kind
    return "common"


def canonicalize_jaegebal_label(label: str | None, map_data: dict[str, Any] | None = None) -> str | None:
    if not label:
        return None
    data = map_data or load_stage_map()
    key = compact_label(label)
    aliases: dict[str, str] = data.get("aliases") or {}
    return aliases.get(key) or aliases.get(label) or key


def map_to_seedfit_stage(
    jaegebal_label: str | None,
    *,
    project_kind: str = "common",
    map_data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = map_data or load_stage_map()
    canon = canonicalize_jaegebal_label(jaegebal_label, data)
    if not canon:
        return {
            "canonical": None,
            "seedfitStage": None,
            "status": "empty",
            "message": "empty_jaegebal_label",
        }

    needs_review = set(data.get("unmapped_needs_review") or [])
    if canon in needs_review:
        return {
            "canonical": canon,
            "seedfitStage": None,
            "status": "needs_review",
            "message": f"unmapped_label:{canon}",
        }

    table: dict[str, dict[str, str]] = data.get("to_seedfit") or {}
    row = table.get(canon)
    if not row:
        return {
            "canonical": canon,
            "seedfitStage": None,
            "status": "unknown",
            "message": f"unknown_label:{canon}",
        }

    stage = row.get(project_kind) or row.get("common")
    if not stage:
        return {
            "canonical": canon,
            "seedfitStage": None,
            "status": "needs_review",
            "message": f"no_mapping_for_kind:{canon}:{project_kind}",
        }
    return {
        "canonical": canon,
        "seedfitStage": stage,
        "status": "ok",
        "message": None,
    }


def stages_equivalent(a: str | None, b: str | None) -> bool:
    if not a and not b:
        return True
    if not a or not b:
        return False
    return compact_label(a) == compact_label(b)
