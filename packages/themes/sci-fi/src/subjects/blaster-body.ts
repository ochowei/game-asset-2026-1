import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const blasterBody: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.32, size * 0.4);
  const bodyH = range(rng, size * 0.16, size * 0.22);
  const bodyX = centerX - bodyW / 2;
  const bodyY = centerY - bodyH / 2;
  const barrelW = range(rng, size * 0.14, size * 0.18);
  const barrelH = range(rng, size * 0.05, size * 0.08);
  const gripW = range(rng, size * 0.1, size * 0.14);
  const gripH = range(rng, size * 0.18, size * 0.24);

  const body = svgElement('path', {
    d: `M ${round2(bodyX)} ${round2(bodyY)}
        L ${round2(bodyX + bodyW * 0.85)} ${round2(bodyY)}
        L ${round2(bodyX + bodyW)} ${round2(bodyY + bodyH * 0.5)}
        L ${round2(bodyX + bodyW)} ${round2(bodyY + bodyH)}
        L ${round2(bodyX)} ${round2(bodyY + bodyH)} Z`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
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
