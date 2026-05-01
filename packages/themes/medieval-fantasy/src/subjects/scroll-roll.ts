import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const scrollRoll: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.45, size * 0.55);
  const bodyH = range(rng, size * 0.18, size * 0.26);
  const capR = bodyH * 0.5;
  const leftX = centerX - bodyW / 2;
  const rightX = centerX + bodyW / 2;

  const body = svgElement('rect', {
    x: round2(leftX),
    y: round2(centerY - bodyH / 2),
    width: round2(bodyW),
    height: round2(bodyH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const leftCap = svgElement('ellipse', {
    cx: round2(leftX),
    cy: round2(centerY),
    rx: round2(capR * 0.5),
    ry: round2(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });
  const rightCap = svgElement('ellipse', {
    cx: round2(rightX),
    cy: round2(centerY),
    rx: round2(capR * 0.5),
    ry: round2(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, body + leftCap + rightCap);
};
