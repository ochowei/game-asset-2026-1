import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const potionBottle: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: tall slim flask body with a pinched neck and small cork —
  // matches the `lucide:flask-round` register (D&D-style potion).
  const bodyRX = range(rng, size * 0.18, size * 0.21);
  const bodyRY = range(rng, size * 0.20, size * 0.24);
  const bodyCY = centerY + size * 0.12;
  // Narrow neck (~33% of body width) is the affordance hint that says
  // "bottle" rather than "vase" or "jar". Tall neck so the body→neck→cork
  // stack reads as a flask rather than a ball with a stopper.
  const neckW = range(rng, size * 0.06, size * 0.08);
  const neckH = range(rng, size * 0.18, size * 0.22);
  const neckTopY = bodyCY - bodyRY - neckH;
  const corkH = range(rng, size * 0.04, size * 0.06);

  const body = svgElement('ellipse', {
    cx: round2(centerX),
    cy: round2(bodyCY),
    rx: round2(bodyRX),
    ry: round2(bodyRY),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
  });
  const neck = svgElement('rect', {
    x: round2(centerX - neckW / 2),
    y: round2(neckTopY),
    width: round2(neckW),
    height: round2(neckH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const cork = svgElement('rect', {
    x: round2(centerX - neckW * 0.6),
    y: round2(neckTopY - corkH),
    width: round2(neckW * 1.2),
    height: round2(corkH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, body + neck + cork);
};
