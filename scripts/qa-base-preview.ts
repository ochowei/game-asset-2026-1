// Render candidate SVG bases at multiple sizes for human curation.
// Usage: pnpm tsx scripts/qa-base-preview.ts <input-dir>
// Output: <input-dir>/_preview/<subject>-N-<size>.png + <subject>-sheet.html

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { renderSvgToPng } from '@procforge/cli/render';

const SIZES = [16, 32, 64, 128];
const STAND_IN_PALETTE: Record<string, string> = {
  '{{primary}}': '#a85432',
  '{{secondary}}': '#3a5a4a',
  '{{accent}}': '#d4a73a',
  '{{neutral}}': '#1f1a14',
};

async function main(): Promise<void> {
  const inputDir = process.argv[2];
  if (!inputDir) {
    console.error('Usage: pnpm tsx scripts/qa-base-preview.ts <input-dir>');
    process.exit(1);
  }
  if (!existsSync(inputDir)) {
    console.error(`input-dir does not exist: ${inputDir}`);
    process.exit(1);
  }
  const previewDir = join(inputDir, '_preview');
  mkdirSync(previewDir, { recursive: true });

  const svgs = readdirSync(inputDir).filter((f) => f.endsWith('.svg')).sort();
  const cells: string[] = [];
  for (const f of svgs) {
    let content = readFileSync(join(inputDir, f), 'utf8');
    for (const [tok, hex] of Object.entries(STAND_IN_PALETTE)) {
      content = content.split(tok).join(hex);
    }
    for (const size of SIZES) {
      const buf = await renderSvgToPng(content, size);
      writeFileSync(join(previewDir, `${basename(f, '.svg')}-${size}.png`), buf);
    }
    const stem = basename(f, '.svg');
    cells.push(
      `<figure><figcaption>${stem}</figcaption>` +
        SIZES.map((s) => `<img src="${stem}-${s}.png" width="${s}" height="${s}" alt="${stem}@${s}">`).join('') +
        `</figure>`,
    );
  }

  const html = `<!doctype html><meta charset="utf-8"><title>QA preview</title>
<style>
body{margin:16px;background:#1a1a2e;color:#eee;font-family:system-ui,sans-serif}
figure{display:inline-block;margin:6px;padding:6px;background:#0f1020;border-radius:6px;text-align:center}
figcaption{font-size:11px;margin-bottom:4px;color:#aaa}
img{background:#fff;margin:2px;image-rendering:pixelated}
</style>
${cells.join('\n')}`;
  writeFileSync(join(previewDir, 'index.html'), html, 'utf8');
  console.log(`Wrote ${svgs.length} candidate previews to ${previewDir}/`);
  console.log(`Open ${join(previewDir, 'index.html')} in a browser to curate.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
