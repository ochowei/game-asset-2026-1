import { range, pickColor, round2, svgElement, type PrimitiveFn } from '@procforge/core';

export const shieldFrame: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pickColor(rng, palette, 'neutral');
  const fill = rng() < 0.5 ? pickColor(rng, palette, 'primary') : pickColor(rng, palette, 'accent');
  // Lucide-aligned: heater shield (rounded flat top, sharper bottom point), wider
  // and slightly taller than v1.2.0 to match `lucide:shield` proportions.
  const halfW = range(rng, size * 0.26, size * 0.30);
  const topY = centerY - range(rng, size * 0.32, size * 0.36);
  const shoulderY = topY + range(rng, size * 0.05, size * 0.08);
  const bottomY = centerY + range(rng, size * 0.34, size * 0.38);

  const outer = `M ${round2(centerX - halfW)} ${round2(topY)}
    Q ${round2(centerX)} ${round2(topY - halfW * 0.08)} ${round2(centerX + halfW)} ${round2(topY)}
    L ${round2(centerX + halfW)} ${round2(shoulderY + size * 0.18)}
    Q ${round2(centerX)} ${round2(bottomY)} ${round2(centerX - halfW)} ${round2(shoulderY + size * 0.18)}
    Z`;
  const innerHalfW = halfW * 0.7;
  const innerTopY = topY + size * 0.05;
  const innerBottomY = bottomY - size * 0.06;
  const inner = `M ${round2(centerX - innerHalfW)} ${round2(innerTopY)}
    Q ${round2(centerX)} ${round2(innerTopY - innerHalfW * 0.12)} ${round2(centerX + innerHalfW)} ${round2(innerTopY)}
    L ${round2(centerX + innerHalfW)} ${round2(innerTopY + size * 0.18)}
    Q ${round2(centerX)} ${round2(innerBottomY)} ${round2(centerX - innerHalfW)} ${round2(innerTopY + size * 0.18)}
    Z`;

  return svgElement(
    'g',
    {},
    svgElement('path', { d: outer, fill, stroke, 'stroke-width': Math.max(2, strokeWidth * 1.4), 'stroke-linejoin': 'round' }) +
      svgElement('path', {
        d: inner,
        fill: 'none',
        stroke,
        'stroke-width': Math.max(1, strokeWidth * 0.7),
        'stroke-linejoin': 'round',
      }),
  );
};
