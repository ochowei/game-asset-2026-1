import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Chip identity: square body with EXACTLY 3 pins on each of 4 sides (DIP-12
// style) plus a centre dot. Pin count is fixed (was variable 3-4) to lock
// the canonical IC silhouette across seeds.
const PINS_PER_SIDE = 3;

export const chipBoard: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const half = range(rng, size * 0.19, size * 0.23);
  const pinsPerSide = PINS_PER_SIDE;
  const pinLen = range(rng, size * 0.06, size * 0.08);

  const square = svgElement('rect', {
    x: round2(centerX - half),
    y: round2(centerY - half),
    width: round2(half * 2),
    height: round2(half * 2),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });

  const pins: string[] = [];
  for (let i = 0; i < pinsPerSide; i++) {
    const t = (i + 1) / (pinsPerSide + 1);
    const along = -half + half * 2 * t;
    pins.push(line(centerX + along, centerY - half, centerX + along, centerY - half - pinLen, stroke, strokeWidth));
    pins.push(line(centerX + along, centerY + half, centerX + along, centerY + half + pinLen, stroke, strokeWidth));
    pins.push(line(centerX - half, centerY + along, centerX - half - pinLen, centerY + along, stroke, strokeWidth));
    pins.push(line(centerX + half, centerY + along, centerX + half + pinLen, centerY + along, stroke, strokeWidth));
  }

  const dot = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(half * 0.18),
    fill: stroke,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
  });

  return svgElement('g', {}, square + pins.join('') + dot);
};

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, sw: number): string {
  return svgElement('line', {
    x1: round2(x1),
    y1: round2(y1),
    x2: round2(x2),
    y2: round2(y2),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });
}
