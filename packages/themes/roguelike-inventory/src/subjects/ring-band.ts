import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const ringBand: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const bandColor = pickColor(rng, palette, 'primary');
  const stoneColor = pickColor(rng, palette, 'accent');
  const bandR = range(rng, size * 0.20, size * 0.25);
  const settingW = range(rng, size * 0.16, size * 0.22);
  const settingH = range(rng, size * 0.10, size * 0.13);
  const settingY = centerY - bandR;

  const band = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY + size * 0.04),
    r: round2(bandR),
    fill: 'none',
    stroke: bandColor,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
  });
  const setting = svgElement('polygon', {
    points: `${round2(centerX - settingW / 2)},${round2(settingY)} ${round2(centerX + settingW / 2)},${round2(settingY)} ${round2(centerX + settingW * 0.4)},${round2(settingY - settingH)} ${round2(centerX - settingW * 0.4)},${round2(settingY - settingH)}`,
    fill: bandColor,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const stone = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(settingY - settingH * 0.45),
    r: round2(settingH * 0.32),
    fill: stoneColor,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  return svgElement('g', {}, band + setting + stone);
};
