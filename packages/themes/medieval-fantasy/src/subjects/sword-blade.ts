import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const swordBlade: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bladeLen = range(rng, size * 0.45, size * 0.5);
  const bladeWidth = range(rng, size * 0.06, size * 0.12);
  const guardWidth = range(rng, size * 0.22, size * 0.32);
  const guardHeight = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.08, size * 0.1);
  const pommelR = range(rng, size * 0.025, size * 0.035);

  const tipY = centerY - bladeLen * 0.55;
  const guardY = centerY + bladeLen * 0.45;
  const gripBottomY = guardY + gripLen;
  const pommelY = gripBottomY + pommelR;

  const blade = svgElement('polygon', {
    points: `${round2(centerX)},${round2(tipY)} ${round2(centerX + bladeWidth / 2)},${round2(guardY)} ${round2(centerX - bladeWidth / 2)},${round2(guardY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: round2(centerX - guardWidth / 2),
    y: round2(guardY),
    width: round2(guardWidth),
    height: round2(guardHeight),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const grip = svgElement('line', {
    x1: round2(centerX),
    y1: round2(guardY + guardHeight),
    x2: round2(centerX),
    y2: round2(gripBottomY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.5),
    'stroke-linecap': 'round',
  });
  const pommel = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(pommelY),
    r: round2(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, blade + guard + grip + pommel);
};
