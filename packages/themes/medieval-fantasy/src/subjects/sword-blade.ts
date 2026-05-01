import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const swordBlade: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bladeLen = range(rng, size * 0.45, size * 0.6);
  const bladeWidth = range(rng, size * 0.06, size * 0.12);
  const guardWidth = range(rng, size * 0.22, size * 0.32);
  const guardHeight = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.1, size * 0.16);
  const pommelR = range(rng, size * 0.04, size * 0.06);

  const tipY = centerY - bladeLen * 0.55;
  const guardY = centerY + bladeLen * 0.45;
  const gripBottomY = guardY + gripLen;
  const pommelY = gripBottomY + pommelR;

  const blade = svgElement('polygon', {
    points: `${r(centerX)},${r(tipY)} ${r(centerX + bladeWidth / 2)},${r(guardY)} ${r(centerX - bladeWidth / 2)},${r(guardY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: r(centerX - guardWidth / 2),
    y: r(guardY),
    width: r(guardWidth),
    height: r(guardHeight),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const grip = svgElement('line', {
    x1: r(centerX),
    y1: r(guardY + guardHeight),
    x2: r(centerX),
    y2: r(gripBottomY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.5),
    'stroke-linecap': 'round',
  });
  const pommel = svgElement('circle', {
    cx: r(centerX),
    cy: r(pommelY),
    r: r(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, blade + guard + grip + pommel);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
