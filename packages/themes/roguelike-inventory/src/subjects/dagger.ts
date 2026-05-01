import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const dagger: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bladeLen = range(rng, size * 0.30, size * 0.36);
  const bladeW = range(rng, size * 0.05, size * 0.08);
  const guardW = range(rng, size * 0.16, size * 0.22);
  const guardH = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.07, size * 0.09);
  const pommelR = range(rng, size * 0.035, size * 0.05);

  const tipY = centerY - bladeLen * 0.5;
  const guardY = centerY + bladeLen * 0.45;
  const pommelY = guardY + guardH + gripLen + pommelR;

  const blade = svgElement('polygon', {
    points: `${round2(centerX)},${round2(tipY)} ${round2(centerX + bladeW / 2)},${round2(guardY)} ${round2(centerX - bladeW / 2)},${round2(guardY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: round2(centerX - guardW / 2),
    y: round2(guardY),
    width: round2(guardW),
    height: round2(guardH),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const pommel = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(pommelY),
    r: round2(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  return svgElement('g', {}, blade + guard + pommel);
};
