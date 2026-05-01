import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const seedPouch: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const halfW = range(rng, size * 0.2, size * 0.26);
  const topY = centerY - range(rng, size * 0.18, size * 0.24);
  const bottomY = centerY + range(rng, size * 0.22, size * 0.3);
  const neckW = halfW * 0.5;

  const sack = `M ${round2(centerX - neckW)} ${round2(topY)}
    L ${round2(centerX + neckW)} ${round2(topY)}
    Q ${round2(centerX + halfW * 1.1)} ${round2(centerY)} ${round2(centerX + halfW * 0.6)} ${round2(bottomY)}
    Q ${round2(centerX)} ${round2(bottomY + size * 0.04)} ${round2(centerX - halfW * 0.6)} ${round2(bottomY)}
    Q ${round2(centerX - halfW * 1.1)} ${round2(centerY)} ${round2(centerX - neckW)} ${round2(topY)} Z`;

  const body = svgElement('path', {
    d: sack,
    fill,
    stroke,
    'stroke-width': strokeWidth,
    'stroke-linejoin': 'round',
  });
  const tieY = topY - size * 0.04;
  const tie = svgElement('line', {
    x1: round2(centerX - neckW),
    y1: round2(topY),
    x2: round2(centerX + neckW),
    y2: round2(tieY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });
  const tie2 = svgElement('line', {
    x1: round2(centerX - neckW),
    y1: round2(tieY),
    x2: round2(centerX + neckW),
    y2: round2(topY),
    stroke,
    'stroke-width': Math.max(1, strokeWidth * 0.7),
    'stroke-linecap': 'round',
  });

  return svgElement('g', {}, body + tie + tie2);
};
