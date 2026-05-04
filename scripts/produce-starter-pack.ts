import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { renderSvgToPng } from '@procforge/cli/render';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import JSZip from 'jszip';

const THEMES: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const ICONS_PER_THEME = 50;
const SIZES = [16, 32, 64, 128, 256];
const OUT_DIR = 'starter-pack';
const ZIP_PATH = 'starter-pack.zip';

interface ManifestIcon {
  theme: string;
  seed: string;
  svg: string;
  png: Record<string, string>;
}

async function main(): Promise<void> {
  if (existsSync(OUT_DIR)) await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const allIcons: ManifestIcon[] = [];
  for (const theme of THEMES) {
    console.log(`Generating ${ICONS_PER_THEME} icons for ${theme.id}…`);
    await mkdir(join(OUT_DIR, 'svg', theme.id), { recursive: true });
    for (const size of SIZES) {
      await mkdir(join(OUT_DIR, 'png', String(size), theme.id), { recursive: true });
    }
    const items = generateMany({ theme, baseSeed: 'pf', count: ICONS_PER_THEME, size: 64 });
    for (const { seed, svg } of items) {
      const svgRel = join('svg', theme.id, `${seed}.svg`);
      await writeFile(join(OUT_DIR, svgRel), svg, 'utf8');
      const png: Record<string, string> = {};
      for (const size of SIZES) {
        const pngRel = join('png', String(size), theme.id, `${seed}.png`);
        const buf = await renderSvgToPng(svg, size);
        await writeFile(join(OUT_DIR, pngRel), buf);
        png[String(size)] = pngRel;
      }
      allIcons.push({ theme: theme.id, seed, svg: svgRel, png });
    }
  }

  const manifest = {
    name: 'Procforge Icons starter pack',
    version: '1.1.0',
    generatedAt: new Date().toISOString(),
    themes: THEMES.map((t) => ({ id: t.id, displayName: t.displayName, tags: t.tags })),
    sizes: SIZES,
    iconCount: allIcons.length,
    icons: allIcons,
  };
  await writeFile(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const galleryRows = THEMES.map((t) => {
    const icons = allIcons.filter((i) => i.theme === t.id);
    const cells = icons
      .map((i) => `<img src="${i.svg}" title="${i.seed}" alt="${i.seed}">`)
      .join('');
    return `<section><h2>${t.displayName} <small>(${icons.length})</small></h2><div class="grid">${cells}</div></section>`;
  }).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Procforge Icons — Starter Pack</title><style>
body{margin:0;background:#1a1a2e;color:#e6e6e6;font-family:system-ui,sans-serif;padding:16px}
section{margin-bottom:24px}
h2{color:#fff} small{color:#888;font-weight:normal}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px}
.grid img{background:#fff;border-radius:4px;width:100%;aspect-ratio:1;padding:4px;box-sizing:border-box}
</style></head><body>
<h1>Procforge Icons — 200 procedural game icons</h1>
<p>MIT licensed. Generator on GitHub.</p>
${galleryRows}
</body></html>`;
  await writeFile(join(OUT_DIR, 'index.html'), html, 'utf8');

  await writeFile(
    join(OUT_DIR, 'README.md'),
    `# Procforge Icons — Starter Pack v1.3.0\n\n200 procedural game icons across 4 themes:\n\n${THEMES.map(
      (t) => `- **${t.displayName}** (${ICONS_PER_THEME} icons)`,
    ).join('\n')}\n\nEach icon ships as scalable SVG plus PNG at ${SIZES.join(', ')}px.\n\n## License\nMIT — free for commercial and non-commercial use, attribution appreciated but not required.\n\n## Open-source generator\nhttps://github.com/procforge/icons\n`,
    'utf8',
  );
  await writeFile(
    join(OUT_DIR, 'LICENSE'),
    `MIT License\n\nCopyright (c) 2026 Procforge\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`,
    'utf8',
  );

  const zip = new JSZip();
  function addDir(d: string, prefix: string): void {
    for (const name of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, name.name);
      const rel = prefix ? `${prefix}/${name.name}` : name.name;
      if (name.isDirectory()) addDir(full, rel);
      else zip.file(rel, readFileSync(full));
    }
  }
  addDir(OUT_DIR, '');
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  await writeFile(ZIP_PATH, zipBuf);

  const sz = statSync(ZIP_PATH).size;
  console.log(`\n✓ Starter pack: ${allIcons.length} icons, zip ${(sz / 1024 / 1024).toFixed(2)} MB → ${ZIP_PATH}`);
  if (sz > 6 * 1024 * 1024) {
    console.error(`WARN: zip exceeds 6 MB target (${sz} bytes)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
