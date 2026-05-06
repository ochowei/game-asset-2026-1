import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ASSETS_DIR = join(__dirname, '..', 'src', 'subjects', '_assets');
const ROLE_TOKENS = ['{{primary}}', '{{secondary}}', '{{accent}}', '{{neutral}}'];

const subjectFiles = (() => {
  if (!existsSync(ASSETS_DIR)) return [] as string[];
  return readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.svg')).sort();
})();

describe('medieval-fantasy base SVG conventions', () => {
  if (subjectFiles.length === 0) {
    it.skip('no _assets directory yet — skipping', () => {});
    return;
  }

  for (const f of subjectFiles) {
    describe(f, () => {
      const path = join(ASSETS_DIR, f);
      const svg = readFileSync(path, 'utf8');

      it('matches <subject>-<index>.svg pattern', () => {
        expect(f).toMatch(/^[a-z]+(?:-[a-z]+)*-\d+\.svg$/);
      });

      it('is ASCII only', () => {
        expect(/^[\x00-\x7F]*$/.test(svg)).toBe(true);
      });

      it('has viewBox="0 0 64 64"', () => {
        expect(svg).toContain('viewBox="0 0 64 64"');
      });

      it('has no <image> / <script> / <style> / xlink:href', () => {
        expect(svg).not.toContain('<image');
        expect(svg).not.toContain('<script');
        expect(svg).not.toContain('<style');
        expect(svg).not.toContain('xlink:href');
      });

      it('body has single <g> root', () => {
        const open = svg.match(/<svg[^>]*>/);
        const close = svg.lastIndexOf('</svg>');
        expect(open).not.toBeNull();
        expect(close).toBeGreaterThan(-1);
        const body = svg.slice(open!.index! + open![0].length, close).trim();
        expect(body.startsWith('<g')).toBe(true);
      });

      it('uses at least one palette token', () => {
        const hasToken = ROLE_TOKENS.some((t) => svg.includes(t));
        expect(hasToken).toBe(true);
      });
    });
  }

  it('produces exactly 5 bases per subject when present', () => {
    const counts = new Map<string, number>();
    for (const f of subjectFiles) {
      const m = f.match(/^(.+)-\d+\.svg$/);
      if (m) counts.set(m[1] as string, (counts.get(m[1] as string) ?? 0) + 1);
    }
    for (const [subject, n] of counts) {
      expect(n, `${subject} has ${n} bases (expected 5)`).toBe(5);
    }
  });
});
