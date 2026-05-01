import { makeRng } from '@procforge/core';
import { definePalette } from '@procforge/core';

export const palette = definePalette({
  id: 'rl-test',
  primary: ['#7d4f50'],
  secondary: ['#557c63'],
  accent: ['#f7b801'],
  neutral: ['#181a1f'],
});

export const ctx = (seed: string) => ({
  rng: makeRng(seed),
  palette,
  size: 64,
  centerX: 32,
  centerY: 32,
  strokeWidth: 3,
});

const NUM = '-?\\d+(?:\\.\\d+)?';

function attr(tag: string, attrSrc: string, name: string): number | undefined {
  const m = new RegExp(`\\b${name}="(${NUM})"`).exec(attrSrc);
  if (!m) return undefined;
  const v = parseFloat(m[1]!);
  return Number.isNaN(v) ? undefined : v;
}

function fail(msg: string, lo: number, hi: number, size: number): never {
  throw new Error(`${msg} outside [${lo}, ${hi}] for size=${size}`);
}

export function assertCoordsInBounds(svg: string, size: number): void {
  const lo = size * 0.1;
  const hi = size * 0.9;

  for (const m of svg.matchAll(/<rect\b([^>]*)>/g)) {
    const a = m[1]!;
    const x = attr('rect', a, 'x');
    const y = attr('rect', a, 'y');
    const w = attr('rect', a, 'width');
    const h = attr('rect', a, 'height');
    if (x === undefined || y === undefined || w === undefined || h === undefined) continue;
    if (x < lo || y < lo || x + w > hi || y + h > hi) {
      fail(`rect bbox (${x}, ${y}, ${x + w}, ${y + h})`, lo, hi, size);
    }
  }

  for (const m of svg.matchAll(/<circle\b([^>]*)\/?>/g)) {
    const a = m[1]!;
    const cx = attr('circle', a, 'cx');
    const cy = attr('circle', a, 'cy');
    const r = attr('circle', a, 'r');
    if (cx === undefined || cy === undefined || r === undefined) continue;
    if (cx - r < lo || cx + r > hi || cy - r < lo || cy + r > hi) {
      fail(`circle bbox (${cx - r}, ${cy - r}, ${cx + r}, ${cy + r})`, lo, hi, size);
    }
  }

  for (const m of svg.matchAll(/<ellipse\b([^>]*)\/?>/g)) {
    const a = m[1]!;
    const cx = attr('ellipse', a, 'cx');
    const cy = attr('ellipse', a, 'cy');
    const rx = attr('ellipse', a, 'rx');
    const ry = attr('ellipse', a, 'ry');
    if (cx === undefined || cy === undefined || rx === undefined || ry === undefined) continue;
    if (cx - rx < lo || cx + rx > hi || cy - ry < lo || cy + ry > hi) {
      fail(`ellipse bbox (${cx - rx}, ${cy - ry}, ${cx + rx}, ${cy + ry})`, lo, hi, size);
    }
  }

  for (const m of svg.matchAll(/<line\b([^>]*)\/?>/g)) {
    const a = m[1]!;
    const x1 = attr('line', a, 'x1');
    const y1 = attr('line', a, 'y1');
    const x2 = attr('line', a, 'x2');
    const y2 = attr('line', a, 'y2');
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) continue;
    for (const [x, y] of [[x1, y1], [x2, y2]] as const) {
      if (x < lo || x > hi || y < lo || y > hi) {
        fail(`line endpoint (${x}, ${y})`, lo, hi, size);
      }
    }
  }

  for (const m of svg.matchAll(/<polygon\b[^>]*\bpoints="([^"]+)"/g)) {
    const pts = m[1]!.trim().split(/\s+/);
    for (const p of pts) {
      const [xs, ys] = p.split(',');
      if (xs === undefined || ys === undefined) continue;
      const x = parseFloat(xs);
      const y = parseFloat(ys);
      if (Number.isNaN(x) || Number.isNaN(y)) continue;
      if (x < lo || x > hi || y < lo || y > hi) {
        fail(`polygon point (${x}, ${y})`, lo, hi, size);
      }
    }
  }

  for (const m of svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)) {
    const d = m[1]!;
    const nums: number[] = [];
    for (const n of d.matchAll(new RegExp(NUM, 'g'))) {
      const v = parseFloat(n[0]);
      if (!Number.isNaN(v)) nums.push(v);
    }
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i]!;
      const y = nums[i + 1]!;
      if (x < lo || x > hi || y < lo || y > hi) {
        fail(`path coord (${x}, ${y})`, lo, hi, size);
      }
    }
  }
}
