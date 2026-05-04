import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Two perpendicular short line segments forming an L at one of 4 corners.
// Reads as a manuscript corner flourish or shield-edge ornament.
export const cornerL: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const sw = Math.max(1, strokeWidth * 0.6);
  const arm = size * 0.16;
  const corner = Math.floor(rng() * 4);
  // 0 = top-left, 1 = top-right, 2 = bottom-right, 3 = bottom-left
  const dx = corner === 1 || corner === 2 ? 1 : -1;
  const dy = corner === 2 || corner === 3 ? 1 : -1;

  // Corner anchor sits a hair away from center so the L reads as a corner mark.
  const ax = centerX + dx * arm * 0.5;
  const ay = centerY + dy * arm * 0.5;

  const horiz = svgElement('line', {
    x1: round2(ax),
    y1: round2(ay),
    x2: round2(ax - dx * arm),
    y2: round2(ay),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });
  const vert = svgElement('line', {
    x1: round2(ax),
    y1: round2(ay),
    x2: round2(ax),
    y2: round2(ay - dy * arm),
    stroke,
    'stroke-width': sw,
    'stroke-linecap': 'round',
  });

  return svgElement('g', {}, horiz + vert);
};
