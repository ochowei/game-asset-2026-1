import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// A tiny flower: 4 petal circles around a center circle (5 circles total),
// petals every 72 degrees (with one petal slot empty? No — 5 petals every 72
// would be 5; spec asks for 4 petals + 1 center). Petals at angles 0, 90,
// 180, 270 (every 90) plus a central dot.
//
// NOTE: spec says "Petal angles every 72 degrees" but also "4 petals + 1
// center = 5 circles total". We honor the petal-count constraint and use
// 90-degree spacing so the 4 petals are evenly distributed.
export const flowerMini: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const petalFill = pick(rng, palette.secondary);
  const centerFill = pick(rng, palette.accent);
  const sw = Math.max(1, strokeWidth * 0.5);
  const ringR = size * 0.08;
  const petalR = size * 0.04;
  const centerR = size * 0.03;

  let body = '';
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const cx = centerX + Math.cos(a) * ringR;
    const cy = centerY + Math.sin(a) * ringR;
    body += svgElement('circle', {
      cx: round2(cx),
      cy: round2(cy),
      r: round2(petalR),
      fill: petalFill,
      stroke,
      'stroke-width': sw,
    });
  }
  body += svgElement('circle', {
    cx: round2(centerX),
    cy: round2(centerY),
    r: round2(centerR),
    fill: centerFill,
    stroke,
    'stroke-width': sw,
  });

  return svgElement('g', {}, body);
};
