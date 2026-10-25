/** 육각형 비교 검색. 공백을 뺀 뒤 포함 여부로 맞춘다. "금호21"과 "금호 21"이 같은 구역을 찾는다. */
export function compactSearchText(value: string): string {
  return value.replace(/\s+/g, "");
}

export function zoneMatchesQuery(
  zone: { zoneName: string; district: string; dong: string },
  query: string,
): boolean {
  const needle = compactSearchText(query.trim());
  if (!needle) return true;
  return [zone.zoneName, zone.district, zone.dong].some((field) =>
    compactSearchText(field).includes(needle),
  );
}
