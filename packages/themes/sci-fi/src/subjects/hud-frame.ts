import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const hudFrame: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  // Lucide-aligned: longer corner-bracket arms for clearer "framing
   // crosshair" register — `lucide:scan` uses prominent corner ticks.
  const half = range(rng, size * 0.28, size * 0.32);
  const armLen = half * range(rng, 0.55, 0.65);
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'accent') : pickColor(rng, palette, 'primary');

  const corner = (cx: number, cy: number, dx: number, dy: number): string =>
    svgElement('path', {
      d: `M ${round2(cx)} ${round2(cy + dy * armLen)} L ${round2(cx)} ${round2(cy)} L ${round2(cx + dx * armLen)} ${round2(cy)}`,
      fill: 'none',
      stroke,
      'stroke-width': Math.max(2, strokeWidth * 1.4),
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    });

  const tl = corner(centerX - half, centerY - half, +1, +1);
  const tr = corner(centerX + half, centerY - half, -1, +1);
  const bl = corner(centerX - half, centerY + half, +1, -1);
  const br = corner(centerX + half, centerY + half, -1, -1);

  const dot = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(half * 0.12),
    fill,
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.6),
  });

  return svgElement('g', {}, tl + tr + bl + br + dot);
};
