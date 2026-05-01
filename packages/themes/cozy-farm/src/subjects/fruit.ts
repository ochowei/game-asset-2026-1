import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const fruit: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const body = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const leafColor = pickColor(rng, palette, 'secondary');
  const radius = range(rng, size * 0.22, size * 0.26);
  const stemLen = range(rng, size * 0.06, size * 0.1);
  const stemTopY = centerY - radius - stemLen;
  const leafW = range(rng, size * 0.1, size * 0.14);
  const leafH = range(rng, size * 0.06, size * 0.08);

  const bodyCircle = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY + radius * 0.05),
    r: round2(radius),
    fill: body,
    stroke,
    'stroke-width': strokeWidth,
  });
  const stem = svgElement('line', {
    x1: round2(centerX),
    y1: round2(centerY - radius),
    x2: round2(centerX),
    y2: round2(stemTopY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.1),
    'stroke-linecap': 'round',
  });
  const leaf = svgElement('polygon', {
    points: `${round2(centerX)},${round2(stemTopY)} ${round2(centerX + leafW)},${round2(stemTopY - leafH * 0.4)} ${round2(centerX + leafW * 0.3)},${round2(stemTopY + leafH * 0.6)}`,
    fill: leafColor,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, bodyCircle + stem + leaf);
};
