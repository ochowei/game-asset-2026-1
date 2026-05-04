import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const hoeTool: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const handleColor = pickColor(rng, palette, 'secondary');
  const bladeColor = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');

  // Lucide-aligned: longer handle (tool register favours a long thin shaft
  // with a small head — `lucide:shovel`).
  const handleAngle = -Math.PI / 4 + range(rng, -0.08, 0.08);
  const handleLen = range(rng, size * 0.52, size * 0.58);
  const x1 = centerX - Math.cos(handleAngle) * handleLen / 2;
  const y1 = centerY - Math.sin(handleAngle) * handleLen / 2;
  const x2 = centerX + Math.cos(handleAngle) * handleLen / 2;
  const y2 = centerY + Math.sin(handleAngle) * handleLen / 2;

  const bladeW = range(rng, size * 0.13, size * 0.16);
  const bladeH = range(rng, size * 0.10, size * 0.12);
  const bx = x2;
  const by = y2;

  const handle = svgElement('line', {
    x1: round2(x1),
    y1: round2(y1),
    x2: round2(x2),
    y2: round2(y2),
    stroke: handleColor,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });
  const blade = svgElement('polygon', {
    points: `${round2(bx)},${round2(by - bladeH / 2)} ${round2(bx + bladeW)},${round2(by - bladeH * 0.2)} ${round2(bx + bladeW)},${round2(by + bladeH * 0.6)} ${round2(bx)},${round2(by + bladeH / 2)}`,
    fill: bladeColor,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, handle + blade);
};
