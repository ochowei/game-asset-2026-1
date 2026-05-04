import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Two perpendicular line segments meeting at center forming a "+" — a small
// rune mark or magical inscription on inventory items.
export const runeCross: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const sw = Math.max(1, strokeWidth * 0.6);
  const arm = size * 0.1;

  const horiz = svgElement('line', {
    x1: round2(centerX - arm),
    y1: round2(centerY),
    x2: round2(centerX + arm),
    y2: round2(centerY),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });
  const vert = svgElement('line', {
    x1: round2(centerX),
    y1: round2(centerY - arm),
    x2: round2(centerX),
    y2: round2(centerY + arm),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });

  return svgElement('g', {}, horiz + vert);
};
