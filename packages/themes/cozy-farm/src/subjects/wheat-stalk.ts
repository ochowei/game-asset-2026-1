import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const wheatStalk: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const grainColor = pickColor(rng, palette, 'accent');
  const stalkLen = range(rng, size * 0.5, size * 0.6);
  const top = centerY - stalkLen / 2;
  const bottom = centerY + stalkLen / 2;
  const grains = intRange(rng, 4, 6);
  const grainRX = range(rng, size * 0.05, size * 0.07);
  const grainRY = range(rng, size * 0.06, size * 0.08);

  const stalk = svgElement('line', {
    x1: round2(centerX),
    y1: round2(top),
    x2: round2(centerX),
    y2: round2(bottom),
    stroke: pickColor(rng, palette, 'secondary'),
    'stroke-width': Math.max(2, strokeWidth * 1.1),
    'stroke-linecap': 'round',
  });

  const grainEls: string[] = [];
  for (let i = 0; i < grains; i++) {
    const t = i / Math.max(1, grains - 1);
    const y = top + t * (stalkLen * 0.55);
    const dx = (i % 2 === 0 ? -1 : 1) * grainRX * 1.2;
    const angle = (i % 2 === 0 ? -25 : 25);
    grainEls.push(
      svgElement('ellipse', {
        cx: round2(centerX + dx),
        cy: round2(y),
        rx: round2(grainRX),
        ry: round2(grainRY),
        fill: grainColor,
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.6),
        transform: `rotate(${angle} ${round2(centerX + dx)} ${round2(y)})`,
      }),
    );
  }
  return svgElement('g', {}, stalk + grainEls.join(''));
};
