# Procforge Icons

> 200 hand-coded procedural game icons + open-source generator. No AI, infinite variants, MIT-licensed.

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

## Why it exists

itch.io's new-uploads feed is being flooded with AI-generated assets. Procforge is the opposite: every icon comes from hand-written algorithms you can read, fork, and re-run.

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
