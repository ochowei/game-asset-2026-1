import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const scrollRoll: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bodyW = range(rng, size * 0.45, size * 0.55);
  const bodyH = range(rng, size * 0.18, size * 0.26);
  const capR = bodyH * 0.5;
  const leftX = centerX - bodyW / 2;
  const rightX = centerX + bodyW / 2;

  const body = svgElement('rect', {
    x: r(leftX),
    y: r(centerY - bodyH / 2),
    width: r(bodyW),
    height: r(bodyH),
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const leftCap = svgElement('ellipse', {
    cx: r(leftX),
    cy: r(centerY),
    rx: r(capR * 0.5),
    ry: r(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });
  const rightCap = svgElement('ellipse', {
    cx: r(rightX),
    cy: r(centerY),
    rx: r(capR * 0.5),
    ry: r(capR),
    fill: pickColor(rng, palette, 'secondary'),
    stroke,
    'stroke-width': strokeWidth,
  });

  return svgElement('g', {}, body + leftCap + rightCap);
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
