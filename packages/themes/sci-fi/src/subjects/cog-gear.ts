import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const cogGear: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const teeth = intRange(rng, 6, 10);
  const outer = range(rng, size * 0.25, size * 0.32);
  const inner = outer * range(rng, 0.78, 0.86);
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const isOuter = i % 2 === 0;
    const radius = isOuter ? outer : inner;
    const a = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    points.push(`${round2(centerX + Math.cos(a) * radius)},${round2(centerY + Math.sin(a) * radius)}`);
  }
  const body = svgElement('polygon', {
    points: points.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const hole = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(outer * 0.3),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  return svgElement('g', {}, body + hole);
};
