import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const key: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const bowR = range(rng, size * 0.09, size * 0.12);
  const shaftLen = range(rng, size * 0.28, size * 0.36);
  const bowX = centerX - shaftLen / 2 - bowR * 0.5;
  const tipX = bowX + shaftLen;
  const toothW = range(rng, size * 0.06, size * 0.08);
  const toothH = range(rng, size * 0.08, size * 0.12);

  const bow = svgElement('circle', {
    cx: round2(bowX),
    cy: round2(centerY),
    r: round2(bowR),
    fill,
    stroke,
    'stroke-width': strokeWidth,
  });
  const shaft = svgElement('line', {
    x1: round2(bowX + bowR),
    y1: round2(centerY),
    x2: round2(tipX),
    y2: round2(centerY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });
  const tooth1 = svgElement('rect', {
    x: round2(tipX - toothW),
    y: round2(centerY),
    width: round2(toothW),
    height: round2(toothH),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const tooth2 = svgElement('rect', {
    x: round2(tipX - toothW * 2.5),
    y: round2(centerY),
    width: round2(toothW * 0.7),
    height: round2(toothH * 0.7),
    fill: stroke,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });

  return svgElement('g', {}, shaft + tooth1 + tooth2 + bow);
};
