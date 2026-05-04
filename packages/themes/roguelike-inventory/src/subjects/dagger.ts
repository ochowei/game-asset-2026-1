import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const dagger: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: longer thinner blade + smaller pommel — same register
  // shift as `sword-blade` but at dagger scale.
  const bladeLen = range(rng, size * 0.36, size * 0.40);
  const bladeW = range(rng, size * 0.05, size * 0.07);
  const guardW = range(rng, size * 0.16, size * 0.20);
  const guardH = Math.max(2, size * 0.04);
  const gripLen = range(rng, size * 0.06, size * 0.08);
  const pommelR = range(rng, size * 0.03, size * 0.04);

  const tipY = centerY - bladeLen * 0.5;
  const guardY = centerY + bladeLen * 0.45;
  const pommelY = guardY + guardH + gripLen + pommelR;

  const blade = svgElement('polygon', {
    points: `${round2(centerX)},${round2(tipY)} ${round2(centerX + bladeW / 2)},${round2(guardY)} ${round2(centerX - bladeW / 2)},${round2(guardY)}`,
    fill,
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.4),
    'stroke-linejoin': 'round',
  });
  const guard = svgElement('rect', {
    x: round2(centerX - guardW / 2),
    y: round2(guardY),
    width: round2(guardW),
    height: round2(guardH),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  // Grip line connects guard to pommel — without it the pommel "floats"
  // detached from the blade, breaking the dagger silhouette.
  const grip = svgElement('line', {
    x1: round2(centerX),
    y1: round2(guardY + guardH),
    x2: round2(centerX),
    y2: round2(pommelY - pommelR),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.1),
    'stroke-linecap': 'round',
  });
  const pommel = svgElement('circle', {
    cx: round2(centerX),
    cy: round2(pommelY),
    r: round2(pommelR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  return svgElement('g', {}, blade + guard + grip + pommel);
};
