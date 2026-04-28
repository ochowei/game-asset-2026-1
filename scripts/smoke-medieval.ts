import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateMany } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

const outDir = join(process.cwd(), '.smoke-medieval');
mkdirSync(outDir, { recursive: true });

const items = generateMany({ theme: medievalFantasy, baseSeed: 'smoke', count: 50, size: 64 });
for (const { seed, svg } of items) {
  writeFileSync(join(outDir, `${seed}.svg`), svg, 'utf8');
}

const indexHtml = `<!doctype html><html><head><meta charset="utf-8"><title>smoke</title>
<style>body{background:#1a1a2e;display:grid;grid-template-columns:repeat(10,1fr);gap:8px;padding:8px}
img{background:#fff;width:64px;height:64px}</style></head><body>
${items.map((i) => `<img src="${i.seed}.svg" title="${i.seed}">`).join('\n')}
</body></html>`;
writeFileSync(join(outDir, 'index.html'), indexHtml, 'utf8');

console.log(`Wrote ${items.length} SVGs and index.html to ${outDir}`);
