import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { renderSvgToPng } from '@procforge/cli/render';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';

const OUT_DIR = 'itch-page';
const VERSION = 'v1.1';
const BASE_SEED = 'cover';
const ICONS_PER_THEME = 12;
const ICON_INTERNAL_SIZE = 64;

const THEMES_GRID: Array<{ theme: Theme; col0: number; row0: number }> = [
  { theme: medievalFantasy, col0: 0, row0: 0 },
  { theme: sciFi, col0: 4, row0: 0 },
  { theme: cozyFarm, col0: 0, row0: 3 },
  { theme: roguelikeInventory, col0: 4, row0: 3 },
];

const W = 1260;
const H = 1000;
const GRID_X = 60;
const GRID_Y = 220;
const GRID_W = 1140;
const GRID_H = 660;
const COLS = 8;
const ROWS = 6;
const CELL_W = GRID_W / COLS;
const CELL_H = GRID_H / ROWS;
const ICON_BOX = 100;

const SUB_COLS = 4;

function placeIcon(svg: string, x: number, y: number, box: number): string {
  return svg.replace(
    /^<svg [^>]*viewBox="([^"]+)"[^>]*>/,
    `<svg x="${x}" y="${y}" width="${box}" height="${box}" viewBox="$1">`,
  );
}

function buildCoverSvg(): string {
  const tiles: string[] = [];
  for (const { theme, col0, row0 } of THEMES_GRID) {
    const icons = generateMany({
      theme,
      baseSeed: BASE_SEED,
      count: ICONS_PER_THEME,
      size: ICON_INTERNAL_SIZE,
    });
    icons.forEach((ic, i) => {
      const localCol = i % SUB_COLS;
      const localRow = Math.floor(i / SUB_COLS);
      const cx = GRID_X + (col0 + localCol) * CELL_W + CELL_W / 2;
      const cy = GRID_Y + (row0 + localRow) * CELL_H + CELL_H / 2;
      const x = cx - ICON_BOX / 2;
      const y = cy - ICON_BOX / 2;
      tiles.push(placeIcon(ic.svg, x, y, ICON_BOX));
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#1a1a2e"/>
  <text x="${W / 2}" y="110" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="700" fill="#ffffff">Procforge Icons</text>
  <text x="${W / 2}" y="170" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#a8a8b8">200 procedural icons · MIT · No AI</text>
  ${tiles.join('\n  ')}
  <g transform="translate(1180,30)">
    <rect width="60" height="32" rx="6" ry="6" fill="#7a7afa"/>
    <text x="30" y="22" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#ffffff">${VERSION}</text>
  </g>
</svg>`;
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const svg = buildCoverSvg();
  const targets: Array<[number, number]> = [
    [315, 250],
    [630, 500],
  ];
  for (const [w, h] of targets) {
    const buf = await renderSvgToPng(svg, w);
    const out = join(OUT_DIR, `cover-${w}x${h}.png`);
    await writeFile(out, buf);
    console.log(`Wrote ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
