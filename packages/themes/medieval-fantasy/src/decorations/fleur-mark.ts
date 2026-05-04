import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 3 small filled circles arranged in a clover triangle around the center.
// Evokes a heraldic fleur / trefoil mark on banners, shields, and scrolls.
export const fleurMark: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.secondary);
  const sw = Math.max(1, strokeWidth * 0.5);
  const ringR = size * 0.12;
  const dotR = size * 0.07;
  const angles = [-Math.PI / 2, (7 * Math.PI) / 6, -Math.PI / 6];

  const dots = angles
    .map((a) => {
      const cx = centerX + Math.cos(a) * ringR;
      const cy = centerY + Math.sin(a) * ringR;
      return svgElement('circle', {
        cx: round2(cx),
        cy: round2(cy),
        r: round2(dotR),
        fill,
        stroke,
        'stroke-width': sw,
      });
    })
    .join('');

  return svgElement('g', {}, dots);
};
