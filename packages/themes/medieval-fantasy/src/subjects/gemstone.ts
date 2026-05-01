import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const gemstone: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const facets = intRange(rng, 5, 7);
  const radius = range(rng, size * 0.22, size * 0.32);
  const points: string[] = [];
  const angleOffset = -Math.PI / 2;
  for (let i = 0; i < facets; i++) {
    const a = angleOffset + (i / facets) * Math.PI * 2;
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    points.push(`${round2(x)},${round2(y)}`);
  }
  const body = svgElement('polygon', {
    points: points.join(' '),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const facetCount = facets;
  const facetLines: string[] = [];
  for (let i = 0; i < facetCount; i++) {
    const a = angleOffset + (i / facets) * Math.PI * 2;
    const x = centerX + Math.cos(a) * radius;
    const y = centerY + Math.sin(a) * radius;
    facetLines.push(
      svgElement('line', {
        x1: round2(centerX),
        y1: round2(centerY),
        x2: round2(x),
        y2: round2(y),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.5),
        'stroke-linecap': 'round',
      }),
    );
  }
  return svgElement('g', {}, body + facetLines.join(''));
};
