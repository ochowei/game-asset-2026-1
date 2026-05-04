import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 3x3 grid of 9 small dots — a tech-pattern decal / pixel cluster.
export const dotGrid: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
  const sw = Math.max(1, strokeWidth * 0.5);
  const spacing = size * 0.08;
  const dotR = size * 0.025;

  let body = '';
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      body += svgElement('circle', {
        cx: round2(centerX + c * spacing),
        cy: round2(centerY + r * spacing),
        r: round2(dotR),
        fill,
        stroke,
        'stroke-width': sw,
      });
    }
  }

  return svgElement('g', {}, body);
};
