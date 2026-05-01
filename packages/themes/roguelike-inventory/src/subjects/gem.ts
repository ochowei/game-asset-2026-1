import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const gem: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const w = range(rng, size * 0.4, size * 0.5);
  const h = range(rng, size * 0.5, size * 0.6);
  const tipY = centerY + h * 0.5;
  const shoulderY = centerY - h * 0.15;
  const topY = centerY - h * 0.5;

  const points = [
    [centerX, topY],
    [centerX + w / 2, shoulderY],
    [centerX + w / 4, tipY - h * 0.05],
    [centerX, tipY],
    [centerX - w / 4, tipY - h * 0.05],
    [centerX - w / 2, shoulderY],
  ];
  const polyPts = points.map(([x, y]) => `${round2(x!)},${round2(y!)}`).join(' ');
  const facetA = svgElement('line', {
    x1: round2(centerX - w / 2),
    y1: round2(shoulderY),
    x2: round2(centerX + w / 2),
    y2: round2(shoulderY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
    'stroke-linecap': 'round',
  });
  const facetB = svgElement('line', {
    x1: round2(centerX),
    y1: round2(topY),
    x2: round2(centerX),
    y2: round2(tipY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.5),
    'stroke-linecap': 'round',
  });
  const body = svgElement('polygon', {
    points: polyPts,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  return svgElement('g', {}, body + facetA + facetB);
};
