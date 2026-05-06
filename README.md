# Procforge Icons

**200 deterministic SVG game icons across 4 themes. Same seed, same icon, every time. Offline. MIT.**

Three pillars:
- **Deterministic Runtime** — `(theme, seed)` produces byte-identical SVG output. No API calls, no network, no nondeterminism.
- **Procedural Variation** — palette × decoration × transform variation expanded from a small set of designed bases.
- **Open-source Generator** — MIT-licensed code, prompts, palettes, and committed bases. Readable end-to-end.

[![CI](https://github.com/procforge/icons/actions/workflows/ci.yml/badge.svg)](https://github.com/procforge/icons/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live preview & free download:** [procforge.itch.io/icons](https://procforge.itch.io/icons)

## What this is

A TypeScript monorepo that procedurally generates SVG game icons across 4 themes:

- 🗡️ Medieval Fantasy
- 🚀 Sci-Fi / Cyberpunk
- 🌾 Cozy Farm
- 🎒 Roguelike Inventory

The output is a `starter-pack.zip` containing 200 SVG + PNG icons, free to use under MIT (commercial use OK).

## Base library (v1.4.0)

The medieval-fantasy theme's base SVGs (`packages/themes/medieval-fantasy/src/subjects/_assets/*.svg`) are drawn in the style of Lucide / Phosphor / Tabler icon libraries — clean line-icon silhouettes recognisable at 32 px. The adaptations are released under MIT alongside the rest of the codebase. See `docs/BASE-AUTHORING.md` for the full pipeline.

The other 3 themes (sci-fi, cozy-farm, roguelike-inventory) remain on the v1.3.1 hand-coded primitive model.

No AI is invoked at runtime. Buyers running the CLI or library get fully deterministic, offline output.

## Quick start (use the icons)

Grab `starter-pack.zip` from the [latest release](https://github.com/procforge/icons/releases) or from the [itch.io listing](https://procforge.itch.io/icons). Unzip and use.

## Quick start (use the generator)

```bash
pnpm install
pnpm build
node packages/cli/dist/cli.js \
  --theme medieval-fantasy --count 50 --seed myseed --out my-icons --sizes 64,128
```

See [`docs/USAGE.md`](docs/USAGE.md) for full CLI reference.

## Quick start (web preview)

```bash
pnpm --filter @procforge/web-preview dev
```

Opens a live in-browser generator at `http://localhost:5173`.

## Repo layout

| Path | Contents |
|---|---|
| `packages/core` | Generator engine (pure, no IO) |
| `packages/themes/*` | 4 themes as plug-in packages |
| `packages/cli` | `icongen` CLI for batch generation + zip packaging |
| `packages/web-preview` | Vite SPA, embeddable as itch HTML5 |
| `scripts/produce-starter-pack.ts` | Builds the official 200-icon pack |
| `docs/` | Architecture, usage, theme authoring |

## License

MIT — see [LICENSE](LICENSE). Commercial use of the generated icons is permitted with no attribution requirement; attribution is appreciated.

## Contributing

Issues and PRs welcome. New theme proposals: see [`docs/THEME-AUTHORING.md`](docs/THEME-AUTHORING.md).

## Launch operations

The non-engineering launch checklist (visual assets, account prep, GTM schedule, KPI tracking) lives in [`docs/LAUNCH-RUNBOOK.md`](docs/LAUNCH-RUNBOOK.md).
