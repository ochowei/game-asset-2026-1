import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const blasterBody: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.34, size * 0.38);
  const bodyH = range(rng, size * 0.17, size * 0.21);
  const bodyX = centerX - bodyW / 2;
  const bodyY = centerY - bodyH / 2;
  const barrelW = range(rng, size * 0.15, size * 0.18);
  const barrelH = range(rng, size * 0.06, size * 0.08);
  const gripW = range(rng, size * 0.11, size * 0.13);
  const gripH = range(rng, size * 0.19, size * 0.23);

  const body = svgElement('path', {
    d: `M ${round2(bodyX)} ${round2(bodyY)}
        L ${round2(bodyX + bodyW * 0.85)} ${round2(bodyY)}
        L ${round2(bodyX + bodyW)} ${round2(bodyY + bodyH * 0.5)}
        L ${round2(bodyX + bodyW)} ${round2(bodyY + bodyH)}
        L ${round2(bodyX)} ${round2(bodyY + bodyH)} Z`,
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  const barrel = svgElement('rect', {
    x: round2(bodyX + bodyW),
    y: round2(centerY - barrelH / 2),
    width: round2(barrelW),
    height: round2(barrelH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const grip = svgElement('rect', {
    x: round2(bodyX + bodyW * 0.2),
    y: round2(bodyY + bodyH),
    width: round2(gripW),
    height: round2(gripH),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, body + barrel + grip);
};
