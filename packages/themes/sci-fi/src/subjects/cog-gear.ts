import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// Cog identity: 8 teeth around a central hub with a clear axle hole. Teeth
// count is fixed at 8 (was variable 6-10) so the cog always reads as a
// canonical mechanical gear, not as an "irregular spiky polygon".
const TEETH = 8;

export const cogGear: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: slightly larger gear, smaller axle hole — matches the
  // mechanical-gear register (notched teeth + thin axle, not a wheel hub).
  const teeth = TEETH;
  const outer = range(rng, size * 0.27, size * 0.32);
  const inner = outer * range(rng, 0.78, 0.84);
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const isOuter = i % 2 === 0;
    const radius = isOuter ? outer : inner;
    const a = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    points.push(`${round2(centerX + Math.cos(a) * radius)},${round2(centerY + Math.sin(a) * radius)}`);
  }
  const body = svgElement('polygon', {
    points: points.join(' '),
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  const hole = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(outer * 0.26),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
  });
  return svgElement('g', {}, body + hole);
};
