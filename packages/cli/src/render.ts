import { Resvg } from '@resvg/resvg-js';

export async function renderSvgToPng(svg: string, size: number): Promise<Buffer> {
  if (!svg) throw new Error('renderSvgToPng: empty svg');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  });
  return resvg.render().asPng();
}
