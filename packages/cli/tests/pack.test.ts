import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { packToZip, type PackEntry } from '../src/pack';

describe('packToZip', () => {
  it('produces a zip containing all entries', async () => {
    const entries: PackEntry[] = [
      { path: 'README.md', data: Buffer.from('hello', 'utf8') },
      { path: 'svg/a.svg', data: Buffer.from('<svg/>', 'utf8') },
      { path: 'png/64/a.png', data: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    ];
    const zipBuf = await packToZip(entries);
    const zip = await JSZip.loadAsync(zipBuf);
    const names = Object.values(zip.files)
      .filter((f) => !f.dir)
      .map((f) => f.name)
      .sort();
    expect(names).toEqual(['README.md', 'png/64/a.png', 'svg/a.svg']);
    expect(await zip.file('README.md')!.async('string')).toBe('hello');
  });

  it('rejects duplicate paths', async () => {
    await expect(
      packToZip([
        { path: 'a', data: Buffer.from('1') },
        { path: 'a', data: Buffer.from('2') },
      ]),
    ).rejects.toThrow(/duplicate/);
  });
});
