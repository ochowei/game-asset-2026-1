import { pick, round2, svgElement, type PrimitiveFn } from '@procforge/core';

// 3 small filled circles arranged in a horizontal line — like the 3-pip face
// of a die, or a "rarity tier" indicator on inventory icons.
export const dotPip: PrimitiveFn = ({ rng, palette, size, centerX, centerY, strokeWidth }) => {
  const stroke = pick(rng, palette.neutral);
  const fill = pick(rng, palette.accent);
  const sw = Math.max(1, strokeWidth * 0.5);
  const spacing = size * 0.08;
  const dotR = size * 0.035;

  let body = '';
  for (let i = -1; i <= 1; i++) {
    body += svgElement('circle', {
      cx: round2(centerX + i * spacing),
      cy: round2(centerY),
      r: round2(dotR),
      fill,
      stroke,
      'stroke-width': sw,
    });
  }

  return svgElement('g', {}, body);
};
