#!/usr/bin/env python3
"""2시·4시 플래그 검수 보드."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/app/lib/hexafitData.ts"
OUT = ROOT / "data/reports/hexafit_flags_261024.html"

AREA_INDEX = {
    "압구정": 1.0, "반포": 1.1, "잠원": 1.2, "대치": 1.4, "삼성": 1.5, "도곡": 1.5,
    "서초": 1.6, "여의도": 1.6, "한강로": 1.6, "이태원": 1.6, "성수": 1.6,
    "잠실": 1.7, "역삼": 1.7, "개포": 1.7, "신천": 1.8, "방배": 1.8, "일원": 1.9,
    "수서": 2.1, "흑석": 2.2, "가락": 2.2, "방이": 2.2, "둔촌": 2.2,
    "마포": 2.3, "옥수": 2.3, "노량진": 2.3, "과천": 2.3, "염리": 2.3,
    "광장": 2.4, "자양": 2.4, "문정": 2.4, "아현": 2.4, "금호": 2.4, "공덕": 2.4, "후암": 2.4,
    "왕십리": 2.5, "구의": 2.5, "사당": 2.5, "수내": 2.5, "정자": 2.5, "대흥": 2.5, "신수": 2.5, "서계": 2.5, "청파": 2.5,
    "고덕": 2.6, "북아현": 2.6, "당산": 2.6, "자곡": 2.6, "서현": 2.6, "명일": 2.6, "대방": 2.6,
    "상도": 2.7, "신당": 2.7, "신길": 2.8, "거여": 2.8, "마천": 2.8, "청량리": 2.9,
    "마곡": 3.0, "암사": 3.0, "신도림": 3.1, "전농": 3.1, "답십리": 3.1, "신정": 3.2, "천호": 3.2,
    "이문": 3.3, "철산": 3.3, "제기": 3.3,
    "길음": 3.4, "보문": 3.4, "염창": 3.4, "가양": 3.4, "가재울": 3.4, "월계": 3.4, "신월곡": 3.4, "하월곡": 3.4,
    "봉천": 3.5, "홍제": 3.5, "광운대": 3.5, "산성": 3.5, "광명": 3.5, "수지": 3.5, "장위": 3.5, "방화": 3.5, "미아": 3.5, "수진": 3.5, "신흥": 3.5,
    "상암": 3.6, "신림": 3.6, "녹번": 3.6, "중화": 3.6,
    "덕은": 3.7, "상봉": 3.7, "불광": 3.7, "대조": 3.7, "수택": 3.7, "독산": 3.7,
    "연신내": 3.8, "갈현": 4.0,
}
OVERRIDES = {"용산구|이촌동|이촌1구역(재건축)": 2.3}
EST = {
    "중곡": 2.8, "용두": 2.8, "사근": 2.6, "용답": 2.9, "행당": 2.5, "용산": 2.0, "원효로": 2.2,
}
NEWTOWN_DONG = ("아현", "장위", "노량진", "거여", "마천", "흑석")
SCHOOL_CORE = ("대치", "목동", "중계")
SCHOOL_WIDE = ("광장", "명일", "수내", "정자", "반포", "방배", "잠실")


def token(dong: str) -> str:
    return re.sub(r"동$", "", re.sub(r"\d+가$", "", dong))


def tier_index(z: dict):
    key = z.get("naturalKey")
    if key in OVERRIDES:
        return OVERRIDES[key]
    t = token(z.get("dong") or "")
    if t in AREA_INDEX:
        return AREA_INDEX[t]
    return EST.get(t)


def parse_zones() -> list[dict]:
    text = SRC.read_text(encoding="utf-8")
    rows = []
    for block in re.findall(r"\{[^{}]+\}", text):
        if '"naturalKey"' not in block:
            continue
        row = {}
        for k in (
            "naturalKey", "zoneName", "district", "dong", "stage", "coverage",
            "minInvestmentBillion", "supplyUnits",
        ):
            m = re.search(rf'"{k}": (null|"[^"]*"|[0-9.]+)', block)
            if not m:
                continue
            v = m.group(1)
            if v == "null":
                row[k] = None
            elif v.startswith('"'):
                row[k] = v[1:-1]
            else:
                row[k] = float(v) if "." in v else int(v)
        if "naturalKey" in row:
            rows.append(row)
    return rows


def hint(z: dict) -> str:
    bits = []
    blob = f"{z.get('zoneName','')} {z.get('dong','')}"
    if "모아" in blob or "뉴타운" in blob:
        bits.append("뉴타운 이름 후보")
    if any(d in (z.get("dong") or "") for d in NEWTOWN_DONG):
        bits.append("뉴타운 동 후보")
    dong = z.get("dong") or ""
    if any(s in dong for s in SCHOOL_CORE):
        bits.append("핵심학군 후보")
    elif any(s in dong for s in SCHOOL_WIDE):
        bits.append("범학군 후보")
    return " · ".join(bits)


def main() -> None:
    payload = []
    for z in parse_zones():
        payload.append({
            **z,
            "tierIndex": tier_index(z),
            "approved": False,
            "hint": hint(z),
            "flags": {
                "view": "",
                "viewHan": "",
                "viewPark": "",
                "highEndBrand": False,
                "hardwareSpec": False,
                "contractorStandard": False,
                "newTownPlan": False,
                "stationArea": False,
                "doubleStation": False,
                "hanRiverTransit": False,
                "gtxAccess": False,
                "parkWaterfront": False,
                "mallAdjacent": False,
                "hospitalAdjacent": False,
                "schoolDistrict": "",
                "schoolOnSite": False,
            },
        })
    OUT.write_text(TEMPLATE.replace("__ZONES__", json.dumps(payload, ensure_ascii=False)), encoding="utf-8")
    core = sum(1 for z in payload if z.get("coverage") == "CORE")
    sub = sum(1 for z in payload if z.get("coverage") == "SUB")
    print(f"zones={len(payload)} core={core} sub={sub} -> {OUT}")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>육각형 2시·4시 플래그 검수 — 2026-10-24</title>
  <style>
    :root { --bg:#f3efe6; --ink:#1c1914; --muted:#6a6258; --card:#fffdf8; --line:#d9d0c2; --accent:#0f5c4c; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:"Pretendard","Noto Sans KR",sans-serif; background:linear-gradient(180deg,#f7f2e8,var(--bg)); color:var(--ink); }
    header.app { position:sticky; top:0; z-index:8; display:flex; gap:1rem; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:rgba(255,253,248,.94); border-bottom:1px solid var(--line); }
    h1 { margin:0; font-size:1.08rem; }
    header p { margin:.2rem 0 0; color:var(--muted); font-size:.82rem; }
    .actions { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; }
    button.primary { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:.55rem .95rem; font-weight:700; cursor:pointer; }
    button.ghost, select { background:#fff; border:1px solid var(--line); border-radius:8px; padding:.45rem .7rem; font-weight:600; }
    main { max-width:1360px; margin:0 auto; padding:1rem 1.1rem 3rem; }
    .note { background:#eef6f3; border:1px solid #b7d4c8; border-radius:12px; padding:.8rem 1rem; margin-bottom:1rem; font-size:.86rem; }
    table { width:100%; border-collapse:collapse; background:var(--card); border:1px solid var(--line); }
    th, td { border-bottom:1px solid var(--line); padding:.4rem .35rem; vertical-align:top; font-size:.76rem; text-align:left; }
    th { background:#f6f1e6; position:sticky; top:70px; }
    tr.ok { background:#eef7f0; }
    .meta,.hint { color:var(--muted); font-size:.7rem; }
    .hint { color:#8a4b12; }
    .score { font-weight:800; color:var(--accent); white-space:nowrap; }
    label.chk { display:inline-flex; align-items:center; gap:.15rem; white-space:nowrap; margin-right:.25rem; }
    select.slim { padding:.2rem .3rem; font-weight:500; max-width:8.2rem; }
  </style>
</head>
<body>
<header class="app">
  <div>
    <h1>육각형 2시·4시 플래그 검수 — 2026-10-24</h1>
    <p>이어서 할 일은 아직 승인하지 않은 CORE의 2시·4시입니다. 승인 63곳은 저장돼 있고, 미승인만 켜면 목록에서 접힙니다.</p>
  </div>
  <div class="actions">
    <span id="stat"></span>
    <select id="district"><option value="">전체 구</option></select>
    <label class="chk"><input type="checkbox" id="coreFirst" checked /> 저장분 + CORE</label>
    <label class="chk"><input type="checkbox" id="pendingOnly" checked /> 미승인만</label>
    <button class="ghost" id="saveBtn" type="button">이 기기에 임시저장</button>
    <button class="primary" id="packBtn" type="button">작업 파일 저장</button>
    <button class="ghost" id="importBtn" type="button">작업 파일 불러오기</button>
    <input id="importFile" type="file" accept="application/json,.json" hidden />
  </div>
</header>
<main>
  <div class="note">
    2시 = min(10, 6 + 조망 + 급지 + 고급화). 한강: 영구 2 / 부분 1 / 벨트 0.5. 공원: 메이저 0.5 / 일반·하천 0.3. 한강영구면 공원은 더하지 않음.
    급지 1~2.1 +1, 2.2~2.7 +0.5, 2.8 +0.2, 2.9 이상은 0. 시공사는 세대수로 나누지 않음. 하이엔드 1.5 / 1군+특화 0.8 / 1군 표준 0.4 / 그 외 0.<br/>
    4시 = min(10, min(6.5, 세대+뉴타운) + 교통 + 생활 + 학군 + 초품아).
    교통은 역세권, 중심·더블역세권, 한강교통, GTX를 합산. 생활도 합산. 학군은 핵심 1 / 범학군 0.5 중 하나. 초품아 0.3.
  </div>
  <table>
    <thead>
      <tr>
        <th>승인</th><th>구역</th><th>2시 조망</th><th>2시 고급화</th>
        <th>4시 뉴타운·교통</th><th>4시 생활</th><th>4시 학군</th><th>미리보기</th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
</main>
<script>
const KEY = "sf_hexafit_flags_261024c";
const ZONES = __ZONES__;
const saved = JSON.parse(localStorage.getItem(KEY) || "null");
if (saved && Array.isArray(saved) && saved.length === ZONES.length) {
  saved.forEach((s, i) => { ZONES[i].approved = s.approved; ZONES[i].flags = s.flags; });
}
ZONES.forEach(z => migrateFlags(z.flags));
const distSel = document.getElementById("district");
[...new Set(ZONES.map(z => z.district))].sort().forEach(d => {
  const o = document.createElement("option"); o.value = d; o.textContent = d; distSel.appendChild(o);
});

function tierBonus(idx) {
  if (idx == null) return 0;
  if (idx <= 2.1) return 1;
  if (idx <= 2.7) return 0.5;
  if (idx <= 2.8) return 0.2;
  return 0;
}
function baseScale(u) {
  if (u == null) return null;
  if (u >= 5000) return 6.5;
  if (u >= 3000) return 6.0;
  if (u >= 2000) return 5.5;
  if (u >= 1000) return 5.3;
  if (u >= 500) return 5.0;
  if (u >= 300) return 4.0;
  return 3.0;
}
function r1(n) { return Math.round(n * 10) / 10; }
function migrateFlags(f) {
  if (!f.viewHan && f.view) {
    if (f.view === "hanRiverFull" || f.view === "hanRiverPartial" || f.view === "hanRiverBelt") f.viewHan = f.view;
    else if (f.view === "parkMajor" || f.view === "parkRiver") f.viewPark = f.view;
  }
  if (f.viewHan == null) f.viewHan = "";
  if (f.viewPark == null) f.viewPark = "";
  if (f.doubleStation == null) f.doubleStation = false;
}
function score2(z) {
  migrateFlags(z.flags);
  let s = 6 + tierBonus(z.tierIndex);
  const han = z.flags.viewHan;
  if (han === "hanRiverFull") s += 2;
  else if (han === "hanRiverPartial") s += 1;
  else if (han === "hanRiverBelt") s += 0.5;
  if (han !== "hanRiverFull") {
    if (z.flags.viewPark === "parkMajor") s += 0.5;
    else if (z.flags.viewPark === "parkRiver") s += 0.3;
  }
  if (z.flags.highEndBrand) s += 1.5;
  else if (z.flags.hardwareSpec) s += 0.8;
  else if (z.flags.contractorStandard) s += 0.4;
  return r1(Math.min(10, s));
}
function score4(z) {
  const base = baseScale(z.supplyUnits);
  if (base == null) return null;
  let mass = z.flags.newTownPlan ? Math.min(6.5, base + 1) : base;
  const f = z.flags;
  let extra = 0;
  if (f.stationArea) extra += 1;
  if (f.doubleStation) extra += 0.3;
  if (f.hanRiverTransit) extra += 0.5;
  if (f.gtxAccess) extra += 0.3;
  if (f.parkWaterfront) extra += 0.3;
  if (f.mallAdjacent) extra += 0.3;
  if (f.hospitalAdjacent) extra += 0.2;
  if (f.schoolDistrict === "core") extra += 1;
  else if (f.schoolDistrict === "wide") extra += 0.5;
  if (f.schoolOnSite) extra += 0.3;
  return r1(Math.min(10, mass + extra));
}

function rowHtml(z, i) {
  const f = z.flags;
  const units = z.supplyUnits == null ? "세대 없음" : z.supplyUnits.toLocaleString() + "세대";
  const tb = tierBonus(z.tierIndex);
  const s4 = score4(z);
  return `<tr class="${z.approved ? "ok" : ""}" data-i="${i}">
    <td><label class="chk"><input type="checkbox" data-k="approved" ${z.approved ? "checked" : ""}/> Y</label></td>
    <td><strong>${z.zoneName}</strong>
      <div class="meta">${z.district} ${z.dong} · ${z.stage} · ${units} · 급지 ${z.tierIndex ?? "미지정"}${tb ? " +" + tb : ""}</div>
      ${z.hint ? `<div class="hint">${z.hint}</div>` : ""}</td>
    <td>
      <select class="slim" data-k="viewHan">
        <option value="" ${!f.viewHan?"selected":""}>한강 없음</option>
        <option value="hanRiverBelt" ${f.viewHan==="hanRiverBelt"?"selected":""}>벨트 +0.5</option>
        <option value="hanRiverPartial" ${f.viewHan==="hanRiverPartial"?"selected":""}>부분조망 +1</option>
        <option value="hanRiverFull" ${f.viewHan==="hanRiverFull"?"selected":""}>영구 +2</option>
      </select>
      <select class="slim" data-k="viewPark" ${f.viewHan==="hanRiverFull"?"disabled":""}>
        <option value="" ${!f.viewPark?"selected":""}>공원 없음</option>
        <option value="parkRiver" ${f.viewPark==="parkRiver"?"selected":""}>일반·하천 +0.3</option>
        <option value="parkMajor" ${f.viewPark==="parkMajor"?"selected":""}>메이저공원 +0.5</option>
      </select>
    </td>
    <td><select class="slim" data-k="premium">
      <option value="" ${!f.highEndBrand && !f.hardwareSpec && !f.contractorStandard?"selected":""}>2·3군·미정 +0</option>
      <option value="standard" ${f.contractorStandard?"selected":""}>1군 표준 +0.4</option>
      <option value="hardware" ${!f.highEndBrand && f.hardwareSpec?"selected":""}>1군+특화 +0.8</option>
      <option value="highEnd" ${f.highEndBrand?"selected":""}>하이엔드 +1.5</option>
    </select></td>
    <td>
      <label class="chk"><input type="checkbox" data-k="newTownPlan" ${f.newTownPlan?"checked":""}/> 뉴타운</label>
      <label class="chk"><input type="checkbox" data-k="stationArea" ${f.stationArea?"checked":""}/> 역세권</label>
      <label class="chk"><input type="checkbox" data-k="doubleStation" ${f.doubleStation?"checked":""}/> 중심·더블</label>
      <label class="chk"><input type="checkbox" data-k="hanRiverTransit" ${f.hanRiverTransit?"checked":""}/> 한강교통</label>
      <label class="chk"><input type="checkbox" data-k="gtxAccess" ${f.gtxAccess?"checked":""}/> GTX</label>
    </td>
    <td>
      <label class="chk"><input type="checkbox" data-k="parkWaterfront" ${f.parkWaterfront?"checked":""}/> 공원·강</label>
      <label class="chk"><input type="checkbox" data-k="mallAdjacent" ${f.mallAdjacent?"checked":""}/> 몰</label>
      <label class="chk"><input type="checkbox" data-k="hospitalAdjacent" ${f.hospitalAdjacent?"checked":""}/> 병원</label>
    </td>
    <td>
      <select class="slim" data-k="schoolDistrict">
        <option value="" ${f.schoolDistrict===""?"selected":""}>학군 없음</option>
        <option value="wide" ${f.schoolDistrict==="wide"?"selected":""}>범학군 +0.5</option>
        <option value="core" ${f.schoolDistrict==="core"?"selected":""}>대치·목동·중계 +1</option>
      </select>
      <label class="chk"><input type="checkbox" data-k="schoolOnSite" ${f.schoolOnSite?"checked":""}/> 초품아</label>
    </td>
    <td class="score">2시 ${score2(z)}<br/>4시 ${s4 == null ? "—" : s4}</td>
  </tr>`;
}

function touched(z) {
  if (z.approved) return true;
  const f = z.flags || {};
  return !!(f.viewHan || f.viewPark || f.view || f.highEndBrand || f.hardwareSpec || f.contractorStandard
    || f.newTownPlan || f.stationArea || f.doubleStation || f.hanRiverTransit || f.gtxAccess
    || f.parkWaterfront || f.mallAdjacent || f.hospitalAdjacent
    || f.schoolDistrict || f.schoolOnSite);
}
function persist() {
  localStorage.setItem(KEY, JSON.stringify(ZONES.map(z => ({ approved: z.approved, flags: z.flags }))));
  const approved = ZONES.filter(z => z.approved).length;
  const leftCore = ZONES.filter(z => z.coverage === "CORE" && !z.approved).length;
  document.getElementById("stat").textContent = `승인 ${approved} · 남은 CORE ${leftCore}`;
}
function render() {
  const dist = distSel.value;
  const pending = document.getElementById("pendingOnly").checked;
  const coreFirst = document.getElementById("coreFirst").checked;
  document.getElementById("tbody").innerHTML = ZONES.map((z, i) => ({z, i}))
    .filter(({z}) => (!dist || z.district === dist) && (!pending || !z.approved)
      && (!coreFirst || z.coverage !== "SUB" || touched(z)))
    .map(({z, i}) => rowHtml(z, i)).join("");
  persist();
}
function applyPremium(z, v) {
  z.flags.highEndBrand = v === "highEnd";
  z.flags.hardwareSpec = v === "hardware";
  z.flags.contractorStandard = v === "standard";
}
document.getElementById("tbody").addEventListener("change", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const z = ZONES[+tr.dataset.i];
  const k = e.target.dataset.k;
  if (k === "approved") z.approved = e.target.checked;
  else if (k === "viewHan" || k === "viewPark" || k === "schoolDistrict") z.flags[k] = e.target.value;
  else if (k === "premium") applyPremium(z, e.target.value);
  else z.flags[k] = e.target.checked;
  const i = +tr.dataset.i;
  tr.outerHTML = rowHtml(z, i);
  persist();
});
distSel.addEventListener("change", render);
document.getElementById("pendingOnly").addEventListener("change", render);
function packRows() {
  return ZONES.map(z => ({
    naturalKey: z.naturalKey,
    zoneName: z.zoneName,
    approved: !!z.approved,
    flags: z.flags,
  }));
}
function savePack() {
  persist();
  const text = JSON.stringify(packRows(), null, 2);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], {type: "application/json"}));
  a.download = "hexafit_flags_work_261024.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function applyPack(rows) {
  const by = new Map(rows.filter(r => r && r.naturalKey).map(r => [r.naturalKey, r]));
  let n = 0;
  for (const z of ZONES) {
    const row = by.get(z.naturalKey);
    if (!row) continue;
    n += 1;
    if (typeof row.approved === "boolean") z.approved = row.approved;
    else z.approved = true;
    if (row.flags) z.flags = Object.assign({}, z.flags, row.flags);
    migrateFlags(z.flags);
  }
  render();
  return n;
}
document.getElementById("saveBtn").addEventListener("click", () => { persist(); alert("이 기기에만 저장했습니다. PC로 옮기려면 작업 파일 저장을 누르세요."); });
document.getElementById("packBtn").addEventListener("click", () => savePack());
document.getElementById("coreFirst").addEventListener("change", render);
document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const rows = JSON.parse(await file.text());
  if (!Array.isArray(rows)) { alert("작업 파일 형식이 아닙니다."); return; }
  const n = applyPack(rows);
  alert(n + "곳을 불러왔습니다. 승인 " + ZONES.filter(z => z.approved).length + "곳.");
});
render();
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
