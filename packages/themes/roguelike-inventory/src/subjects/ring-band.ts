import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Ring identity: open band (hollow circle) topped by a clearly visible gem
// setting. Stone size is enlarged from the v1.1 baseline so the "ring with
// jewel" silhouette reads at small sizes (was r ~ 0.04 of canvas, now ~ 0.06).
export const ringBand: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const bandColor = pickColor(rng, palette, 'primary');
  const stoneColor = pickColor(rng, palette, 'accent');
  const bandR = range(rng, size * 0.21, size * 0.24);
  const settingW = range(rng, size * 0.18, size * 0.22);
  const settingH = range(rng, size * 0.11, size * 0.14);
  const settingY = centerY - bandR;
  const stoneR = size * 0.06;

  const band = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY + size * 0.05),
    r: round2(bandR),
    fill: 'none',
    stroke: bandColor,
    'stroke-width': Math.max(3, strokeWidth * 1.6),
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
    cy: round2(settingY - settingH * 0.6),
    r: round2(stoneR),
    fill: stoneColor,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.8),
  });
  return svgElement('g', {}, band + setting + stone);
};
