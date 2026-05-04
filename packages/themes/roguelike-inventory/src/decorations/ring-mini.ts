import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// A small circle outline (stroke-only) — a lens, ring, or magical aura
// indicator on inventory items.
export const ringMini: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const sw = Math.max(1, strokeWidth * 0.7);
  const r = size * 0.1;

  return svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(r),
    fill: 'none',
    stroke,
    'stroke-width': sw,
  });
};
