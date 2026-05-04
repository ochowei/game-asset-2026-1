import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Gemstone identity: 4-vertex cut-diamond outline (top, mid-right, bottom-point,
// mid-left) with two internal facet chords from top → mid-side. Aligned to the
// `lucide:gem` register — replaces v1.2.0's regular-hexagon-with-radial-spokes,
// which read more like a wheel than a cut gem.
export const gemstone: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const radius = range(rng, size * 0.26, size * 0.32);
  // Vertical elongation: top sits ~0.85·r above centre, bottom point ~1.15·r below.
  const topY = centerY - radius * 0.85;
  const bottomY = centerY + radius * 1.15;
  const sideY = centerY - radius * 0.15;
  const sideX = radius * 0.85;
  const top = `${round2(centerX)},${round2(topY)}`;
  const right = `${round2(centerX + sideX)},${round2(sideY)}`;
  const bottom = `${round2(centerX)},${round2(bottomY)}`;
  const left = `${round2(centerX - sideX)},${round2(sideY)}`;
  const body = svgElement('polygon', {
    points: `${top} ${right} ${bottom} ${left}`,
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  // Two facet chords: top vertex → mid-side vertices (the table-to-girdle edges
  // visible in a brilliant cut).
  const facetA = svgElement('line', {
    x1: round2(centerX),
    y1: round2(topY),
    x2: round2(centerX + sideX * 0.6),
    y2: round2(sideY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });
  const facetB = svgElement('line', {
    x1: round2(centerX),
    y1: round2(topY),
    x2: round2(centerX - sideX * 0.6),
    y2: round2(sideY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });
  return svgElement('g', {}, body + facetA + facetB);
};
