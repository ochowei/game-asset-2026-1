import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Coin identity: round body with a centred 5-pointed star.
// Star is fixed (always 5 points) so the icon reads unambiguously as a coin
// regardless of seed, distinguishing it from `gem` (angular body with internal
// facet lines) and `cog-gear` (toothed perimeter).
const STAR_POINTS = 5;

export const coin: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: slightly tighter coin so the outer ring stays crisp at
  // 16/32 px — `lucide:circle-dot` register.
  const outer = range(rng, size * 0.27, size * 0.31);
  const inner = outer * range(rng, 0.80, 0.86);
  const starOuterR = inner * 0.68;
  const starInnerR = starOuterR * 0.40;
  const points: string[] = [];
  for (let i = 0; i < STAR_POINTS * 2; i++) {
    const a = -Math.PI / 2 + (i / (STAR_POINTS * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? starOuterR : starInnerR;
    points.push(`${round2(centerX + Math.cos(a) * r)},${round2(centerY + Math.sin(a) * r)}`);
  }
  return svgElement(
    'g',
    {},
    svgElement('circle', {
      cx: round2(centerX),
      cy: round2(centerY),
      r: round2(outer),
      fill,
      stroke,
      'stroke-width': Math.max(2, strokeWidth * 1.5),
    }) +
      svgElement('circle', {
        cx: round2(centerX),
        cy: round2(centerY),
        r: round2(inner),
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
      }) +
      svgElement('polygon', {
        points: points.join(' '),
        fill: stroke,
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
        'stroke-linejoin': 'round',
      }),
  );
};
