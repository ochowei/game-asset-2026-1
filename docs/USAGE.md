# Procforge Icons — Usage

## Just want the icons

Download `starter-pack.zip` from [itch](https://procforge.itch.io/icons) or the [latest GitHub release](https://github.com/procforge/icons/releases).

Inside:

```
svg/{theme}/{seed}.svg              # Vector source
png/{16,32,64,128,256}/{theme}/{seed}.png   # Rasterised
manifest.json                        # seed → file paths metadata
index.html                           # Offline gallery
README.md
LICENSE                              # MIT
```

Drop the files into your game project. No attribution required.

## Generate your own (CLI)

### Install

```bash
git clone https://github.com/procforge/icons
cd icons
pnpm install
pnpm build
```

### Generate a single theme

```bash
node packages/cli/dist/cli.js \
  --theme medieval-fantasy \
  --seed myseed \
  --count 50 \
  --sizes 64,128 \
  --out output
```

### Available themes

| ID | Display name | Tags |
|---|---|---|
| `medieval-fantasy` | Medieval Fantasy | weapon, potion, shield, scroll |
| `sci-fi` | Sci-Fi / Cyberpunk | hud, gun, chip, energy |
| `cozy-farm` | Cozy Farm | food, seed, tool, animal |
| `roguelike-inventory` | Roguelike Inventory | inventory, item, potion, rune |

### CLI flags

| Flag | Alias | Default | Description |
|---|---|---|---|
| `--theme` | `-t` | `medieval-fantasy` | Theme ID (see table above) |
| `--seed` | `-s` | `pf` | Base seed string. Same seed → same icons. |
| `--count` | `-n` | `50` | Number of icons to generate |
| `--sizes` |  | `16,32,64,128,256` | Comma-separated PNG sizes |
| `--out` | `-o` | `out` | Output directory |

### Output structure

```
out/
  svg/{theme}/{seed-0000}.svg
  png/{size}/{theme}/{seed-0000}.png
  manifest.json
```

## Generate from your own code

```ts
import { generateMany } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';

const icons = generateMany({
  theme: medievalFantasy,
  baseSeed: 'mygame',
  count: 100,
  size: 64,
});

for (const { seed, svg } of icons) {
  console.log(seed, svg);
}
```

## Web preview

```bash
pnpm --filter @procforge/web-preview dev
```

Live preview at `http://localhost:5173` with theme/seed/count controls and click-to-download.

## Reproducibility

The same `(theme.id, seed)` always produces the same SVG, regardless of platform or version (as long as the theme module is unchanged). This is the procgen guarantee.
