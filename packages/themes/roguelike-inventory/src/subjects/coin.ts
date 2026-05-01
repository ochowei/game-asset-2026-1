import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const coin: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const outer = range(rng, size * 0.26, size * 0.32);
  const inner = outer * range(rng, 0.78, 0.85);
  const sides = intRange(rng, 4, 6);
  const glyphR = inner * 0.6;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + (i / sides) * Math.PI * 2;
    points.push(`${round2(centerX + Math.cos(a) * glyphR)},${round2(centerY + Math.sin(a) * glyphR)}`);
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
      'stroke-width': strokeWidth,
    }) +
      svgElement('circle', {
        cx: round2(centerX),
        cy: round2(centerY),
        r: round2(inner),
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
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
