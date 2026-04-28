import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateBatch } from '../src/generate';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

describe('generateBatch', () => {
  it('writes SVG and PNG files into the output directory', { timeout: 30_000 }, async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 'test',
        count: 3,
        sizes: [16, 64],
        outDir: dir,
      });
      const svgs = readdirSync(join(dir, 'svg', 'medieval-fantasy'));
      const png16 = readdirSync(join(dir, 'png', '16', 'medieval-fantasy'));
      const png64 = readdirSync(join(dir, 'png', '64', 'medieval-fantasy'));
      expect(svgs).toHaveLength(3);
      expect(png16).toHaveLength(3);
      expect(png64).toHaveLength(3);
      const first = readFileSync(join(dir, 'png', '64', 'medieval-fantasy', png64[0]!));
      expect(first[0]).toBe(0x89);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a manifest.json mapping seed → metadata', { timeout: 30_000 }, async () => {
    const dir = mkdtempSync(join(tmpdir(), 'icongen-'));
    try {
      await generateBatch({
        theme: medievalFantasy,
        baseSeed: 't',
        count: 2,
        sizes: [64],
        outDir: dir,
      });
      const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
      expect(manifest.theme).toBe('medieval-fantasy');
      expect(manifest.icons).toHaveLength(2);
      expect(manifest.icons[0]).toHaveProperty('seed');
      expect(manifest.icons[0]).toHaveProperty('svg');
      expect(manifest.icons[0].png).toEqual({ '64': expect.any(String) });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
