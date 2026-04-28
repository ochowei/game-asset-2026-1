import { describe, it, expect } from 'vitest';
import { renderSvgToPng } from '../src/render';

const sampleSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
  '<circle cx="32" cy="32" r="20" fill="#ff0000"/></svg>';

describe('renderSvgToPng', () => {
  it('produces a PNG buffer with the requested dimensions', { timeout: 30_000 }, async () => {
    const png = await renderSvgToPng(sampleSvg, 64);
    expect(png.length).toBeGreaterThan(100);
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
    expect(png[2]).toBe(0x4e);
    expect(png[3]).toBe(0x47);
  });

  it('renders different sizes', { timeout: 30_000 }, async () => {
    const small = await renderSvgToPng(sampleSvg, 16);
    const large = await renderSvgToPng(sampleSvg, 256);
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('rejects empty SVG input', async () => {
    await expect(renderSvgToPng('', 64)).rejects.toThrow();
  });
});
