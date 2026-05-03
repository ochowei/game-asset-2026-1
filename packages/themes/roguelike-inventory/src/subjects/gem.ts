import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Gem identity: faceted angular body with INTERNAL FACET LINES radiating from
// the centre to each vertex. The radial-facet pattern is the visual hook that
// distinguishes a gem from a simple polygon (or coin/ring). Always 4 radial
// lines + 1 horizontal shoulder line, fixed regardless of seed.
export const gem: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const w = range(rng, size * 0.42, size * 0.48);
  const h = range(rng, size * 0.52, size * 0.58);
  const tipY = centerY + h * 0.5;
  const shoulderY = centerY - h * 0.15;
  const topY = centerY - h * 0.5;

  const vertices: Array<[number, number]> = [
    [centerX, topY],
    [centerX + w / 2, shoulderY],
    [centerX + w / 4, tipY - h * 0.05],
    [centerX, tipY],
    [centerX - w / 4, tipY - h * 0.05],
    [centerX - w / 2, shoulderY],
  ];
  const polyPts = vertices.map(([x, y]) => `${round2(x)},${round2(y)}`).join(' ');
  const body = svgElement('polygon', {
    points: polyPts,
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.5),
    'stroke-linejoin': 'round',
  });
  // Horizontal shoulder line — separates crown facets from pavilion facets.
  const shoulder = svgElement('line', {
    x1: round2(centerX - w / 2),
    y1: round2(shoulderY),
    x2: round2(centerX + w / 2),
    y2: round2(shoulderY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.6),
    'stroke-linecap': 'round',
  });
  // Radial facet lines from gem centre to top, two shoulders, and tip.
  const radials = [vertices[0]!, vertices[1]!, vertices[3]!, vertices[5]!]
    .map(([x, y]) =>
      svgElement('line', {
        x1: round2(centerX),
        y1: round2(centerY),
        x2: round2(x),
        y2: round2(y),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.5),
        'stroke-linecap': 'round',
      }),
    )
    .join('');
  return svgElement('g', {}, body + shoulder + radials);
};
