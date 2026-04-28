import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';

const THEMES: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const SAMPLE = 30;
const OUT = '.qa-sample';

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });

  const sections: string[] = [];
  for (const t of THEMES) {
    const items = generateMany({ theme: t, baseSeed: 'qa', count: SAMPLE, size: 128 });
    const cells = items
      .map(
        (i) =>
          `<figure><div class="ic">${i.svg}</div><figcaption>${i.seed}</figcaption></figure>`,
      )
      .join('');
    sections.push(
      `<section><h2>${t.displayName}</h2><div class="grid">${cells}</div></section>`,
    );
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Procforge QA</title>
<style>
body{margin:0;background:#0e1118;color:#ddd;font-family:system-ui,sans-serif;padding:16px}
section{margin-bottom:32px} h2{color:#fff;border-bottom:1px solid #333;padding-bottom:6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
figure{margin:0;background:#1a1f2c;border-radius:6px;padding:8px;text-align:center}
.ic{background:#fff;border-radius:4px;aspect-ratio:1;display:grid;place-items:center}
.ic svg{width:100%;height:100%}
figcaption{font-size:11px;color:#888;margin-top:4px;word-break:break-all}
</style></head><body>
<h1>Visual QA — 30 icons per theme</h1>
<p>Scan for: blank icons, palette anomalies, shapes outside the 128px box, near-duplicates.</p>
${sections.join('\n')}
</body></html>`;
  await writeFile(join(OUT, 'index.html'), html, 'utf8');
  console.log(`Wrote QA sample → ${join(OUT, 'index.html')}. Open in browser.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
