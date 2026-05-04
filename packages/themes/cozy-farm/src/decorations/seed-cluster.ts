import { range, pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 4 small ellipses arranged in a tight 2x2 cluster, each with slightly
// randomized rotation — a handful of seeds / grains.
export const seedCluster: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
  const sw = Math.max(1, strokeWidth * 0.5);
  const rx = size * 0.04;
  const ry = size * 0.025;
  const offset = size * 0.06;

  const positions: Array<[number, number]> = [
    [-offset, -offset],
    [offset, -offset],
    [-offset, offset],
    [offset, offset],
  ];

  const body = positions
    .map(([dx, dy]) => {
      const cx = centerX + dx;
      const cy = centerY + dy;
      const rot = range(rng, -25, 25);
      return svgElement('ellipse', {
        cx: round2(cx),
        cy: round2(cy),
        rx: round2(rx),
        ry: round2(ry),
        fill,
        stroke,
        'stroke-width': sw,
        transform: `rotate(${round2(rot)} ${round2(cx)} ${round2(cy)})`,
      });
    })
    .join('');

  return svgElement('g', {}, body);
};
