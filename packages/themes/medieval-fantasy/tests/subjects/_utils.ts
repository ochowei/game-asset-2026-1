import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'mf-test',
  primary: ['#aa3322'],
  secondary: ['#33aa44'],
  accent: ['#ffcc00'],
  neutral: ['#111111'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

export function countCoordsInBounds(svg: string, lo: number, hi: number): { ok: number; bad: number } {
  let ok = 0;
  let bad = 0;
  // Match coordinate-bearing attribute values: cx="…", cy="…", x="…", y="…",
  // x1="…" x2="…" y1="…" y2="…", r="…", points="x,y x,y …", d="M x y L x y …"
  const numRe = /-?\d+(?:\.\d+)?/g;
  for (const match of svg.matchAll(/(?:cx|cy|x|y|x1|x2|y1|y2|width|height|r)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  for (const match of svg.matchAll(/(?:points|d)="([^"]+)"/g)) {
    for (const n of match[1]!.matchAll(numRe)) {
      const v = parseFloat(n[0]);
      if (Number.isNaN(v)) continue;
      if (v >= lo && v <= hi) ok++;
      else bad++;
    }
  }
  return { ok, bad };
}
