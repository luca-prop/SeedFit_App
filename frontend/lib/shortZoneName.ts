/**
 * Scatter / chart short names.
 *
 * 자양1동·자양2동을 자양1동779처럼 붙이지 않는다. 지번 앞은 반드시 띄운다.
 * 모아타운·건대모아는 (모아)만 남긴다.
 */
export function shortZoneName(name: string): string {
  if (!name) return "";

  let s = name.trim();
  const hasMoa = /모아타운|건대모아|\(모아\)/.test(s);

  s = s.replace(/건대모아/g, "");
  s = s.replace(/모아타운/g, "");
  s = s.replace(/\(모아\)/g, "");

  // 자양2동 649 → 자양2 649, 자양4동 A → 자양4 A
  s = s.replace(/(\d)동(?=\s|[A-Za-z(])/g, "$1");
  // 자양동 772-1 → 자양 772-1
  s = s.replace(/동(?=\s+\d)/g, "");

  s = s.replace(/\s*구역.*$/, "");
  s = s.replace(/\(\s*\)/g, "");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s+\(/g, "(");

  if (hasMoa) {
    s = `${s} (모아)`;
  }

  return s;
}
