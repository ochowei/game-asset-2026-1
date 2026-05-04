import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const wateringCan: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: slightly smaller body so the spout + handle have more
  // visual breathing room and the silhouette feels less blocky.
  const bodyW = range(rng, size * 0.32, size * 0.36);
  const bodyH = range(rng, size * 0.28, size * 0.32);
  const left = centerX - bodyW * 0.4;
  const right = centerX + bodyW * 0.4;
  const top = centerY - bodyH * 0.3;
  const bottom = centerY + bodyH * 0.6;

  const body = svgElement('path', {
    d: `M ${round2(left)} ${round2(top)} L ${round2(right)} ${round2(top)} L ${round2(right + size * 0.05)} ${round2(bottom)} L ${round2(left - size * 0.05)} ${round2(bottom)} Z`,
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  const spout = svgElement('polygon', {
    points: `${round2(right)},${round2(top + size * 0.04)} ${round2(right + size * 0.18)},${round2(top - size * 0.06)} ${round2(right + size * 0.18)},${round2(top + size * 0.02)} ${round2(right + size * 0.02)},${round2(top + size * 0.12)}`,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const handle = svgElement('path', {
    d: `M ${round2(left)} ${round2(top)} Q ${round2(centerX)} ${round2(top - size * 0.18)} ${round2(right)} ${round2(top)}`,
    fill: 'none',
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.2),
    'stroke-linecap': 'round',
  });
  return svgElement('g', {}, body + spout + handle);
};
