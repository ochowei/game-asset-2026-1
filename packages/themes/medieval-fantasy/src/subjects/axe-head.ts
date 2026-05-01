import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const axeHead: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const haftLen = range(rng, size * 0.55, size * 0.7);
  const haftTop = centerY - haftLen / 2;
  const haftBottom = centerY + haftLen / 2;
  const bladeY = centerY - range(rng, size * 0.05, size * 0.1);
  const bladeOuter = centerX + range(rng, size * 0.18, size * 0.28);
  const bladeBack = centerX + range(rng, size * 0.05, size * 0.08);
  const bladeTopY = bladeY - range(rng, size * 0.12, size * 0.18);
  const bladeBottomY = bladeY + range(rng, size * 0.12, size * 0.18);

  const haft = svgElement('line', {
    x1: round2(centerX),
    y1: round2(haftTop),
    x2: round2(centerX),
    y2: round2(haftBottom),
    stroke: pickColor(rng, palette, 'secondary'),
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linecap': 'round',
  });
  const blade = svgElement('polygon', {
    points: `${round2(bladeBack)},${round2(bladeTopY)} ${round2(bladeOuter)},${round2(bladeY)} ${round2(bladeBack)},${round2(bladeBottomY)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, haft + blade);
};
