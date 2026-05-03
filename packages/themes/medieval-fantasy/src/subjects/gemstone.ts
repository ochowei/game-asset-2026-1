import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Gemstone identity: regular hexagonal body with internal radial facet lines.
// Sides fixed at 6 (was variable 5-7) so the canonical "cut gem" silhouette
// reads consistently across seeds.
const HEX_SIDES = 6;

export const gemstone: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const facets = HEX_SIDES;
  const radius = range(rng, size * 0.24, size * 0.30);
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
    'stroke-width': Math.max(2, strokeWidth * 1.4),
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
