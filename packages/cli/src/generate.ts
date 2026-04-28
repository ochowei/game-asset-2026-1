import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { generateMany, type Theme } from '@procforge/core';
import { renderSvgToPng } from './render';

export interface GenerateBatchOptions {
  theme: Theme;
  baseSeed: string;
  count: number;
  sizes: number[];
  outDir: string;
}

export interface ManifestIcon {
  seed: string;
  svg: string;
  png: Record<string, string>;
}

export interface Manifest {
  theme: string;
  generatedAt: string;
  count: number;
  sizes: number[];
  icons: ManifestIcon[];
}

export async function generateBatch(opts: GenerateBatchOptions): Promise<Manifest> {
  const { theme, baseSeed, count, sizes, outDir } = opts;

  const items = generateMany({ theme, baseSeed, count, size: 64 });

  const themeDir = theme.id;
  await mkdir(join(outDir, 'svg', themeDir), { recursive: true });
  for (const size of sizes) {
    await mkdir(join(outDir, 'png', String(size), themeDir), { recursive: true });
  }

  const manifestIcons: ManifestIcon[] = [];
  for (const { seed, svg } of items) {
    const svgRel = join('svg', themeDir, `${seed}.svg`);
    await writeFile(join(outDir, svgRel), svg, 'utf8');
    const png: Record<string, string> = {};
    for (const size of sizes) {
      const pngRel = join('png', String(size), themeDir, `${seed}.png`);
      const buf = await renderSvgToPng(svg, size);
      await writeFile(join(outDir, pngRel), buf);
      png[String(size)] = pngRel;
    }
    manifestIcons.push({ seed, svg: svgRel, png });
  }

  const manifest: Manifest = {
    theme: theme.id,
    generatedAt: new Date().toISOString(),
    count: items.length,
    sizes,
    icons: manifestIcons,
  };
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}
