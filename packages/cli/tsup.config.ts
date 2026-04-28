import { defineConfig } from 'tsup';
export default defineConfig([
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: true,
    shims: false,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    entry: ['src/render.ts', 'src/pack.ts', 'src/generate.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: false,
  },
]);
