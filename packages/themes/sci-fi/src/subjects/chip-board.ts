import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Chip identity: rectangular body (square or slightly DIP-package proportions)
// with EXACTLY 3 pins on each of 4 sides plus a centre dot. Pin count is fixed
// to lock the canonical IC silhouette across seeds; size + aspect ratio jitter
// give the variation.
const PINS_PER_SIDE = 3;

export const chipBoard: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Wider size + ±15% aspect-ratio jitter so different seeds aren't visually
  // near-identical. Bounds: max halfY = 0.26 * 1.15 * size = 0.299 * size, plus
  // pinLen 0.09 * size = 0.389 * size from centre, well inside [0.1, 0.9].
  const halfX = range(rng, size * 0.18, size * 0.26);
  const halfY = halfX * range(rng, 0.85, 1.15);
  const pinsPerSide = PINS_PER_SIDE;
  const pinLen = range(rng, size * 0.05, size * 0.09);

  const square = svgElement('rect', {
    x: round2(centerX - halfX),
    y: round2(centerY - halfY),
    width: round2(halfX * 2),
    height: round2(halfY * 2),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });

  const pins: string[] = [];
  for (let i = 0; i < pinsPerSide; i++) {
    const t = (i + 1) / (pinsPerSide + 1);
    const alongX = -halfX + halfX * 2 * t;
    const alongY = -halfY + halfY * 2 * t;
    pins.push(line(centerX + alongX, centerY - halfY, centerX + alongX, centerY - halfY - pinLen, stroke, strokeWidth));
    pins.push(line(centerX + alongX, centerY + halfY, centerX + alongX, centerY + halfY + pinLen, stroke, strokeWidth));
    pins.push(line(centerX - halfX, centerY + alongY, centerX - halfX - pinLen, centerY + alongY, stroke, strokeWidth));
    pins.push(line(centerX + halfX, centerY + alongY, centerX + halfX + pinLen, centerY + alongY, stroke, strokeWidth));
  }

  const dot = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(Math.min(halfX, halfY) * 0.18),
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
