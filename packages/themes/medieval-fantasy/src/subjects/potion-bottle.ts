import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const potionBottle: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyRX = range(rng, size * 0.18, size * 0.24);
  const bodyRY = range(rng, size * 0.16, size * 0.22);
  const bodyCY = centerY + size * 0.12;
  const neckW = range(rng, size * 0.08, size * 0.12);
  const neckH = range(rng, size * 0.12, size * 0.18);
  const neckTopY = bodyCY - bodyRY - neckH;
  const corkH = range(rng, size * 0.05, size * 0.08);

  const body = svgElement('ellipse', {
    cx: r(centerX),
    cy: r(bodyCY),
    rx: r(bodyRX),
    ry: r(bodyRY),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const neck = svgElement('rect', {
    x: r(centerX - neckW / 2),
    y: r(neckTopY),
    width: r(neckW),
    height: r(neckH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const cork = svgElement('rect', {
    x: r(centerX - neckW * 0.6),
    y: r(neckTopY - corkH),
    width: r(neckW * 1.2),
    height: r(corkH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, body + neck + cork);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
