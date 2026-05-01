import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const energyOrb: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const outerR = range(rng, size * 0.22, size * 0.28);
  const innerR = outerR * range(rng, 0.45, 0.65);
  const rays = intRange(rng, 4, 8);
  const rayInner = outerR * 1.05;
  const rayOuter = outerR * range(rng, 1.25, 1.4);

  const ringOuter = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(outerR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const ringInner = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(innerR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  const rayLines: string[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    rayLines.push(
      svgElement('line', {
        x1: round2(centerX + Math.cos(a) * rayInner),
        y1: round2(centerY + Math.sin(a) * rayInner),
        x2: round2(centerX + Math.cos(a) * rayOuter),
        y2: round2(centerY + Math.sin(a) * rayOuter),
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linecap': 'round',
      }),
    );
  }
  return svgElement('g', {}, ringOuter + ringInner + rayLines.join(''));
};
