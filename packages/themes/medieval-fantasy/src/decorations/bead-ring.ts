import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 6 small dots evenly spaced on a circle (every 60 degrees) — a beaded ring,
// like the studs around a shield boss or a coin's edge.
export const beadRing: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
  const sw = Math.max(1, strokeWidth * 0.5);
  const ringR = size * 0.16;
  const dotR = size * 0.05;

  let body = '';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const cx = centerX + Math.cos(a) * ringR;
    const cy = centerY + Math.sin(a) * ringR;
    body += svgElement('circle', {
      cx: round2(cx),
      cy: round2(cy),
      r: round2(dotR),
      fill,
      stroke,
      'stroke-width': sw,
    });
  }

  return svgElement('g', {}, body);
};
