import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const animalHead: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const radius = range(rng, size * 0.23, size * 0.27);
  const earBase = radius * 0.6;
  const earTip = radius * range(rng, 1.05, 1.15);

  const face = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY + size * 0.04),
    r: round2(radius),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
  });
  const leftEar = svgElement('polygon', {
    points: `${round2(centerX - radius * 0.7)},${round2(centerY - radius * 0.6)} ${round2(centerX - earBase)},${round2(centerY - earTip)} ${round2(centerX - radius * 0.3)},${round2(centerY - radius * 0.5)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const rightEar = svgElement('polygon', {
    points: `${round2(centerX + radius * 0.7)},${round2(centerY - radius * 0.6)} ${round2(centerX + earBase)},${round2(centerY - earTip)} ${round2(centerX + radius * 0.3)},${round2(centerY - radius * 0.5)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const eye = (cx: number) =>
    svgElement('circle', {
      cx: round2(cx),
      cy: round2(centerY),
      r: round2(size * 0.025),
      fill: stroke,
      stroke,
      'stroke-width': 1,
    });
  const snout = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY + radius * 0.4),
    r: round2(size * 0.04),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.6),
  });

  return svgElement('g', {}, leftEar + rightEar + face + eye(centerX - radius * 0.35) + eye(centerX + radius * 0.35) + snout);
};
