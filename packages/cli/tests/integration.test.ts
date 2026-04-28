import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import JSZip from 'jszip';
import { generateBatch } from '../src/generate';
import { packToZip } from '../src/pack';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

describe('integration: batch + pack', () => {
  it('packs a generated batch into a zip with svg + png + manifest', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-int-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 'i',
        count: 10,
        sizes: [64],
        outDir: dir,
      });

      const entries = collect(dir);
      const zipBuf = await packToZip(entries);
      const zipPath = join(dir, 'pack.zip');
      writeFileSync(zipPath, zipBuf);

      const zip = await JSZip.loadAsync(readFileSync(zipPath));
      const names = Object.values(zip.files)
        .filter((f) => !f.dir)
        .map((f) => f.name);
      expect(names).toContain('manifest.json');
      expect(names.filter((n) => n.endsWith('.svg'))).toHaveLength(10);
      expect(names.filter((n) => n.endsWith('.png'))).toHaveLength(10);

      expect(zipBuf.length).toBeLessThan(200_000);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function collect(root: string): { path: string; data: Buffer }[] {
  const out: { path: string; data: Buffer }[] = [];
  walk(root, root, out);
  return out;
}

function walk(root: string, dir: string, out: { path: string; data: Buffer }[]): void {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) walk(root, full, out);
    else out.push({ path: full.slice(root.length + 1).split('\\').join('/'), data: readFileSync(full) });
  }
}
