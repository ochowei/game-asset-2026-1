# Procforge Icons v1.4.0 — itch.io listing draft

> Draft. Publication on itch.io is a separate manual step.

## Tagline

200 deterministic SVG game icons across 4 themes. Same seed, same icon, every time. Offline. MIT.

## Three pillars

- **Deterministic Runtime** — `(theme, seed)` produces byte-identical SVG output. No API calls, no network, no nondeterminism. Runs offline; works inside CI; reproducible across machines.
- **Procedural Variation** — palette × decoration × transform variation expanded from a small set of designed bases. 50 distinct icons per theme from a curated base library.
- **Open-source Generator** — MIT-licensed code, palettes, and committed bases. Readable end-to-end.

## What's new in v1.4.0

- **Medieval Fantasy** theme overhauled: new file-based silhouettes (drawn in Lucide-style aesthetic) for sword, shield, potion, scroll, axe, and gemstone. Cleaner readability at small sizes.
- **Determinism contract preserved**: same seed still produces byte-identical SVG. Other 3 themes (sci-fi, cozy-farm, roguelike-inventory) unchanged from v1.3.1.
- **MIT licensed**, fully offline, deterministic runtime — no AI calls when buyers run the generator.

## What's in the pack

- 200 SVG icons (50 per theme × 4 themes)
- 1000 PNG icons (5 sizes × 200 SVGs)
- `manifest.json` mapping every (theme, seed) → file path
- LICENSE / README / offline gallery HTML

## Themes

- 🗡️ **Medieval Fantasy** — sword, shield, potion, scroll, axe, gemstone
- 🚀 **Sci-Fi** — blaster, chip, orb, hud, cog, antenna
- 🌾 **Cozy Farm** — hoe, fruit, pouch, animal, can, wheat
- 🎒 **Roguelike Inventory** — coin, ring, gem, key, dagger, book

## License

MIT. Use commercially with no royalty. All assets — base SVGs, generator code, palettes — are released under MIT alongside the rest of the repo, friendly for downstream commercial use.

## How to use

Drop the SVG/PNG files into your project. Or `npm install` the open-source generator and run `icongen --theme medieval-fantasy --count 50 --seed myseed --out my-icons --sizes 64,128` to roll your own.
