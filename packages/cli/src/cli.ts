import mri from 'mri';
import { generateBatch } from './generate';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import type { Theme } from '@procforge/core';

const THEMES: Record<string, Theme> = {
  'medieval-fantasy': medievalFantasy,
  'sci-fi': sciFi,
};

async function main(): Promise<void> {
  const args = mri(process.argv.slice(2), {
    default: { theme: 'medieval-fantasy', seed: 'pf', count: 50, out: 'out', sizes: '16,32,64,128,256' },
    alias: { t: 'theme', s: 'seed', n: 'count', o: 'out' },
  });

  const themeId = String(args.theme);
  const theme = THEMES[themeId];
  if (!theme) {
    console.error(`Unknown theme: ${themeId}. Available: ${Object.keys(THEMES).join(', ')}`);
    process.exit(2);
  }

  const sizes = String(args.sizes)
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (sizes.length === 0) {
    console.error('No valid sizes provided');
    process.exit(2);
  }

  const manifest = await generateBatch({
    theme,
    baseSeed: String(args.seed),
    count: Number(args.count),
    sizes,
    outDir: String(args.out),
  });

  console.log(
    `Generated ${manifest.count} ${theme.id} icons → ${args.out} (${sizes.length} PNG sizes)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
