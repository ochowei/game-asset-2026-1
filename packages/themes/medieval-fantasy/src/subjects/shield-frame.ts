import { range, pickColor, svgElement, type PrimitiveFn } from '@procforge/core';

export const shieldFrame: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  const halfW = range(rng, size * 0.22, size * 0.3);
  const topY = centerY - range(rng, size * 0.28, size * 0.34);
  const shoulderY = topY + range(rng, size * 0.05, size * 0.08);
  const bottomY = centerY + range(rng, size * 0.3, size * 0.36);

  const outer = `M ${r(centerX - halfW)} ${r(topY)}
    Q ${r(centerX)} ${r(topY - halfW * 0.15)} ${r(centerX + halfW)} ${r(topY)}
    L ${r(centerX + halfW)} ${r(shoulderY + size * 0.18)}
    Q ${r(centerX)} ${r(bottomY)} ${r(centerX - halfW)} ${r(shoulderY + size * 0.18)}
    Z`;
  const innerHalfW = halfW * 0.7;
  const innerTopY = topY + size * 0.05;
  const innerBottomY = bottomY - size * 0.06;
  const inner = `M ${r(centerX - innerHalfW)} ${r(innerTopY)}
    Q ${r(centerX)} ${r(innerTopY - innerHalfW * 0.12)} ${r(centerX + innerHalfW)} ${r(innerTopY)}
    L ${r(centerX + innerHalfW)} ${r(innerTopY + size * 0.18)}
    Q ${r(centerX)} ${r(innerBottomY)} ${r(centerX - innerHalfW)} ${r(innerTopY + size * 0.18)}
    Z`;

  return svgElement(
    'g',
    {},
    svgElement('path', { d: outer, fill, stroke, 'stroke-width': strokeWidth, 'stroke-linejoin': 'round' }) +
      svgElement('path', {
        d: inner,
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linejoin': 'round',
      }),
  );
};

function r(n: number): number {
  return Math.round(n * 100) / 100;
}
