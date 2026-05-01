import { intRange, range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const antennaArray: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const accent = pickColor(rng, palette, 'accent');
  const mastLen = range(rng, size * 0.55, size * 0.7);
  const mastTopY = centerY - mastLen / 2;
  const mastBottomY = centerY + mastLen / 2;
  const bars = intRange(rng, 3, 5);

  const mast = svgElement('line', {
    x1: round2(centerX),
    y1: round2(mastTopY),
    x2: round2(centerX),
    y2: round2(mastBottomY),
    stroke,
    'stroke-width': Math.max(2, strokeWidth * 1.3),
    'stroke-linecap': 'round',
  });

  const crossBars: string[] = [];
  for (let i = 0; i < bars; i++) {
    const t = i / Math.max(1, bars - 1);
    const y = mastTopY + t * (mastLen * 0.6);
    const halfW = (size * 0.28) * (1 - t * 0.6);
    crossBars.push(
      svgElement('line', {
        x1: round2(centerX - halfW),
        y1: round2(y),
        x2: round2(centerX + halfW),
        y2: round2(y),
        stroke: i === 0 ? accent : stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.8),
        'stroke-linecap': 'round',
      }),
    );
  }

  return svgElement('g', {}, mast + crossBars.join(''));
};
