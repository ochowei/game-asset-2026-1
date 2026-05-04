import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// A small ellipse (rotated ~30 degrees) with a short stem line attached to
// one end — a leafy sprig motif for cozy / botanical icons.
export const leafSprig: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.secondary);
  const sw = Math.max(1, strokeWidth * 0.5);
  const rx = size * 0.1;
  const ry = size * 0.06;
  const stemLen = size * 0.1;
  const angleDeg = 30;
  const angleRad = (angleDeg * Math.PI) / 180;

  const ellipse = svgElement('ellipse', {
    cx: round2(centerX),
    cy: round2(centerY),
    rx: round2(rx),
    ry: round2(ry),
    fill,
    stroke,
    'stroke-width': sw,
    transform: `rotate(${angleDeg} ${round2(centerX)} ${round2(centerY)})`,
  });

  // Stem extends from the "lower-left" tip of the rotated ellipse, away from center.
  const tipX = centerX - Math.cos(angleRad) * rx;
  const tipY = centerY - Math.sin(angleRad) * rx;
  const endX = tipX - Math.cos(angleRad) * stemLen;
  const endY = tipY - Math.sin(angleRad) * stemLen;
  const stem = svgElement('line', {
    x1: round2(tipX),
    y1: round2(tipY),
    x2: round2(endX),
    y2: round2(endY),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });

  return svgElement('g', {}, ellipse + stem);
};
