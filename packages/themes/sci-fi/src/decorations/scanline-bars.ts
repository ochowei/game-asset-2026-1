import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 3 short parallel horizontal line segments stacked vertically — a CRT
// scanline cluster / signal bars decal.
export const scanlineBars: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const sw = Math.max(1, strokeWidth * 0.6);
  const lineLen = size * 0.2;
  const gap = size * 0.06;
  const halfLen = lineLen / 2;

  let body = '';
  for (let i = -1; i <= 1; i++) {
    const y = centerY + i * gap;
    body += svgElement('line', {
      x1: round2(centerX - halfLen),
      y1: round2(y),
      x2: round2(centerX + halfLen),
      y2: round2(y),
      stroke,
      'stroke-width': sw,
      'stroke-linecap': 'round',
    });
  }

  return svgElement('g', {}, body);
};
